import { View } from 'react-native';
import { tones } from '../../theme';
import { Icon } from './Icon';
import { Txt } from './Txt';

const TEXT_TONES = {
  amber: 'amber',
  sky: 'sky',
  violet: 'violet',
  chrome: 'chrome',
  success: 'success',
  crimson: 'ember',
  mute: 'mute',
};

export function StatusBadge({ meta, label }) {
  const tone = tones[meta.tone];
  return (
    <View className="flex-row">
      <View
        style={{ backgroundColor: tone.bg }}
        className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
      >
        <Icon name={meta.icon} size={14} color={tone.fg} />
        <Txt size="xs" weight="semi" tone={TEXT_TONES[meta.tone]} numberOfLines={1}>
          {label || meta.label}
        </Txt>
      </View>
    </View>
  );
}
