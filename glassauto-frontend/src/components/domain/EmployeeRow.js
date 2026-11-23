import { Pressable, View } from 'react-native';
import { colors } from '../../theme';
import { Avatar, Icon, Txt } from '../ui';

export function EmployeeRow({ employee, presence, caption, onPress, last = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={employee.full_name}
      onPress={onPress}
      className={`min-h-[66px] flex-row items-center gap-3 py-3 active:opacity-70 ${last ? '' : 'border-b border-white/10'}`}
    >
      <Avatar name={employee.full_name} presence={presence} />
      <View className="flex-1">
        <Txt weight="semi" numberOfLines={1}>
          {employee.full_name}
        </Txt>
        <Txt size="sm" tone="mute" numberOfLines={1}>
          {caption || `${employee.poste}, ${employee.centre_nom}`}
        </Txt>
      </View>
      <View className="items-end">
        <Txt weight="figure" size="md">
          {employee.solde_conge}
        </Txt>
        <Txt size="xs" tone="mute">
          jours
        </Txt>
      </View>
      <Icon name="chevron-right" size={22} color={colors.mute} />
    </Pressable>
  );
}
