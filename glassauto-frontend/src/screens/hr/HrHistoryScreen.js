import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { PagedList } from '../../components/domain';
import { AppHeader, EmptyState, IconTile, Screen, SearchBar, Segmented, Txt } from '../../components/ui';
import {
  ABSENCE_STATES,
  DOCUMENT_STATES,
  DOCUMENT_TYPES,
  LEAVE_STATES,
  LEAVE_TYPES,
} from '../../data/constants';
import { useHrData } from '../../hooks/useHrData';
import { formatDateTime } from '../../utils/date';
import { lowerFirst, matches } from '../../utils/format';

const lastTimestamp = (...values) => values.filter(Boolean).sort().pop();

const leaveEntry = (leave) => ({
  id: leave.id_demande,
  kind: 'leaves',
  employeeId: leave.id_demandeur,
  title: LEAVE_TYPES[leave.conge_type].label,
  meta: LEAVE_STATES[leave.state],
  at: lastTimestamp(
    leave.generated_at,
    leave.modified_at,
    leave.cancelled_at,
    leave.validated_respo_at,
    leave.escalated_at,
    leave.validated_tech_at,
    leave.confirmed_at,
    leave.validation_RH_at
  ),
  screen: 'LeaveDetail',
});

const documentEntry = (document) => ({
  id: document.id_demande,
  kind: 'documents',
  employeeId: document.id_demandeur,
  title: DOCUMENT_TYPES[document.type_doc].label,
  meta: DOCUMENT_STATES[document.state],
  at: lastTimestamp(
    document.generated_at,
    document.validation_RH_at,
    document.notified_at,
    document.collected_at
  ),
  screen: 'DocumentDetail',
});

const absenceEntry = (absence) => ({
  id: absence.id_justification,
  kind: 'absences',
  employeeId: absence.id_personne,
  title: 'Absence inopinée',
  meta: ABSENCE_STATES[absence.statut_paie],
  at: lastTimestamp(absence.generated_at, absence.declared_at, absence.validation_RH_at),
  screen: 'AbsenceDetail',
});

export function HrHistoryScreen({ navigation }) {
  const { leaves, documents, absences, employeesById } = useHrData();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const entries = useMemo(
    () =>
      [
        ...leaves.map(leaveEntry),
        ...documents.map(documentEntry),
        ...absences.map(absenceEntry),
      ].sort((a, b) => (a.at < b.at ? 1 : -1)),
    [leaves, documents, absences]
  );
  const visible = entries.filter((entry) => {
    if (filter !== 'all' && entry.kind !== filter) {
      return false;
    }
    if (!query) {
      return true;
    }
    const employee = employeesById[entry.employeeId];
    return matches(`${employee.full_name} ${employee.centre_nom} ${entry.id} ${entry.title}`, query);
  });

  return (
    <Screen
      refreshable
      gap={18}
      header={<AppHeader title="Historique" subtitle="Demandes et décisions horodatées" />}
    >
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'Tout' },
          { value: 'leaves', label: 'Congés' },
          { value: 'documents', label: 'Docs' },
          { value: 'absences', label: 'Absences' },
        ]}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Nom, centre ou référence" />
      {visible.length === 0 ? (
        <EmptyState icon="history" title="Aucun résultat" message="Modifiez la recherche ou le filtre." />
      ) : (
        <PagedList
          items={visible}
          pageSize={25}
          gap="gap-0"
          resetKey={`${filter}-${query}`}
          renderItem={(entry, index, last) => {
            const employee = employeesById[entry.employeeId];
            return (
              <Pressable
                key={entry.id}
                accessibilityRole="button"
                accessibilityLabel={`${entry.title}, ${employee.full_name}, ${entry.meta.label}`}
                onPress={() => navigation.navigate(entry.screen, { id: entry.id })}
                className={`flex-row items-center gap-3 py-3.5 active:opacity-70 ${last ? 'mb-3' : 'border-b border-white/10'}`}
              >
                <IconTile icon={entry.meta.icon} tone={entry.meta.tone} size={42} />
                <View className="flex-1 gap-0.5">
                  <Txt weight="semi" numberOfLines={1}>
                    {employee.full_name}
                  </Txt>
                  <Txt size="sm" tone="soft" numberOfLines={1}>
                    {entry.title}, {lowerFirst(entry.meta.label)}
                  </Txt>
                  <Txt size="xs" tone="mute">
                    {entry.id}, {formatDateTime(entry.at)}
                  </Txt>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}
