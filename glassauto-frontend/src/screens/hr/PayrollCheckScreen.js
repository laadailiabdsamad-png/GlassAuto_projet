import { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  AppHeader,
  Avatar,
  Card,
  EmptyState,
  IconButton,
  Screen,
  SearchBar,
  SectionHeader,
  StatusBadge,
  Txt,
} from '../../components/ui';
import { ABSENCE_STATES } from '../../data/constants';
import { useHrData } from '../../hooks/useHrData';
import { addMonths, formatRange, monthLabel, today } from '../../utils/date';
import { daysLabel, groupBy, matches } from '../../utils/format';

const sumDays = (items) => items.reduce((total, absence) => total + absence.jours, 0);

function Total({ value, label, tone }) {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Txt size="xl" weight="figure" tone={tone} align="center">
        {value}
      </Txt>
      <Txt size="xs" tone="mute" align="center">
        {label}
      </Txt>
    </View>
  );
}

export function PayrollCheckScreen({ navigation }) {
  const { absences, employeesById } = useHrData();
  const [month, setMonth] = useState(today());
  const [query, setQuery] = useState('');
  const key = month.slice(0, 7);
  const current = today().slice(0, 7);
  const monthly = absences.filter((absence) => absence.date_absence_debut.startsWith(key));
  const byState = groupBy(monthly, (absence) => absence.statut_paie);
  const open = [...(byState.en_attente || []), ...(byState.a_justifier || [])];
  const groups = Object.entries(groupBy(monthly, (absence) => absence.id_personne))
    .map(([id, items]) => ({ employee: employeesById[id], items }))
    .filter(
      ({ employee }) =>
        !query || matches(`${employee.full_name} ${employee.centre_nom} ${employee.matricule}`, query)
    )
    .sort((a, b) => a.employee.full_name.localeCompare(b.employee.full_name));

  return (
    <Screen
      refreshable
      gap={18}
      header={<AppHeader title="Contrôle paie" subtitle="Absences non planifiées par agent" />}
    >
      <View className="flex-row items-center justify-between">
        <IconButton
          icon="chevron-left"
          label="Mois précédent"
          onPress={() => setMonth((value) => addMonths(value, -1))}
        />
        <Txt size="md" weight="display" align="center" className="flex-1">
          {monthLabel(month)}
        </Txt>
        {key < current ? (
          <IconButton
            icon="chevron-right"
            label="Mois suivant"
            onPress={() => setMonth((value) => addMonths(value, 1))}
          />
        ) : (
          <View className="h-11 w-11" />
        )}
      </View>
      <Card>
        <View className="flex-row">
          <Total value={sumDays(byState.justifiee || [])} label="Jours justifiés" tone="success" />
          <View className="w-px bg-white/10" />
          <Total value={sumDays(byState.non_justifiee || [])} label="Jours retenus" tone="ember" />
          <View className="w-px bg-white/10" />
          <Total value={sumDays(open)} label="À traiter" tone="amber" />
        </View>
      </Card>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Nom, centre ou matricule" />
      <View className="gap-3">
        <SectionHeader title="Agents concernés" count={groups.length} />
        {groups.length === 0 ? (
          <EmptyState
            icon="cash-check"
            title="Aucune absence à contrôler"
            message="Aucune absence inopinée pour ce mois."
          />
        ) : (
          groups.map(({ employee, items }) => (
            <Card key={employee.id_personne}>
              <View className="flex-row items-center gap-3">
                <Avatar name={employee.full_name} size={42} />
                <View className="flex-1">
                  <Txt weight="semi">{employee.full_name}</Txt>
                  <Txt size="sm" tone="mute">
                    {employee.matricule}, {employee.centre_nom}
                  </Txt>
                </View>
                <Txt size="md" weight="figure">
                  {daysLabel(sumDays(items))}
                </Txt>
              </View>
              <View className="mt-3 border-t border-white/10 pt-1">
                {items.map((absence) => (
                  <Pressable
                    key={absence.id_justification}
                    accessibilityRole="button"
                    onPress={() =>
                      navigation.navigate('AbsenceDetail', { id: absence.id_justification })
                    }
                    className="min-h-[48px] flex-row items-center justify-between gap-3 active:opacity-70"
                  >
                    <Txt size="sm" tone="soft" className="flex-1">
                      {formatRange(absence.date_absence_debut, absence.date_absence_fin, { hideYear: true })}
                    </Txt>
                    <StatusBadge meta={ABSENCE_STATES[absence.statut_paie]} />
                  </Pressable>
                ))}
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}
