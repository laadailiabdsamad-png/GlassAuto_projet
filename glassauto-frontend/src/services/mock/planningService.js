import { periodsOverlap } from '../../utils/date';
import { findBy, list as readAll, nextId, now, patch, ServiceError, wait } from './database';
import { notify, notifyHr, person } from './notifier';

const requireDraft = (planId) => {
  const plan = findBy('annualPlans', 'id', planId);
  if (!plan) {
    throw new ServiceError('Planning introuvable.', 'not_found');
  }
  if (plan.statut === 'soumis') {
    throw new ServiceError('Ce planning a déjà été soumis au Service RH.', 'state');
  }
  return plan;
};

export const list = async () => readAll('annualPlans');

export const addPeriod = async (planId, { employeeId, start, end }) => {
  await wait(400);
  const plan = requireDraft(planId);
  if (!start.startsWith(String(plan.annee)) || !end.startsWith(String(plan.annee))) {
    throw new ServiceError(`La période doit être comprise dans l’année ${plan.annee}.`, 'year');
  }
  const overlap = plan.periods.find(
    (period) =>
      period.id_personne === employeeId &&
      periodsOverlap(period.date_debut, period.date_fin, start, end)
  );
  if (overlap) {
    throw new ServiceError('Une période est déjà planifiée à ces dates pour ce collaborateur.', 'overlap');
  }
  return patch('annualPlans', 'id', planId, {
    periods: [
      ...plan.periods,
      { id: nextId('period', 'PER'), id_personne: employeeId, date_debut: start, date_fin: end },
    ],
  });
};

export const removePeriod = async (planId, periodId) => {
  await wait(300);
  const plan = requireDraft(planId);
  return patch('annualPlans', 'id', planId, {
    periods: plan.periods.filter((period) => period.id !== periodId),
  });
};

export const submit = async (planId) => {
  await wait(650);
  const plan = requireDraft(planId);
  if (plan.periods.length === 0) {
    throw new ServiceError('Ajoutez au moins une période avant de soumettre le planning.', 'empty');
  }
  const updated = patch('annualPlans', 'id', planId, { statut: 'soumis', submitted_at: now() });
  const manager = person(plan.id_respo);
  notifyHr({
    type: 'planning',
    title: 'Planning annuel soumis',
    message: `${manager.full_name} a soumis le planning ${plan.annee} du centre de ${plan.centre_nom}.`,
    target: { screen: 'PlanDetail', params: { id: planId } },
  });
  [...new Set(plan.periods.map((period) => period.id_personne))].forEach((employeeId) => {
    notify(employeeId, {
      type: 'planning',
      title: `Planning ${plan.annee} soumis`,
      message: 'Vos périodes de congé figurent dans le planning annuel de votre centre.',
      target: { screen: 'LeaveForm', params: {} },
    });
  });
  return updated;
};

export const remind = async (planId) => {
  await wait(400);
  const plan = findBy('annualPlans', 'id', planId);
  notify(plan.id_respo, {
    type: 'planning',
    title: `Planning ${plan.annee} à soumettre`,
    message: 'Le Service RH attend le planning annuel de votre centre.',
    target: { screen: 'AnnualPlanning', params: { year: plan.annee } },
  });
  return plan;
};
