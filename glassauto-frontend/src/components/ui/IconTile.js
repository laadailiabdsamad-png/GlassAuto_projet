import { View } from 'react-native';
import { colors, tones } from '../../theme';
import { Icon } from './Icon';

export function IconTile({ icon, tone, size = 42 }) {
  const palette = tone ? tones[tone] : { fg: colors.chrome, bg: colors.steel };
  return (
    <View
      style={{ width: size, height: size, backgroundColor: palette.bg, borderRadius: size * 0.3 }}
      className="items-center justify-center"
    >
      <Icon name={icon} size={Math.round(size * 0.52)} color={palette.fg} />
    </View>
  );
}
