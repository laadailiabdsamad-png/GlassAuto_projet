import { useState } from 'react';
import { View } from 'react-native';
import { LeaveCard, StepTrack } from '../../components/domain';
import { AppHeader, EmptyState, Icon, Screen, Segmented, Txt } from '../../components/ui';
import { useHrData } from '../../hooks/useHrData';
import { useTeam } from '../../hooks/useTeam';
import { colors } from '../../theme';
import { leaveSteps } from '../../utils/workflow';

function Answer({ leave, employeesById }) {
  if (leave.validation_tech === 'pending') {
    return (
      <View className="flex-row items-center gap-2">
        <Icon name="timer-sand" size={16} color={colors.sky} />
        <Txt size="sm" tone="soft">
          Recherche en cours
        </Txt>
      </View>
    );
  }
  const favorable = leave.validation_tech === 'validated';
  const substitute = employeesById[leave.id_substitut_propose];
  return (
    <View className="flex-row items-center gap-2">
      <Icon
        name={favorable ? 'account-check-outline' : 'account-cancel-outline'}
        size={17}
        color={favorable ? colors.success : colors.ember}
      />
      <Txt size="sm" tone="soft" className="flex-1">
        {favorable && substitute
          ? `${substitute.full_name}, ${substitute.centre_nom}`
          : 'Aucun substitut trouvé'}
      </Txt>
    </View>
  );
}

export function TechnicalTrackingScreen({ navigation }) {
  const { employeesById } = useHrData();
  const { escalated } = useTeam();
  const [filter, setFilter] = useState('open');
  const groups = {
    open: escalated.filter((leave) => ['pending_tech', 'pending_confirmation'].includes(leave.state)),
    closed: escalated.filter((leave) => !['pending_tech', 'pending_confirmation'].includes(leave.state)),
  };
  const visible = groups[filter];

  return (
    <Screen
      refreshable
      gap={18}
      header={<AppHeader title="Suivi technique" subtitle="Demandes transférées au responsable technique" />}
    >
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: 'En cours', count: groups.open.length },
          { value: 'closed', label: 'Décidées' },
        ]}
      />
      <View className="gap-3">
        {visible.length === 0 ? (
          <EmptyState
            icon="swap-horizontal"
            title="Aucune demande transférée"
            message="Les demandes sans substitut local apparaîtront ici."
          />
        ) : (
          visible.map((leave) => (
            <LeaveCard
              key={leave.id_demande}
              leave={leave}
              showEmployee
              onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
            >
              <StepTrack steps={leaveSteps(leave)} />
              <Answer leave={leave} employeesById={employeesById} />
            </LeaveCard>
          ))
        )}
      </View>
    </Screen>
  );
}
