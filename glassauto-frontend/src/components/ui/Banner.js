import { View } from 'react-native';
import { tones } from '../../theme';
import { Icon } from './Icon';
import { Txt } from './Txt';

export function Banner({ tone = 'sky', icon = 'information-outline', title, message, children }) {
  const palette = tones[tone];
  return (
    <View style={{ backgroundColor: palette.bg }} className="flex-row gap-3 rounded-2xl p-4">
      <View className="pt-px">
        <Icon name={icon} size={20} color={palette.fg} />
      </View>
      <View className="flex-1 gap-1">
        {title ? <Txt weight="semi">{title}</Txt> : null}
        {message ? (
          <Txt size="sm" tone="soft">
            {message}
          </Txt>
        ) : null}
        {children}
      </View>
    </View>
  );
}
