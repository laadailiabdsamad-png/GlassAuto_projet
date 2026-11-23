import { View } from 'react-native';
import { HomeHeader, LeaveCard, QuickAction } from '../../components/domain';
import {
  ChromePlate,
  EmptyState,
  Screen,
  SectionHeader,
  SegmentMeter,
  StatTile,
  Txt,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useEscalations } from '../../hooks/useEscalations';
import { useHrData } from '../../hooks/useHrData';
import { diffInDays, greeting, today } from '../../utils/date';
import { firstName, percent, plural } from '../../utils/format';
import { centreAvailability } from '../../utils/substitution';

export function TechnicalHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { employees, leaves } = useHrData();
  const { pending, decided, favorable } = useEscalations();
  const network = centreAvailability(employees, leaves, today(), today());
  const complete = network.filter((centre) => centre.available === centre.total).length;
  const segments = network.map((centre) => (centre.available === centre.total ? 'on' : 'alert'));
  const available = network.reduce((sum, centre) => sum + centre.available, 0);
  const awaiting = decided.filter((leave) => leave.state === 'pending_confirmation');
  const urgent = pending.filter((leave) => diffInDays(today(), leave.date_debut) <= 30);

  return (
    <Screen tabbed refreshable>
      <HomeHeader
        title={`${greeting()} ${firstName(user.full_name)}`}
        subtitle="Substitution sur le réseau des 31 centres"
      />
      <ChromePlate>
        <View className="flex-row items-end justify-between">
          <View className="flex-1">
            <Txt size="md" weight="display" tone="obsidian">
              Centres au complet
            </Txt>
            <Txt size="sm" weight="medium" tone="plate">
              {available} techniciens, aides et accueils disponibles
            </Txt>
          </View>
          <View className="flex-row items-baseline gap-1.5">
            <Txt size="3xl" weight="slant" tone="obsidian">
              {complete}
            </Txt>
            <Txt size="md" weight="display" tone="plate">
              / {network.length}
            </Txt>
          </View>
        </View>
        <View className="mt-4">
          <SegmentMeter segments={segments} height={36} />
        </View>
        <Txt size="sm" weight="medium" tone="plate" className="mt-3">
          {plural(network.length - complete, 'centre')} avec au moins une absence aujourd’hui.
        </Txt>
      </ChromePlate>
      <View className="flex-row gap-3">
        <StatTile
          value={pending.length}
          label="À arbitrer"
          icon="account-search-outline"
          tone="amber"
          onPress={() => navigation.navigate('Escalations')}
        />
        <StatTile
          value={awaiting.length}
          label="En confirmation"
          icon="message-reply-text-outline"
          tone="violet"
          onPress={() => navigation.navigate('Escalations', { filter: 'awaiting' })}
        />
        <StatTile
          value={`${percent(favorable.length, decided.length)} %`}
          label="Substituts trouvés"
          icon="account-check-outline"
          tone="success"
          onPress={() => navigation.navigate('TechnicalHistory')}
        />
      </View>
      <View className="gap-3">
        <SectionHeader
          title="À arbitrer en priorité"
          count={urgent.length}
          actionLabel="Voir tout"
          onAction={() => navigation.navigate('Escalations')}
        />
        {pending.length === 0 ? (
          <EmptyState
            icon="check-all"
            title="Aucune demande en attente"
            message="Les demandes sans substitut local apparaîtront ici."
          />
        ) : (
          pending.slice(0, 3).map((leave) => (
            <LeaveCard
              key={leave.id_demande}
              leave={leave}
              showEmployee
              stateLabel={`Départ dans ${plural(diffInDays(today(), leave.date_debut), 'jour')}`}
              onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
            >
              <Txt size="sm" tone="soft">
                {leave.comment_escalade}
              </Txt>
            </LeaveCard>
          ))
        )}
      </View>
      <View className="flex-row gap-3">
        <QuickAction
          icon="map-marker-radius-outline"
          label="Disponibilité des centres"
          tone="crimson"
          onPress={() => navigation.navigate('Centres')}
        />
        <QuickAction
          icon="history"
          label="Historique des décisions"
          onPress={() => navigation.navigate('TechnicalHistory')}
        />
      </View>
    </Screen>
  );
}
