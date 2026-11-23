import { View } from 'react-native';
import { colors } from '../../theme';

const FILLS = {
  alert: colors.crimson,
  off: 'rgba(8,8,8,0.2)',
  on: colors.obsidian,
};

export function SegmentMeter({ segments, height = 30 }) {
  return (
    <View style={{ height }} className="flex-row gap-[3px]">
      {segments.map((segment, index) => (
        <View
          key={index}
          style={{ flex: 1, borderRadius: 2, backgroundColor: FILLS[segment] }}
        />
      ))}
    </View>
  );
}
