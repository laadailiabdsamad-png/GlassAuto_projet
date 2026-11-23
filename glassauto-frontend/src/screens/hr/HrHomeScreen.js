import { View } from 'react-native';
import { HomeHeader, LeaveCard, QuickAction } from '../../components/domain';
import {
  AlertCardGroup,
} from './HrHomeAlerts';
import { ChromePlate, EmptyState, Gauge, Screen, SectionHeader, StatTile, Txt } from '../../components/ui';
import { HEADQUARTERS } from '../../data/centres';
import { useAuth } from '../../hooks/useAuth';
import { useHrData } from '../../hooks/useHrData';
import { useHrQueues } from '../../hooks/useHrQueues';
import { absentOn } from '../../utils/analytics';
import { greeting, today } from '../../utils/date';
import { firstName } from '../../utils/format';

function Figure({ value, label }) {
  return (
    <View className="gap-0.5 border-l-2 border-black/20 pl-3">
      <Txt size="lg" weight="figure" tone="obsidian">
        {value}
      </Txt>
      <Txt size="sm" weight="medium" tone="plate">
        {label}
      </Txt>
    </View>
  );
}

export function HrHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { employees, leaves } = useHrData();
  const { pendingLeaves, openDocuments, readyDocuments, pendingAbsences } = useHrQueues();
  const absents = new Set(absentOn(leaves, today()).map((leave) => leave.id_demandeur)).size;
  const total = employees.length;
  const present = total - absents;
  const headquarters = employees.filter((employee) => employee.centre_nom === HEADQUARTERS).length;

  return (
    <Screen tabbed refreshable>
      <HomeHeader
        title={`${greeting()} ${firstName(user.full_name)}`}
        subtitle="Supervision du siège et des 31 centres"
      />
      <ChromePlate>
        <Txt size="md" weight="display" tone="obsidian">
          Effectif présent
        </Txt>
        <View className="mt-2 flex-row items-center gap-5">
          <Gauge value={present} max={total} size={164} redline={0.25}>
            <Txt size="2xl" weight="slant" tone="obsidian" align="center">
              {present}
            </Txt>
            <Txt size="sm" weight="semi" tone="plate" align="center">
              sur {total}
            </Txt>
          </Gauge>
          <View className="flex-1 gap-4">
            <Figure value={headquarters} label="Au siège" />
            <Figure value={total - headquarters} label="Dans 31 centres" />
            <Figure value={absents} label="En congé" />
          </View>
        </View>
      </ChromePlate>
      <View className="gap-3">
        <View className="flex-row gap-3">
          <StatTile
            value={pendingLeaves.length}
            label="Congés à valider"
            icon="calendar-check-outline"
            tone="amber"
            onPress={() => navigation.navigate('HrLeaves')}
          />
          <StatTile
            value={openDocuments.length}
            label="Documents à traiter"
            icon="file-sign"
            tone="sky"
            onPress={() => navigation.navigate('HrDocuments')}
          />
        </View>
        <View className="flex-row gap-3">
          <StatTile
            value={pendingAbsences.length}
            label="Justifications à vérifier"
            icon="calendar-remove-outline"
            tone="violet"
            onPress={() => navigation.navigate('HrAbsences')}
          />
          <StatTile
            value={readyDocuments.length}
            label="Documents à remettre"
            icon="hand-coin-outline"
            tone="success"
            onPress={() => navigation.navigate('HrDocuments', { filter: 'ready' })}
          />
        </View>
      </View>
      <AlertCardGroup navigation={navigation} leaves={pendingLeaves} />
      <View className="gap-3">
        <SectionHeader title="Accès rapide" />
        <View className="flex-row gap-3">
          <QuickAction
            icon="account-group-outline"
            label="Collaborateurs"
            tone="crimson"
            onPress={() => navigation.navigate('HrEmployees')}
          />
          <QuickAction
            icon="calendar-month-outline"
            label="Calendrier global"
            onPress={() => navigation.navigate('HrCalendar')}
          />
          <QuickAction
            icon="calendar-check-outline"
            label="Plannings annuels"
            onPress={() => navigation.navigate('HrPlans')}
          />
        </View>
        <View className="flex-row gap-3">
          <QuickAction
            icon="cash-check"
            label="Contrôle paie"
            onPress={() => navigation.navigate('PayrollCheck')}
          />
          <QuickAction
            icon="history"
            label="Historique"
            onPress={() => navigation.navigate('HrHistory')}
          />
          <QuickAction
            icon="chart-box-outline"
            label="Analyses"
            onPress={() => navigation.navigate('HrAnalytics')}
          />
        </View>
      </View>
      <View className="gap-3">
        <SectionHeader
          title="Validations finales"
          count={pendingLeaves.length}
          actionLabel="Voir tout"
          onAction={() => navigation.navigate('HrLeaves')}
        />
        {pendingLeaves.length === 0 ? (
          <EmptyState
            icon="check-all"
            title="Aucune validation en attente"
            message="Les demandes approuvées par les responsables apparaîtront ici."
          />
        ) : (
          pendingLeaves.slice(0, 3).map((leave) => (
            <LeaveCard
              key={leave.id_demande}
              leave={leave}
              showEmployee
              onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
            />
          ))
        )}
      </View>
    </Screen>
  );
}
