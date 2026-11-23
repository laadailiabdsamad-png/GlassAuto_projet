import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from './Icon';
import { IconTile } from './IconTile';
import { Txt } from './Txt';

export function OptionCard({ icon, title, description, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl border p-3 active:opacity-80 ${selected ? 'border-chrome bg-graphite' : 'border-white/10 bg-carbon'}`}
    >
      <IconTile icon={icon} tone={selected ? 'crimson' : undefined} size={42} />
      <View className="flex-1">
        <Txt weight="semi">{title}</Txt>
        {description ? (
          <Txt size="sm" tone="mute">
            {description}
          </Txt>
        ) : null}
      </View>
      <Icon
        name={selected ? 'radiobox-marked' : 'radiobox-blank'}
        size={22}
        color={selected ? colors.ember : colors.edge}
      />
    </Pressable>
  );
}
