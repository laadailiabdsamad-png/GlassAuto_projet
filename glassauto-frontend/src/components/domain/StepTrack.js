import { View } from 'react-native';
import { colors } from '../../theme';
import { Txt } from '../ui';

const FILLS = {
  done: colors.success,
  current: colors.amber,
  rejected: colors.crimson,
  todo: colors.edge,
};

export function StepTrack({ steps }) {
  const current = steps.find((step) => step.status === 'current');
  const rejected = steps.find((step) => step.status === 'rejected');
  const focus = rejected || current || steps[steps.length - 1];
  return (
    <View className="gap-2">
      <View className="flex-row gap-1.5">
        {steps.map((step) => (
          <View
            key={step.key}
            style={{ backgroundColor: FILLS[step.status] }}
            className="h-1.5 flex-1 rounded-full"
          />
        ))}
      </View>
      <Txt size="sm" tone="soft" numberOfLines={1}>
        {current ? `En cours : ${focus.label}` : focus.label}
      </Txt>
    </View>
  );
}
