import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme';

const START = -120;
const SWEEP = 240;

const toPoint = (center, radius, degrees) => {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: center + radius * Math.cos(radians), y: center + radius * Math.sin(radians) };
};

const arc = (center, radius, from, to) => {
  const start = toPoint(center, radius, from);
  const end = toPoint(center, radius, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`;
};

export function Gauge({ value, max, size = 168, redline = 0.18, ticks = 24, children }) {
  const center = size / 2;
  const outer = center - 5;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const angle = useSharedValue(START);

  useEffect(() => {
    angle.value = withDelay(
      180,
      withTiming(START + SWEEP * ratio, { duration: 1100, easing: Easing.out(Easing.cubic) })
    );
  }, [ratio, angle]);

  const needle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));

  const marks = Array.from({ length: ticks + 1 }, (_, index) => {
    const position = index / ticks;
    const degrees = START + SWEEP * position;
    const major = index % 6 === 0;
    return {
      key: index,
      from: toPoint(center, outer, degrees),
      to: toPoint(center, outer - (major ? 15 : 9), degrees),
      major,
      color: position <= redline ? colors.crimson : colors.obsidian,
    };
  });

  return (
    <View style={{ width: size, height: size * 0.97 }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Path
          d={arc(center, outer - 21, START + SWEEP * redline, START + SWEEP)}
          stroke="rgba(8,8,8,0.16)"
          strokeWidth={2}
          fill="none"
        />
        <Path
          d={arc(center, outer - 21, START, START + SWEEP * redline)}
          stroke={colors.crimson}
          strokeWidth={3}
          fill="none"
        />
        {marks.map((mark) => (
          <Line
            key={mark.key}
            x1={mark.from.x}
            y1={mark.from.y}
            x2={mark.to.x}
            y2={mark.to.y}
            stroke={mark.color}
            strokeWidth={mark.major ? 3 : 1.5}
            strokeOpacity={mark.major ? 1 : 0.6}
          />
        ))}
      </Svg>
      <Animated.View
        style={[{ position: 'absolute', width: size, height: size, pointerEvents: 'none' }, needle]}
      >
        <Svg width={size} height={size}>
          <Polygon
            points={`${center - 3.5},${center + 8} ${center},${center - outer + 18} ${center + 3.5},${center + 8}`}
            fill={colors.crimson}
          />
          <Circle cx={center} cy={center} r={8} fill={colors.obsidian} />
          <Circle cx={center} cy={center} r={3} fill={colors.chrome} />
        </Svg>
      </Animated.View>
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {children}
      </View>
    </View>
  );
}
