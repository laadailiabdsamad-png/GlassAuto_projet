import { useState } from 'react';
import { DateRangeField } from '../../components/calendar';
import { AppHeader, Banner, Button, Screen, SelectField } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { useTeam } from '../../hooks/useTeam';
import { daysFromToday, formatRange, periodsOverlap } from '../../utils/date';

export function PlanPeriodScreen({ navigation, route }) {
  const { user } = useAuth();
  const { annualPlans, employeesById, actions } = useHrData();
  const { attempt } = useFeedback();
  const { members } = useTeam();
  const plan = annualPlans.find((item) => item.id === route.params.planId);
  const [employeeId, setEmployeeId] = useState(null);
  const [period, setPeriod] = useState({ start: null, end: null });
  const [errors, setErrors] = useState({});
  const firstDay = `${plan.annee}-01-01`;
  const tomorrow = daysFromToday(1);
  const minDate = firstDay > tomorrow ? firstDay : tomorrow;
  const people = [...members, user];
  const conflicts = period.start
    ? plan.periods.filter(
        (item) =>
          item.id_personne !== employeeId &&
          periodsOverlap(item.date_debut, item.date_fin, period.start, period.end)
      )
    : [];

  const submit = async () => {
    const next = {};
    if (!employeeId) {
      next.employee = 'Choisissez un collaborateur.';
    }
    if (!period.start) {
      next.period = 'Choisissez la période prévue.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    const outcome = await attempt(
      () => actions.plans.addPeriod(plan.id, { employeeId, start: period.start, end: period.end }),
      {
        title: 'Période ajoutée',
        message: formatRange(period.start, period.end),
      }
    );
    if (outcome.ok) {
      navigation.goBack();
    }
  };

  return (
    <Screen
      header={<AppHeader title="Ajouter une période" subtitle={`Planning ${plan.annee}`} />}
      footer={<Button label="Ajouter au planning" onPress={submit} />}
    >
      <SelectField
        label="Collaborateur"
        value={employeeId}
        icon="account-outline"
        placeholder="Choisir un membre de l’équipe"
        error={errors.employee}
        options={people.map((member) => ({
          value: member.id_personne,
          label: member.full_name,
          description: member.poste,
        }))}
        onChange={(value) => {
          setEmployeeId(value);
          setErrors((current) => ({ ...current, employee: null }));
        }}
      />
      <DateRangeField
        label="Période prévue"
        start={period.start}
        end={period.end}
        minDate={minDate}
        maxDate={`${plan.annee}-12-31`}
        error={errors.period}
        onChange={(next) => {
          setPeriod(next);
          setErrors((current) => ({ ...current, period: null }));
        }}
      />
      {conflicts.length > 0 ? (
        <Banner
          tone="amber"
          icon="calendar-alert"
          title="Absences simultanées"
          message={conflicts
            .map(
              (item) =>
                `${employeesById[item.id_personne].full_name} (${formatRange(item.date_debut, item.date_fin, { hideYear: true })})`
            )
            .join(', ')}
        />
      ) : null}
    </Screen>
  );
}
