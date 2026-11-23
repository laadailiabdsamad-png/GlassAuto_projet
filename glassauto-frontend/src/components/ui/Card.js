import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { glassGradient } from '../../theme';

export function Card({
  children,
  onPress,
  footer,
  className = '',
  padded = true,
  accessibilityLabel,
}) {
  const spacing = padded ? 'p-4' : '';
  return (
    <View
      className={`overflow-hidden rounded-card border border-white/10 bg-carbon ${className}`}
    >
      <LinearGradient
        colors={glassGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
      />
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          className={`active:bg-white/5 ${spacing}`}
        >
          {children}
        </Pressable>
      ) : (
        <View className={spacing}>{children}</View>
      )}
      {footer ? <View className="px-4 pb-4">{footer}</View> : null}
    </View>
  );
}
