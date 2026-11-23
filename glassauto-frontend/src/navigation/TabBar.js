import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Txt } from '../components/ui';
import { colors } from '../theme';

function Indicator({ active }) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 240 });
  }, [active, progress]);

  const style = useAnimatedStyle(() => ({
    width: 4 + progress.value * 22,
    opacity: progress.value,
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', top: 0, height: 3, borderRadius: 2, backgroundColor: colors.crimson },
        style,
      ]}
    />
  );
}

function TabItem({ active, icon, activeIcon, label, badge, onPress, onLongPress }) {
  const { width } = useWindowDimensions();
  const labelStyle = width < 360 ? { fontSize: 10, lineHeight: 14 } : undefined;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center justify-center gap-1 active:opacity-70"
    >
      <Indicator active={active} />
      <View>
        <Icon name={active ? activeIcon : icon} size={24} color={active ? colors.ink : colors.mute} />
        {badge > 0 ? (
          <View className="absolute -right-2.5 -top-1.5 h-[18px] min-w-[18px] items-center justify-center rounded-full bg-crimson px-1">
            <Txt weight="bold" tone="white" style={{ fontSize: 10, lineHeight: 13 }}>
              {badge > 9 ? '9+' : badge}
            </Txt>
          </View>
        ) : null}
      </View>
      <Txt
        size="xs"
        weight={active ? 'semi' : 'medium'}
        tone={active ? 'ink' : 'mute'}
        numberOfLines={1}
        style={labelStyle}
      >
        {label}
      </Txt>
    </Pressable>
  );
}

function CenterAction({ label, onPress }) {
  return (
    <View className="flex-1 items-center justify-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        className="h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-crimson active:opacity-80"
      >
        <Icon name="plus" size={30} color="#ffffff" />
      </Pressable>
    </View>
  );
}

export function TabBar({ state, descriptors, navigation, onCenterPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 12,
        paddingBottom: Math.max(insets.bottom, 12),
        pointerEvents: 'box-none',
      }}
    >
      <LinearGradient
        colors={['rgba(8,8,8,0)', 'rgba(8,8,8,0.96)']}
        locations={[0, 0.72]}
        style={[StyleSheet.absoluteFill, { top: -28, pointerEvents: 'none' }]}
      />
      <View
        style={{ width: '100%', maxWidth: 640, alignSelf: 'center' }}
        className="h-[70px] overflow-hidden rounded-[24px] border border-white/15"
      >
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                Platform.OS === 'android' ? 'rgba(22,21,21,0.98)' : 'rgba(22,21,21,0.8)',
            },
          ]}
        />
        <View className="flex-1 flex-row px-1">
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const active = state.index === index;
            if (options.centerAction) {
              return (
                <CenterAction key={route.key} label={options.title} onPress={onCenterPress} />
              );
            }
            const handlePress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!active && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };
            return (
              <TabItem
                key={route.key}
                active={active}
                icon={options.icon}
                activeIcon={options.activeIcon || options.icon}
                label={options.title}
                badge={options.tabBarBadge || 0}
                onPress={handlePress}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}
