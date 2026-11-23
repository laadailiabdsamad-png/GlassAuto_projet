import { View } from 'react-native';
import { Button } from './Button';
import { IconTile } from './IconTile';
import { Txt } from './Txt';

export function EmptyState({ icon = 'inbox-outline', title, message, actionLabel, onAction }) {
  return (
    <View className="items-center gap-2 rounded-card border border-dashed border-edge px-6 py-9">
      <IconTile icon={icon} size={54} />
      <Txt weight="display" size="md" align="center" className="mt-2">
        {title}
      </Txt>
      {message ? (
        <Txt size="sm" tone="soft" align="center">
          {message}
        </Txt>
      ) : null}
      {actionLabel ? (
        <Button label={actionLabel} onPress={onAction} variant="subtle" size="sm" className="mt-3" />
      ) : null}
    </View>
  );
}
