import { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AbsenceCard } from '../../../components/domain';
import { Button, EmptyState, Segmented } from '../../../components/ui';
import { useMyRecords } from '../../../hooks/useMyRecords';

export function AbsencesPanel() {
  const navigation = useNavigation();
  const { absences } = useMyRecords();
  const [filter, setFilter] = useState('open');
  const groups = {
    open: absences.filter((absence) =>
      ['a_justifier', 'en_attente'].includes(absence.statut_paie)
    ),
    closed: absences.filter((absence) =>
      ['justifiee', 'non_justifiee'].includes(absence.statut_paie)
    ),
  };
  const visible = groups[filter];

  return (
    <>
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: 'En cours', count: groups.open.length },
          { value: 'closed', label: 'Historique' },
        ]}
      />
      <View className="gap-3">
        {visible.length === 0 ? (
          <EmptyState
            icon="calendar-check-outline"
            title="Aucune absence"
            message="Déclarez ici une absence inopinée pour la régulariser en paie."
            actionLabel="Justifier une absence"
            onAction={() => navigation.navigate('AbsenceForm')}
          />
        ) : (
          visible.map((absence) => (
            <AbsenceCard
              key={absence.id_justification}
              absence={absence}
              onPress={() =>
                navigation.navigate('AbsenceDetail', { id: absence.id_justification })
              }
              footer={
                absence.statut_paie === 'a_justifier' ? (
                  <Button
                    label="Justifier cette absence"
                    size="sm"
                    onPress={() =>
                      navigation.navigate('AbsenceForm', { id: absence.id_justification })
                    }
                  />
                ) : null
              }
            />
          ))
        )}
      </View>
    </>
  );
}
