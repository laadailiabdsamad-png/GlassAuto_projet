import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from './Icon';
import { IconTile } from './IconTile';
import { Txt } from './Txt';

export function ListRow({ icon, tone, title, subtitle, value, onPress, trailing, last = false }) {
  const Container = onPress ? Pressable : View;
  return (
    <Container
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      className={`min-h-[60px] flex-row items-center gap-3 py-3 ${last ? '' : 'border-b border-white/10'} ${onPress ? 'active:opacity-70' : ''}`}
    >
      {icon ? <IconTile icon={icon} tone={tone} size={40} /> : null}
      <View className="flex-1 gap-0.5">
        <Txt weight="medium">{title}</Txt>
        {subtitle ? (
          <Txt size="sm" tone="mute">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {value ? (
        <Txt size="sm" weight="semi" tone="soft" className="max-w-[52%]" align="right">
          {value}
        </Txt>
      ) : null}
      {trailing}
      {onPress && !trailing ? <Icon name="chevron-right" size={22} color={colors.mute} /> : null}
    </Container>
  );
}
