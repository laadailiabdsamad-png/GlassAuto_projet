import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button } from './Button';
import { Sheet } from './Sheet';
import { TextField } from './TextField';

function DecisionForm({
  visible,
  onClose,
  title,
  subtitle,
  confirmLabel,
  confirmIcon,
  variant = 'chrome',
  commentLabel = 'Commentaire',
  commentPlaceholder,
  required = false,
  onConfirm,
  children,
}) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible) {
      setComment('');
      setError(null);
    }
  }, [visible]);

  const submit = async () => {
    const value = comment.trim();
    if (required && value.length < 5) {
      setError('Indiquez un motif d’au moins 5 caractères.');
      return;
    }
    await onConfirm(value);
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
        <Button label={confirmLabel} icon={confirmIcon} variant={variant} onPress={submit} />
      }
    >
      <View className="gap-4">
        {children}
        <TextField
          label={required ? commentLabel : `${commentLabel} (facultatif)`}
          value={comment}
          onChangeText={(value) => {
            setComment(value);
            setError(null);
          }}
          placeholder={commentPlaceholder}
          multiline
          maxLength={240}
          error={error}
        />
      </View>
    </Sheet>
  );
}

export function DecisionSheet({ visible, onClose, ...content }) {
  const latest = useRef(content);
  if (visible) {
    latest.current = content;
  }
  return <DecisionForm visible={visible} onClose={onClose} {...latest.current} />;
}
