import { Pressable, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconTile } from './IconTile';
import { Txt } from './Txt';

const META = {
  success: { icon: 'check', tone: 'success' },
  error: { icon: 'alert-outline', tone: 'crimson' },
  info: { icon: 'bell-outline', tone: 'sky' },
};

export function Toast({ toast, onHide }) {
  const insets = useSafeAreaInsets();
  if (!toast) {
    return null;
  }
  const meta = META[toast.tone] || META.info;
  return (
    <Animated.View
      key={toast.key}
      entering={FadeInUp.duration(240)}
      exiting={FadeOutUp.duration(180)}
      style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 8, alignItems: 'center' }}
    >
      <Pressable
        accessibilityRole="alert"
        onPress={onHide}
        className="w-full max-w-[520px] flex-row items-center gap-3 rounded-2xl border border-white/15 bg-steel p-3.5"
      >
        <IconTile icon={meta.icon} tone={meta.tone} size={40} />
        <View className="flex-1">
          <Txt weight="semi">{toast.title}</Txt>
          {toast.message ? (
            <Txt size="sm" tone="soft">
              {toast.message}
            </Txt>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
