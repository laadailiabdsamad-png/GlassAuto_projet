import { View } from 'react-native';
import { colors } from '../../theme';
import { formatDateTime } from '../../utils/date';
import { useHrData } from '../../hooks/useHrData';
import { Icon } from './Icon';
import { Txt } from './Txt';

const MARKERS = {
  done: { icon: 'check', background: colors.success, color: colors.obsidian },
  current: { icon: 'dots-horizontal', background: colors.amber, color: colors.obsidian },
  rejected: { icon: 'close', background: colors.crimson, color: '#ffffff' },
  todo: { icon: null, background: colors.steel, color: colors.mute },
};

export function Timeline({ steps }) {
  const { employeesById } = useHrData();
  return (
    <View>
      {steps.map((step, index) => {
        const marker = MARKERS[step.status];
        const last = index === steps.length - 1;
        const actor = step.actorId ? employeesById[step.actorId] : null;
        const substitute = step.substituteId ? employeesById[step.substituteId] : null;
        return (
          <View key={step.key} className="flex-row gap-3">
            <View className="items-center">
              <View
                style={{ backgroundColor: marker.background }}
                className="h-7 w-7 items-center justify-center rounded-full"
              >
                {marker.icon ? <Icon name={marker.icon} size={16} color={marker.color} /> : null}
              </View>
              {last ? null : (
                <View
                  style={{ backgroundColor: step.status === 'done' ? colors.success : colors.steel }}
                  className="my-1 w-0.5 flex-1"
                />
              )}
            </View>
            <View className={`flex-1 gap-1 pt-0.5 ${last ? '' : 'pb-5'}`}>
              <Txt weight="semi" tone={step.status === 'todo' ? 'mute' : 'ink'}>
                {step.label}
              </Txt>
              {step.at ? (
                <Txt size="sm" tone="mute">
                  {actor ? `${actor.full_name}, ` : ''}
                  {formatDateTime(step.at)}
                </Txt>
              ) : step.hint ? (
                <Txt size="sm" tone="mute">
                  {step.hint}
                </Txt>
              ) : null}
              {substitute ? (
                <View className="flex-row items-center gap-1.5">
                  <Icon name="account-switch-outline" size={16} color={colors.sky} />
                  <Txt size="sm" tone="soft" className="flex-1">
                    Substitut : {substitute.full_name}, {substitute.centre_nom}
                  </Txt>
                </View>
              ) : null}
              {step.comment ? (
                <View className="mt-1 rounded-xl bg-steel px-3 py-2">
                  <Txt size="sm" tone="soft">
                    {step.comment}
                  </Txt>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
