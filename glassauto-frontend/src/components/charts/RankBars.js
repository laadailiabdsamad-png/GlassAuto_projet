import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { Txt } from '../ui';

export function RankBars({ data, unit, onSelect }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <View className="gap-3">
      {data.map((item) => {
        const Container = onSelect ? Pressable : View;
        return (
          <Container
            key={item.label}
            onPress={onSelect ? () => onSelect(item) : undefined}
            accessibilityRole={onSelect ? 'button' : undefined}
            className="gap-1.5"
          >
            <View className="flex-row items-center justify-between gap-3">
              <Txt size="sm" tone="soft" className="flex-1" numberOfLines={1}>
                {item.label}
              </Txt>
              <Txt size="sm" weight="semi">
                {item.value}
                {unit ? ` ${unit}` : ''}
              </Txt>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-steel">
              <View
                style={{
                  width: `${Math.max(2, (item.value / max) * 100)}%`,
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: item.color || colors.crimson,
                }}
              />
            </View>
          </Container>
        );
      })}
    </View>
  );
}
