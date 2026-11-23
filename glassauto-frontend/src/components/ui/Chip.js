import { Pressable } from 'react-native';
import { colors } from '../../theme';
import { Icon } from './Icon';
import { Txt } from './Txt';

export function Chip({ label, icon, selected = false, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`h-11 flex-row items-center gap-2 rounded-full border px-4 active:opacity-80 ${selected ? 'border-chrome bg-chrome' : 'border-edge bg-carbon'}`}
    >
      {icon ? (
        <Icon name={icon} size={17} color={selected ? colors.obsidian : colors.soft} />
      ) : null}
      <Txt size="sm" weight="semi" tone={selected ? 'obsidian' : 'soft'} numberOfLines={1}>
        {label}
      </Txt>
    </Pressable>
  );
}
