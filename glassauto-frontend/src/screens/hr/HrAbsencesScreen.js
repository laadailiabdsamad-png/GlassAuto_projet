import { useState } from 'react';
import { AbsenceCard, PagedList, TabHeader } from '../../components/domain';
import { Button, EmptyState, Screen, SearchBar, Segmented } from '../../components/ui';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { useHrQueues } from '../../hooks/useHrQueues';
import { byNewest, matches } from '../../utils/format';

export function HrAbsencesScreen({ navigation }) {
  const { absences, employeesById, actions } = useHrData();
  const { attempt } = useFeedback();
  const { pendingAbsences, undeclaredAbsences } = useHrQueues();
  const [filter, setFilter] = useState('pending');
  const [query, setQuery] = useState('');
  const pools = {
    pending: pendingAbsences,
    undeclared: undeclaredAbsences,
    closed: absences
      .filter((absence) => ['justifiee', 'non_justifiee'].includes(absence.statut_paie))
      .sort(byNewest),
  };
  const visible = pools[filter].filter((absence) => {
    if (!query) {
      return true;
    }
    const employee = employeesById[absence.id_personne];
    return matches(`${employee.full_name} ${employee.centre_nom}`, query);
  });

  const remind = (absence) =>
    attempt(() => actions.absences.requestJustification(absence.id_justification), {
      title: 'Rappel envoyé',
      message: `${employeesById[absence.id_personne].full_name} est prévenu.`,
    });

  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader
        title="Absences inopinées"
        subtitle="Justifications pour la paie"
        actionIcon="cash-check"
        actionLabel="Contrôle paie"
        onAction={() => navigation.navigate('PayrollCheck')}
      />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'pending', label: 'À vérifier', count: pendingAbsences.length },
          { value: 'undeclared', label: 'Sans motif', count: undeclaredAbsences.length },
          { value: 'closed', label: 'Historique' },
        ]}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Nom ou centre" />
      {visible.length === 0 ? (
        <EmptyState
          icon="calendar-check-outline"
          title="Aucune absence"
          message={query ? 'Modifiez la recherche.' : 'Rien à vérifier dans cette catégorie.'}
        />
      ) : (
        <PagedList
          items={visible}
          resetKey={`${filter}-${query}`}
          renderItem={(absence) => (
            <AbsenceCard
              key={absence.id_justification}
              absence={absence}
              showEmployee
              onPress={() => navigation.navigate('AbsenceDetail', { id: absence.id_justification })}
              footer={
                absence.statut_paie === 'a_justifier' ? (
                  <Button
                    label="Demander la justification"
                    icon="bell-outline"
                    size="sm"
                    variant="subtle"
                    onPress={() => remind(absence)}
                  />
                ) : null
              }
            />
          )}
        />
      )}
    </Screen>
  );
}
