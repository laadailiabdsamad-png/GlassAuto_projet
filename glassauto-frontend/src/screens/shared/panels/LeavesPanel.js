import { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LeaveCard, StepTrack } from '../../../components/domain';
import { Card, EmptyState, Segmented, Txt } from '../../../components/ui';
import { OPEN_LEAVE_STATES } from '../../../data/constants';
import { useMyRecords } from '../../../hooks/useMyRecords';
import { leaveSteps } from '../../../utils/workflow';

function Summary({ value, label }) {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Txt size="lg" weight="figure" align="center">
        {value}
      </Txt>
      <Txt size="xs" tone="mute" align="center">
        {label}
      </Txt>
    </View>
  );
}

export function LeavesPanel() {
  const navigation = useNavigation();
  const { leaves, balance, taken, pending } = useMyRecords();
  const [filter, setFilter] = useState('open');
  const groups = {
    open: leaves.filter((leave) => OPEN_LEAVE_STATES.includes(leave.state)),
    validated: leaves.filter((leave) => leave.state === 'validated'),
    closed: leaves.filter((leave) => ['rejected', 'cancelled'].includes(leave.state)),
  };
  const visible = groups[filter];

  return (
    <>
      <Card>
        <View className="flex-row">
          <Summary value={balance} label="Solde" />
          <View className="w-px bg-white/10" />
          <Summary value={pending} label="En attente" />
          <View className="w-px bg-white/10" />
          <Summary value={taken} label="Pris cette année" />
        </View>
      </Card>
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: 'En cours', count: groups.open.length },
          { value: 'validated', label: 'Validés' },
          { value: 'closed', label: 'Clos' },
        ]}
      />
      <View className="gap-3">
        {visible.length === 0 ? (
          <EmptyState
            icon="calendar-blank-outline"
            title="Aucune demande"
            message="Les demandes de cette catégorie apparaîtront ici."
            actionLabel="Demander un congé"
            onAction={() => navigation.navigate('LeaveForm')}
          />
        ) : (
          visible.map((leave) => (
            <LeaveCard
              key={leave.id_demande}
              leave={leave}
              onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
            >
              {filter === 'open' ? <StepTrack steps={leaveSteps(leave)} /> : null}
            </LeaveCard>
          ))
        )}
      </View>
    </>
  );
}
