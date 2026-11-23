import { useState } from 'react';
import { View } from 'react-native';
import { LeaveCard, PagedList, StepTrack, TabHeader } from '../../components/domain';
import { EmptyState, Screen, SectionHeader, Segmented } from '../../components/ui';
import { useTeam } from '../../hooks/useTeam';
import { leaveSteps } from '../../utils/workflow';

export function ManagerRequestsScreen({ navigation, route }) {
  const { leaves, toReview, toConfirm } = useTeam();
  const [filter, setFilter] = useState((route.params && route.params.filter) || 'todo');
  const waiting = leaves.filter((leave) => ['pending_tech', 'pending_rh'].includes(leave.state));
  const closed = leaves.filter((leave) =>
    ['validated', 'rejected', 'cancelled'].includes(leave.state)
  );
  const open = (leave) => navigation.navigate('LeaveDetail', { id: leave.id_demande });

  const renderCard = (leave) => (
    <LeaveCard key={leave.id_demande} leave={leave} showEmployee onPress={() => open(leave)}>
      {filter === 'waiting' ? <StepTrack steps={leaveSteps(leave)} /> : null}
    </LeaveCard>
  );

  return (
    <Screen tabbed refreshable gap={20}>
      <TabHeader title="Demandes de l’équipe" />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'todo', label: 'À traiter', count: toReview.length + toConfirm.length },
          { value: 'waiting', label: 'En cours', count: waiting.length },
          { value: 'closed', label: 'Historique' },
        ]}
      />
      {filter === 'todo' ? (
        <>
          {toConfirm.length > 0 ? (
            <View className="gap-3">
              <SectionHeader title="Retours techniques à confirmer" count={toConfirm.length} />
              {toConfirm.map(renderCard)}
            </View>
          ) : null}
          <View className="gap-3">
            <SectionHeader title="Nouvelles demandes" count={toReview.length} />
            {toReview.length === 0 ? (
              <EmptyState
                icon="check-all"
                title="Aucune nouvelle demande"
                message="Vous serez notifié dès qu’un membre de l’équipe soumet une demande."
              />
            ) : (
              toReview.map(renderCard)
            )}
          </View>
        </>
      ) : null}
      {filter === 'waiting' ? (
        waiting.length === 0 ? (
          <EmptyState icon="progress-clock" title="Aucune demande en cours" />
        ) : (
          <View className="gap-3">{waiting.map(renderCard)}</View>
        )
      ) : null}
      {filter === 'closed' ? <PagedList items={closed} renderItem={renderCard} /> : null}
    </Screen>
  );
}
