import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { LeaveCard, PagedList, TabHeader } from '../../components/domain';
import { Chip, EmptyState, Icon, Screen, SearchBar, Segmented, Txt } from '../../components/ui';
import { LEAVE_STATES, ROUTING_META } from '../../data/constants';
import { useHrData } from '../../hooks/useHrData';
import { useHrQueues } from '../../hooks/useHrQueues';
import { colors } from '../../theme';
import { byNewest, matches } from '../../utils/format';
import { substituteIdOf } from '../../utils/substitution';

const STATE_FILTERS = ['pending_respo', 'pending_tech', 'pending_confirmation', 'pending_rh', 'validated', 'rejected', 'cancelled'];

export function HrLeavesScreen({ navigation, route }) {
  const { leaves, employeesById } = useHrData();
  const { pendingLeaves } = useHrQueues();
  const requested = route.params ? route.params.filter : null;
  const [filter, setFilter] = useState(requested || 'pending');
  const [state, setState] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (requested) {
      setFilter(requested);
      navigation.setParams({ filter: undefined });
    }
  }, [requested, navigation]);

  const special = pendingLeaves.filter((leave) => leave.routing !== 'standard');
  const pools = {
    pending: pendingLeaves,
    special,
    all: [...leaves].sort(byNewest).filter((leave) => !state || leave.state === state),
  };
  const visible = pools[filter].filter((leave) => {
    if (!query) {
      return true;
    }
    const employee = employeesById[leave.id_demandeur];
    return matches(`${employee.full_name} ${employee.centre_nom} ${leave.id_demande}`, query);
  });

  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader
        title="Gestion des congés"
        actionIcon="calendar-month-outline"
        actionLabel="Calendrier global"
        onAction={() => navigation.navigate('HrCalendar')}
      />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'pending', label: 'À valider', count: pendingLeaves.length },
          { value: 'special', label: 'Particuliers', count: special.length },
          { value: 'all', label: 'Toutes' },
        ]}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Nom, centre ou référence" />
      {filter === 'all' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <Chip label="Tous les statuts" selected={!state} onPress={() => setState(null)} />
            {STATE_FILTERS.map((item) => (
              <Chip
                key={item}
                label={LEAVE_STATES[item].label}
                icon={LEAVE_STATES[item].icon}
                selected={state === item}
                onPress={() => setState(item)}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}
      {visible.length === 0 ? (
        <EmptyState
          icon="calendar-check-outline"
          title="Aucune demande"
          message={query ? 'Modifiez la recherche.' : 'Rien à traiter dans cette catégorie.'}
        />
      ) : (
        <PagedList
          items={visible}
          resetKey={`${filter}-${state}-${query}`}
          renderItem={(leave) => {
            const substitute = employeesById[substituteIdOf(leave)];
            return (
              <LeaveCard
                key={leave.id_demande}
                leave={leave}
                showEmployee
                onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
              >
                {leave.state === 'pending_rh' && (substitute || leave.routing !== 'standard') ? (
                  <View className="flex-row items-center gap-2">
                    <Icon
                      name={substitute ? 'account-switch-outline' : 'routes'}
                      size={17}
                      color={substitute ? colors.sky : colors.violet}
                    />
                    <Txt size="sm" tone="soft" className="flex-1">
                      {substitute
                        ? `Substitut : ${substitute.full_name}, ${substitute.centre_nom}`
                        : ROUTING_META[leave.routing].label}
                    </Txt>
                  </View>
                ) : null}
              </LeaveCard>
            );
          }}
        />
      )}
    </Screen>
  );
}
