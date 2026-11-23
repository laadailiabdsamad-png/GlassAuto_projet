import { View } from 'react-native';
import { colors } from '../../theme';
import { initials } from '../../utils/format';
import { Txt } from './Txt';

export function Avatar({ name, size = 42, presence }) {
  const dot = presence === 'present' ? colors.success : presence === 'absent' ? colors.crimson : null;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className="items-center justify-center border border-white/15 bg-steel"
      >
        <Txt size={size >= 60 ? 'lg' : size >= 40 ? 'sm' : 'xs'} weight="display" tone="chrome">
          {initials(name)}
        </Txt>
      </View>
      {dot ? (
        <View
          style={{ backgroundColor: dot }}
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-carbon"
        />
      ) : null}
    </View>
  );
}
