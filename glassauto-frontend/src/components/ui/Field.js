import { View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from './Icon';
import { Txt } from './Txt';

export function Field({ label, hint, error, children }) {
  return (
    <View className="gap-2">
      {label ? (
        <Txt size="sm" weight="semi" tone="soft">
          {label}
        </Txt>
      ) : null}
      {children}
      {error ? (
        <View className="flex-row items-start gap-1.5">
          <View className="pt-px">
            <Icon name="alert-circle-outline" size={16} color={colors.ember} />
          </View>
          <Txt size="sm" tone="ember" className="flex-1">
            {error}
          </Txt>
        </View>
      ) : hint ? (
        <Txt size="sm" tone="mute">
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}
