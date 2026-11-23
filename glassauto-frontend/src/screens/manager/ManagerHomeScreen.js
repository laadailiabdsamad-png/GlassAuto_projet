import { View } from 'react-native';
import { HomeHeader, LeaveCard, QuickAction } from '../../components/domain';
import {
  Banner,
  Button,
  ChromePlate,
  EmptyState,
  Screen,
  SectionHeader,
  SegmentMeter,
  StatTile,
  Txt,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { useTeam } from '../../hooks/useTeam';
import { absentOn } from '../../utils/analytics';
import { formatDate, formatRange, greeting, today } from '../../utils/date';
import { firstName } from '../../utils/format';

function TeamPlate({ members, absentIds }) {
  const present = members.length - absentIds.size;
  const absentees = members.filter((member) => absentIds.has(member.id_personne));
  const segments = [
    ...Array.from({ length: present }, () => 'on'),
    ...Array.from({ length: absentIds.size }, () => 'alert'),
  ];
  return (
    <ChromePlate>
      <View className="flex-row items-end justify-between">
        <View className="flex-1">
          <Txt size="md" weight="display" tone="obsidian">
            Équipe présente
          </Txt>
          <Txt size="sm" weight="medium" tone="plate">
            {formatDate(today(), { weekday: true, long: true })}
          </Txt>
        </View>
        <View className="flex-row items-baseline gap-1.5">
          <Txt size="3xl" weight="slant" tone="obsidian">
            {present}
          </Txt>
          <Txt size="md" weight="display" tone="plate">
            / {members.length}
          </Txt>
        </View>
      </View>
      <View className="mt-4">
        <SegmentMeter segments={segments} />
      </View>
      <Txt size="sm" weight="medium" tone="plate" className="mt-3">
        {absentees.length === 0
          ? 'Aucune absence aujourd’hui.'
          : `En congé : ${absentees.map((member) => member.full_name).join(', ')}.`}
      </Txt>
    </ChromePlate>
  );
}

export function ManagerHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { actions } = useHrData();
  const { attempt } = useFeedback();
  const { members, leaves, toReview, toConfirm } = useTeam();
  const absentIds = new Set(absentOn(leaves, today()).map((leave) => leave.id_demandeur));
  const withTechnical = leaves.filter((leave) => leave.state === 'pending_tech');
  const upcoming = leaves
    .filter((leave) => leave.state === 'validated' && leave.date_debut > today())
    .sort((a, b) => (a.date_debut > b.date_debut ? 1 : -1))
    .slice(0, 3);
  const queue = [...toConfirm, ...toReview];

  return (
    <Screen tabbed refreshable>
      <HomeHeader
        title={`${greeting()} ${firstName(user.full_name)}`}
        subtitle={user.departement ? user.departement : `Centre de ${user.centre_nom}`}
      />
      {user.disponible ? null : (
        <Banner
          tone="amber"
          icon="account-off-outline"
          title="Vous êtes indisponible"
          message="Les nouvelles demandes de votre équipe vont directement au Service RH."
        >
          <Button
            label="Je suis disponible"
            size="sm"
            variant="chrome"
            className="mt-2"
            onPress={() =>
              attempt(() => actions.employees.setAvailability(user.id_personne, true), {
                title: 'Vous êtes disponible',
              })
            }
          />
        </Banner>
      )}
      <TeamPlate members={members} absentIds={absentIds} />
      <View className="flex-row gap-3">
        <StatTile
          value={toReview.length}
          label="À examiner"
          icon="inbox-arrow-down-outline"
          tone="amber"
          onPress={() => navigation.navigate('ManagerRequests')}
        />
        <StatTile
          value={toConfirm.length}
          label="À confirmer"
          icon="message-reply-text-outline"
          tone="violet"
          onPress={() => navigation.navigate('ManagerRequests')}
        />
        <StatTile
          value={withTechnical.length}
          label="Chez le technique"
          icon="account-search-outline"
          tone="sky"
          onPress={() => navigation.navigate('TechnicalTracking')}
        />
      </View>
      <View className="gap-3">
        <SectionHeader
          title="À traiter"
          count={queue.length}
          actionLabel="Voir tout"
          onAction={() => navigation.navigate('ManagerRequests')}
        />
        {queue.length === 0 ? (
          <EmptyState
            icon="check-all"
            title="Tout est traité"
            message="Les nouvelles demandes de votre équipe apparaîtront ici."
          />
        ) : (
          queue.slice(0, 3).map((leave) => (
            <LeaveCard
              key={leave.id_demande}
              leave={leave}
              showEmployee
              onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
            />
          ))
        )}
      </View>
      <View className="flex-row gap-3">
        <QuickAction
          icon="calendar-check-outline"
          label="Planning annuel"
          tone="crimson"
          onPress={() => navigation.navigate('AnnualPlanning')}
        />
        <QuickAction
          icon="swap-horizontal"
          label="Suivi technique"
          onPress={() => navigation.navigate('TechnicalTracking')}
        />
        <QuickAction
          icon="calendar-remove-outline"
          label="Absences équipe"
          onPress={() => navigation.navigate('TeamAbsences')}
        />
      </View>
      <View className="gap-3">
        <SectionHeader
          title="Prochains congés validés"
          actionLabel="Planning"
          onAction={() => navigation.navigate('TeamCalendar')}
        />
        {upcoming.length === 0 ? (
          <EmptyState icon="calendar-blank-outline" title="Aucun congé à venir" />
        ) : (
          upcoming.map((leave) => (
            <LeaveCard
              key={leave.id_demande}
              leave={leave}
              showEmployee
              stateLabel={formatRange(leave.date_debut, leave.date_fin, { hideYear: true })}
              onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
            />
          ))
        )}
      </View>
    </Screen>
  );
}
