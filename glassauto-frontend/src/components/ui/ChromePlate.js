import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { chromeGradient } from '../../theme';

export function ChromePlate({ children, className = '' }) {
  return (
    <View className={`overflow-hidden rounded-plate ${className}`}>
      <LinearGradient
        colors={chromeGradient}
        locations={[0, 0.42, 0.78, 1]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
      />
      <View className="absolute left-0 right-0 top-0 h-px bg-white" />
      <View className="p-5">{children}</View>
    </View>
  );
}
