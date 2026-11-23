import { Pressable, View } from 'react-native';
import { colors, tones } from '../../theme';
import { Icon, IconTile, Txt } from '../ui';

export function AlertCard({ icon, tone, title, message, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={{ backgroundColor: tones[tone].bg }}
      className="flex-row items-center gap-3 rounded-card p-4 active:opacity-80"
    >
      <IconTile icon={icon} tone={tone} size={42} />
      <View className="flex-1">
        <Txt weight="semi">{title}</Txt>
        <Txt size="sm" tone="soft">
          {message}
        </Txt>
      </View>
      <Icon name="chevron-right" size={22} color={colors.soft} />
    </Pressable>
  );
}
