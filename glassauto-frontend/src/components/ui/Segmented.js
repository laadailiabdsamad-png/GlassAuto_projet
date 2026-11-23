import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '../../theme';
import { Txt } from './Txt';

export function Segmented({ options, value, onChange }) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const slot = width > 0 ? (width - 10) / options.length : 0;
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withTiming(index * slot, { duration: 220 });
  }, [index, slot, offset]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      className="h-12 flex-row rounded-2xl border border-white/10 bg-carbon p-1"
    >
      {slot > 0 ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 4,
              top: 4,
              bottom: 4,
              width: slot,
              borderRadius: 12,
              backgroundColor: colors.steel,
            },
            thumb,
          ]}
        />
      ) : null}
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className="flex-1 flex-row items-center justify-center gap-1.5 px-1"
          >
            <Txt size="sm" weight="semi" tone={active ? 'ink' : 'mute'} numberOfLines={1}>
              {option.label}
            </Txt>
            {option.count > 0 ? (
              <View
                className={`h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 ${active ? 'bg-crimson' : 'bg-edge'}`}
              >
                <Txt size="xs" weight="bold" tone="white" style={{ fontSize: 11, lineHeight: 14 }}>
                  {option.count}
                </Txt>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
