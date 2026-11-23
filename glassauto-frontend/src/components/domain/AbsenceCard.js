import { View } from 'react-native';
import { useHrData } from '../../hooks/useHrData';
import { ABSENCE_CATEGORIES, ABSENCE_STATES } from '../../data/constants';
import { formatRange } from '../../utils/date';
import { daysLabel } from '../../utils/format';
import { Avatar, Card, IconTile, StatusBadge, Txt } from '../ui';

export function AbsenceCard({ absence, onPress, showEmployee = false, footer }) {
  const { employeesById } = useHrData();
  const employee = employeesById[absence.id_personne];
  const category = absence.categorie ? ABSENCE_CATEGORIES[absence.categorie] : null;
  return (
    <Card
      onPress={onPress}
      footer={footer}
      accessibilityLabel={`Absence ${formatRange(absence.date_absence_debut, absence.date_absence_fin)}`}
    >
      <View className="flex-row items-center gap-3">
        {showEmployee ? (
          <Avatar name={employee.full_name} size={44} />
        ) : (
          <IconTile icon={category ? category.icon : 'calendar-remove-outline'} size={44} />
        )}
        <View className="flex-1">
          <Txt weight="semi" numberOfLines={1}>
            {showEmployee
              ? employee.full_name
              : formatRange(absence.date_absence_debut, absence.date_absence_fin)}
          </Txt>
          <Txt size="sm" tone="mute" numberOfLines={1}>
            {showEmployee
              ? `${employee.poste}, ${employee.centre_nom}`
              : `${category ? category.label : 'Motif non déclaré'}, ${daysLabel(absence.jours)}`}
          </Txt>
        </View>
      </View>
      {showEmployee ? (
        <Txt size="sm" tone="soft" className="mt-3">
          {formatRange(absence.date_absence_debut, absence.date_absence_fin)}, {daysLabel(absence.jours)}
          {category ? `, ${category.label.toLowerCase()}` : ''}
        </Txt>
      ) : null}
      {absence.motif_absence ? (
        <Txt size="sm" tone="soft" className="mt-2" numberOfLines={2}>
          {absence.motif_absence}
        </Txt>
      ) : null}
      <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
        <StatusBadge meta={ABSENCE_STATES[absence.statut_paie]} />
        <Txt size="sm" tone="mute">
          {absence.id_justification}
        </Txt>
      </View>
    </Card>
  );
}
