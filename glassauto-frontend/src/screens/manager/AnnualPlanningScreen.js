import { useState } from 'react';
import { Pressable } from 'react-native';
import { PlanCoverage, PlanMembers } from '../shared/panels/PlanPanels';
import { AppHeader, Banner, Button, EmptyState, Icon, Screen, Segmented } from '../../components/ui';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { useTeam } from '../../hooks/useTeam';
import { colors } from '../../theme';
import { formatDateTime } from '../../utils/date';
import { plural } from '../../utils/format';

export function AnnualPlanningScreen({ navigation, route }) {
  const { actions } = useHrData();
  const { attempt, confirm } = useFeedback();
  const { plans, members } = useTeam();
  const years = plans.map((plan) => plan.annee).sort();
  const initial = route.params && route.params.year ? route.params.year : years[years.length - 1];
  const [year, setYear] = useState(initial);
  const plan = plans.find((item) => item.annee === year);

  if (!plan) {
    return (
      <Screen header={<AppHeader title="Planning annuel" />}>
        <EmptyState
          icon="calendar-blank-outline"
          title="Aucun planning"
          message="Le planning annuel concerne les centres du réseau."
        />
      </Screen>
    );
  }

  const draft = plan.statut === 'brouillon';
  const plannedMembers = new Set(plan.periods.map((period) => period.id_personne)).size;

  const submit = async () => {
    const accepted = await confirm({
      icon: 'calendar-check-outline',
      tone: 'success',
      title: `Soumettre le planning ${year} ?`,
      message: `${plural(plan.periods.length, 'période')} pour ${plural(plannedMembers, 'collaborateur')}. Le planning ne sera plus modifiable.`,
      confirmLabel: 'Soumettre au Service RH',
    });
    if (accepted) {
      await attempt(() => actions.plans.submit(plan.id), {
        title: 'Planning soumis',
        message: 'Le Service RH et votre équipe sont notifiés.',
      });
    }
  };

  const remove = async (period) => {
    await attempt(() => actions.plans.removePeriod(plan.id, period.id), {
      title: 'Période retirée du planning',
    });
  };

  return (
    <Screen
      gap={20}
      header={<AppHeader title="Planning annuel" subtitle={`Centre de ${plan.centre_nom}`} />}
      footer={
        draft ? (
          <>
            <Button
              label="Ajouter une période"
              icon="plus"
              variant="subtle"
              onPress={() => navigation.navigate('PlanPeriod', { planId: plan.id })}
            />
            <Button
              label="Soumettre le planning"
              onPress={submit}
              disabled={plan.periods.length === 0}
            />
          </>
        ) : null
      }
    >
      <Segmented
        value={year}
        onChange={setYear}
        options={years.map((value) => ({ value, label: String(value) }))}
      />
      {draft ? (
        <Banner
          tone="amber"
          icon="calendar-edit"
          title="Brouillon à soumettre"
          message={`${plannedMembers} collaborateurs planifiés sur ${members.length + 1}. Soumission attendue en début d’année.`}
        />
      ) : (
        <Banner
          tone="success"
          icon="calendar-check-outline"
          title="Planning soumis"
          message={`Transmis au Service RH le ${formatDateTime(plan.submitted_at)}.`}
        />
      )}
      <PlanCoverage plan={plan} />
      <PlanMembers
        plan={plan}
        renderAction={
          draft
            ? (period) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retirer la période"
                  onPress={() => remove(period)}
                  hitSlop={8}
                  className="h-9 w-9 items-center justify-center rounded-full bg-steel active:opacity-70"
                >
                  <Icon name="trash-can-outline" size={18} color={colors.ember} />
                </Pressable>
              )
            : null
        }
      />
    </Screen>
  );
}
