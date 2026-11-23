import { useState } from 'react';
import { View } from 'react-native';
import { AbsenceCard, PagedList } from '../../components/domain';
import { AppHeader, EmptyState, Screen, Segmented } from '../../components/ui';
import { useTeam } from '../../hooks/useTeam';

export function TeamAbsencesScreen({ navigation }) {
  const { absences } = useTeam();
  const [filter, setFilter] = useState('open');
  const groups = {
    open: absences.filter((absence) => ['a_justifier', 'en_attente'].includes(absence.statut_paie)),
    closed: absences.filter((absence) => ['justifiee', 'non_justifiee'].includes(absence.statut_paie)),
  };
  const visible = groups[filter];

  return (
    <Screen
      refreshable
      gap={18}
      header={<AppHeader title="Absences de l’équipe" subtitle="Absences inopinées et justifications" />}
    >
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: 'En cours', count: groups.open.length },
          { value: 'closed', label: 'Historique' },
        ]}
      />
      {visible.length === 0 ? (
        <EmptyState icon="calendar-check-outline" title="Aucune absence inopinée" />
      ) : (
        <View>
          <PagedList
            items={visible}
            resetKey={filter}
            renderItem={(absence) => (
              <AbsenceCard
                key={absence.id_justification}
                absence={absence}
                showEmployee
                onPress={() => navigation.navigate('AbsenceDetail', { id: absence.id_justification })}
              />
            )}
          />
        </View>
      )}
    </Screen>
  );
}
