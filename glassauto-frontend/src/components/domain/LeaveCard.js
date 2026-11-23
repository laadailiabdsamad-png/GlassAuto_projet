import { View } from 'react-native';
import { useHrData } from '../../hooks/useHrData';
import { LEAVE_STATES, LEAVE_TYPES } from '../../data/constants';
import { formatRange, relativeTime } from '../../utils/date';
import { daysLabel } from '../../utils/format';
import { Avatar, Card, IconTile, StatusBadge, Txt } from '../ui';

export function LeaveCard({ leave, onPress, showEmployee = false, stateLabel, footer, children }) {
  const { employeesById } = useHrData();
  const employee = employeesById[leave.id_demandeur];
  const type = LEAVE_TYPES[leave.conge_type];
  return (
    <Card
      onPress={onPress}
      footer={footer}
      accessibilityLabel={`${type.label}, ${formatRange(leave.date_debut, leave.date_fin)}`}
    >
      <View className="flex-row items-center gap-3">
        {showEmployee ? <Avatar name={employee.full_name} size={44} /> : <IconTile icon={type.icon} size={44} />}
        <View className="flex-1">
          <Txt weight="semi" numberOfLines={1}>
            {showEmployee ? employee.full_name : type.label}
          </Txt>
          <Txt size="sm" tone="mute" numberOfLines={1}>
            {showEmployee
              ? `${employee.poste}, ${employee.centre_nom}`
              : `${leave.id_demande}, ${relativeTime(leave.generated_at)}`}
          </Txt>
        </View>
        <View className="items-end">
          <Txt size="lg" weight="figure">
            {leave.jour_demande}
          </Txt>
          <Txt size="xs" tone="mute">
            {daysLabel(leave.jour_demande).split(' ')[1]}
          </Txt>
        </View>
      </View>
      <View className="mt-3 gap-2.5 border-t border-white/10 pt-3">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <Txt size="sm" weight="medium" tone="soft">
            {formatRange(leave.date_debut, leave.date_fin)}
          </Txt>
          <StatusBadge meta={LEAVE_STATES[leave.state]} label={stateLabel} />
        </View>
        {showEmployee ? (
          <Txt size="sm" tone="mute">
            {type.label}, demandé {relativeTime(leave.generated_at)}
          </Txt>
        ) : null}
        {children}
      </View>
    </Card>
  );
}
