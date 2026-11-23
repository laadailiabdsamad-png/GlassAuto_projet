import { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { Icon } from './Icon';
import { Txt } from './Txt';

export function Sheet({ visible, onClose, title, subtitle, children, footer }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = visible
      ? withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) })
      : 0;
  }, [visible, progress]);

  const panel = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 420 }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end' }}
        behavior="padding"
      >
        <Pressable
          accessibilityLabel="Fermer"
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.72)',
          }}
        />
        <Animated.View
          style={[
            {
              maxHeight: height * 0.88,
              width: '100%',
              maxWidth: 720,
              alignSelf: 'center',
              backgroundColor: colors.graphite,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: 'rgba(255,255,255,0.12)',
            },
            panel,
          ]}
        >
          <View className="items-center pt-3">
            <View className="h-1 w-11 rounded-full bg-edge" />
          </View>
          <View className="flex-row items-start gap-3 px-5 pb-3 pt-4">
            <View className="flex-1 gap-1">
              <Txt size="lg" weight="display">
                {title}
              </Txt>
              {subtitle ? (
                <Txt size="sm" tone="soft">
                  {subtitle}
                </Txt>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={onClose}
              hitSlop={10}
              className="h-9 w-9 items-center justify-center rounded-full bg-steel active:opacity-70"
            >
              <Icon name="close" size={19} color={colors.soft} />
            </Pressable>
          </View>
          <ScrollView
            style={{ flexShrink: 1 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 6,
              paddingBottom: footer ? 16 : insets.bottom + 24,
            }}
          >
            {children}
          </ScrollView>
          {footer ? (
            <View
              style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
              className="gap-3 border-t border-white/10 px-5 pt-4"
            >
              {footer}
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
