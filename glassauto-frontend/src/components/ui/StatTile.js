import { Pressable, View } from 'react-native';
import { colors, tones } from '../../theme';
import { Icon } from './Icon';
import { Txt } from './Txt';

export function StatTile({ value, label, icon, tone, onPress }) {
  const Container = onPress ? Pressable : View;
  const color = tone ? tones[tone].fg : colors.chrome;
  return (
    <Container
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label} : ${value}`}
      onPress={onPress}
      className={`min-h-[104px] flex-1 justify-between rounded-card border border-white/10 bg-carbon p-4 ${onPress ? 'active:bg-graphite' : ''}`}
    >
      <View className="flex-row items-center justify-between">
        <Txt size="xl" weight="figure">
          {value}
        </Txt>
        <Icon name={icon} size={21} color={color} />
      </View>
      <Txt size="sm" tone="soft" numberOfLines={2}>
        {label}
      </Txt>
    </Container>
  );
}
