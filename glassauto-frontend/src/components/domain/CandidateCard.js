import { Pressable, View } from 'react-native';
import { colors, tones } from '../../theme';
import { Avatar, Icon, Txt } from '../ui';

const STATUS = {
  available: { icon: 'check-circle', color: colors.success, tone: 'success' },
  busy: { icon: 'calendar-remove', color: colors.amber, tone: 'amber' },
  unqualified: { icon: 'minus-circle-outline', color: colors.mute, tone: 'mute' },
};

export function CandidateCard({ candidate, selected, onPress, showCentre = false }) {
  const { employee, status, label, sameRegion, region } = candidate;
  const meta = STATUS[status];
  const selectable = status === 'available';
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${employee.full_name}, ${label}`}
      accessibilityState={{ selected, disabled: !selectable }}
      disabled={!selectable}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl border p-3 active:opacity-80 ${selected ? 'border-chrome bg-graphite' : 'border-white/10 bg-carbon'} ${selectable ? '' : 'opacity-60'}`}
    >
      <Avatar name={employee.full_name} size={44} />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Txt weight="semi" className="shrink" numberOfLines={1}>
            {employee.full_name}
          </Txt>
          {sameRegion ? (
            <View style={{ backgroundColor: tones.sky.bg }} className="rounded-full px-2 py-0.5">
              <Txt size="xs" weight="semi" tone="sky">
                Même région
              </Txt>
            </View>
          ) : null}
        </View>
        <Txt size="sm" tone="mute" numberOfLines={1}>
          {showCentre ? `${employee.centre_nom}, ${region}` : employee.poste}
        </Txt>
        <View className="flex-row items-center gap-1.5">
          <Icon name={meta.icon} size={15} color={meta.color} />
          <Txt size="sm" tone={meta.tone} className="flex-1">
            {label}
          </Txt>
        </View>
      </View>
      {selectable ? (
        <Icon
          name={selected ? 'radiobox-marked' : 'radiobox-blank'}
          size={24}
          color={selected ? colors.ember : colors.edge}
        />
      ) : null}
    </Pressable>
  );
}
