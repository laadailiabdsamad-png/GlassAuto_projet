import { Modal, View } from 'react-native';
import { Button } from './Button';
import { IconTile } from './IconTile';
import { Txt } from './Txt';

export function ConfirmDialog({ dialog, onClose }) {
  if (!dialog) {
    return null;
  }
  const {
    icon = 'help-circle-outline',
    tone,
    title,
    message,
    confirmLabel,
    cancelLabel = 'Retour',
    danger = false,
  } = dialog;
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => onClose(false)}
    >
      <View className="flex-1 items-center justify-center bg-black/75 px-6">
        <View className="w-full max-w-[400px] items-center gap-3 rounded-plate border border-white/10 bg-graphite p-6">
          <IconTile icon={icon} tone={tone || (danger ? 'crimson' : 'chrome')} size={56} />
          <Txt size="lg" weight="display" align="center" className="mt-1">
            {title}
          </Txt>
          <Txt tone="soft" align="center">
            {message}
          </Txt>
          <View className="mt-3 w-full gap-3">
            <Button
              label={confirmLabel}
              onPress={() => onClose(true)}
              variant={danger ? 'primary' : 'chrome'}
            />
            {cancelLabel ? (
              <Button label={cancelLabel} onPress={() => onClose(false)} variant="outline" />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
