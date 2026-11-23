import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { LeaveCard, TabHeader } from '../../components/domain';
import { Button, EmptyState, Screen, Segmented, Txt } from '../../components/ui';
import { useEscalations } from '../../hooks/useEscalations';

export function EscalationsScreen({ navigation, route }) {
  const { pending, decided } = useEscalations();
  const requested = route.params ? route.params.filter : null;
  const [filter, setFilter] = useState(requested || 'pending');

  useEffect(() => {
    if (requested) {
      setFilter(requested);
      navigation.setParams({ filter: undefined });
    }
  }, [requested, navigation]);

  const awaiting = decided.filter((leave) => leave.state === 'pending_confirmation');
  const visible = filter === 'pending' ? pending : awaiting;

  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader title="Demandes escaladées" subtitle="Sans substitut dans le centre d’origine" />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'pending', label: 'À arbitrer', count: pending.length },
          { value: 'awaiting', label: 'En confirmation', count: awaiting.length },
        ]}
      />
      <View className="gap-3">
        {visible.length === 0 ? (
          <EmptyState
            icon="check-all"
            title="Aucune demande"
            message={
              filter === 'pending'
                ? 'Toutes les demandes escaladées ont reçu un retour.'
                : 'Aucun retour n’attend la confirmation d’un responsable.'
            }
          />
        ) : (
          visible.map((leave) => (
            <LeaveCard
              key={leave.id_demande}
              leave={leave}
              showEmployee
              onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
              footer={
                filter === 'pending' ? (
                  <Button
                    label="Rechercher un substitut"
                    icon="account-search-outline"
                    size="sm"
                    onPress={() => navigation.navigate('SubstituteSearch', { id: leave.id_demande })}
                  />
                ) : null
              }
            >
              <Txt size="sm" tone="soft">
                {filter === 'pending' ? leave.comment_escalade : leave.comment_tech}
              </Txt>
            </LeaveCard>
          ))
        )}
      </View>
    </Screen>
  );
}
