import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from './Icon';
import { Txt } from './Txt';

export function IconButton({ icon, onPress, label, badge = 0, tone = colors.ink }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-carbon active:opacity-70"
    >
      <Icon name={icon} size={21} color={tone} />
      {badge > 0 ? (
        <View className="absolute -right-0.5 -top-0.5 h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-obsidian bg-crimson px-1">
          <Txt size="xs" weight="bold" tone="white" style={{ fontSize: 10, lineHeight: 13 }}>
            {badge > 9 ? '9+' : badge}
          </Txt>
        </View>
      ) : null}
    </Pressable>
  );
}
