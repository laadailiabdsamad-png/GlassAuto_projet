import { AppHeader, Banner, EmptyState, Screen } from '../../components/ui';
import { useHrData } from '../../hooks/useHrData';
import { formatDateTime } from '../../utils/date';
import { PlanCoverage, PlanMembers } from '../shared/panels/PlanPanels';

export function PlanDetailScreen({ route }) {
  const { annualPlans, employeesById } = useHrData();
  const plan = annualPlans.find((item) => item.id === route.params.id);

  if (!plan) {
    return (
      <Screen header={<AppHeader title="Planning annuel" />}>
        <EmptyState icon="calendar-blank-outline" title="Planning introuvable" />
      </Screen>
    );
  }

  const done = plan.statut === 'soumis';
  const manager = employeesById[plan.id_respo];

  return (
    <Screen gap={20} header={<AppHeader title={plan.centre_nom} subtitle={`Planning ${plan.annee}`} />}>
      <Banner
        tone={done ? 'success' : 'amber'}
        icon={done ? 'calendar-check-outline' : 'calendar-edit'}
        title={done ? 'Planning soumis' : 'En attente de soumission'}
        message={
          done
            ? `Par ${manager.full_name}, le ${formatDateTime(plan.submitted_at)}.`
            : `Responsable : ${manager.full_name}.`
        }
      />
      <PlanCoverage plan={plan} />
      <PlanMembers plan={plan} />
    </Screen>
  );
}
