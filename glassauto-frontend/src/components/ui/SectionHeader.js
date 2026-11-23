import { Pressable, View } from 'react-native';
import { Txt } from './Txt';

export function SectionHeader({ title, actionLabel, onAction, count }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center gap-2">
        <Txt size="md" weight="display" accessibilityRole="header">
          {title}
        </Txt>
        {count > 0 ? (
          <Txt size="md" weight="display" tone="mute">
            {count}
          </Txt>
        ) : null}
      </View>
      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          hitSlop={12}
          className="active:opacity-60"
        >
          <Txt size="sm" weight="semi" tone="ember">
            {actionLabel}
          </Txt>
        </Pressable>
      ) : null}
    </View>
  );
}
