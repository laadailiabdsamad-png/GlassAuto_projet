import { Switch, View } from 'react-native';
import { colors } from '../../theme';
import { IconTile } from './IconTile';
import { Txt } from './Txt';

export function SwitchRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
  last = false,
}) {
  return (
    <View
      className={`min-h-[60px] flex-row items-center gap-3 py-3 ${last ? '' : 'border-b border-white/10'}`}
    >
      {icon ? <IconTile icon={icon} size={40} /> : null}
      <View className="flex-1 gap-0.5">
        <Txt weight="medium">{title}</Txt>
        {subtitle ? (
          <Txt size="sm" tone="mute">
            {subtitle}
          </Txt>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.edge, true: colors.crimson }}
        thumbColor="#ffffff"
        ios_backgroundColor={colors.edge}
      />
    </View>
  );
}
