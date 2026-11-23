import { Pressable } from 'react-native';
import { IconTile, Txt } from '../ui';

export function QuickAction({ icon, label, tone, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="min-h-[112px] flex-1 justify-between rounded-card border border-white/10 bg-carbon p-3.5 active:bg-graphite"
    >
      <IconTile icon={icon} tone={tone} size={40} />
      <Txt size="sm" weight="semi" numberOfLines={2}>
        {label}
      </Txt>
    </Pressable>
  );
}
