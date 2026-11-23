import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme';

export function Skeleton({ height = 18, width = '100%', radius = 10 }) {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[{ height, width, borderRadius: radius, backgroundColor: colors.steel }, style]}
    />
  );
}

export function SkeletonScreen() {
  return (
    <View className="flex-1 gap-5 bg-obsidian px-5 pt-20">
      <Skeleton height={34} width="55%" />
      <Skeleton height={190} radius={28} />
      <Skeleton height={84} radius={20} />
      <Skeleton height={84} radius={20} />
      <Skeleton height={84} radius={20} />
    </View>
  );
}
