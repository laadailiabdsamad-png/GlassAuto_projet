import { View } from 'react-native';
import { Avatar, Card, EmptyState, SectionHeader, Txt } from '../../../components/ui';
import { useHrData } from '../../../hooks/useHrData';
import { colors } from '../../../theme';
import { countWorkingDays, formatRange, MONTHS_SHORT } from '../../../utils/date';
import { daysLabel, groupBy } from '../../../utils/format';

export function PlanCoverage({ plan }) {
  const counts = MONTHS_SHORT.map((label, index) => {
    const month = `${plan.annee}-${String(index + 1).padStart(2, '0')}`;
    const people = new Set(
      plan.periods
        .filter(
          (period) => period.date_debut.slice(0, 7) <= month && period.date_fin.slice(0, 7) >= month
        )
        .map((period) => period.id_personne)
    ).size;
    return { label: label.charAt(0).toUpperCase(), people, key: month };
  });
  const max = Math.max(...counts.map((item) => item.people), 1);

  return (
    <Card>
      <Txt size="sm" tone="soft">
        Absences prévues par mois
      </Txt>
      <View className="mt-4 h-[92px] flex-row items-end gap-1.5">
        {counts.map((item) => (
          <View key={item.key} className="flex-1 items-center gap-1">
            <Txt size="xs" weight="semi" tone={item.people > 0 ? 'ink' : 'mute'}>
              {item.people > 0 ? item.people : ''}
            </Txt>
            <View
              style={{
                width: '100%',
                maxWidth: 20,
                height: Math.max(3, (item.people / max) * 48),
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                backgroundColor: item.people > 0 ? colors.crimson : colors.steel,
              }}
            />
            <Txt size="xs" tone="mute">
              {item.label}
            </Txt>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function PlanMembers({ plan, renderAction }) {
  const { employeesById } = useHrData();
  const groups = groupBy(
    [...plan.periods].sort((a, b) => (a.date_debut > b.date_debut ? 1 : -1)),
    (period) => period.id_personne
  );
  const ids = Object.keys(groups);

  return (
    <View className="gap-3">
      <SectionHeader title="Périodes par collaborateur" count={plan.periods.length} />
      {ids.length === 0 ? (
        <EmptyState
          icon="calendar-plus"
          title="Aucune période planifiée"
          message="Ajoutez les congés prévus de chaque membre de l’équipe."
        />
      ) : (
        ids.map((id) => {
          const employee = employeesById[id];
          return (
            <Card key={id}>
              <View className="flex-row items-center gap-3">
                <Avatar name={employee.full_name} size={40} />
                <View className="flex-1">
                  <Txt weight="semi">{employee.full_name}</Txt>
                  <Txt size="sm" tone="mute">
                    {employee.poste}
                  </Txt>
                </View>
              </View>
              <View className="mt-3 border-t border-white/10 pt-1">
                {groups[id].map((period) => (
                  <View key={period.id} className="min-h-[46px] flex-row items-center gap-3">
                    <Txt size="sm" weight="medium" className="flex-1">
                      {formatRange(period.date_debut, period.date_fin)}
                    </Txt>
                    <Txt size="sm" tone="mute">
                      {daysLabel(countWorkingDays(period.date_debut, period.date_fin))}
                    </Txt>
                    {renderAction ? renderAction(period) : null}
                  </View>
                ))}
              </View>
            </Card>
          );
        })
      )}
    </View>
  );
}
