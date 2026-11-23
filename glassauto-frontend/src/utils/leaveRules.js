import { LEAVE_TYPES, NOTICE_DAYS, OPEN_LEAVE_STATES, ROLES } from '../data/constants';
import {
  addDays,
  countWorkingDays,
  diffInDays,
  formatDate,
  formatRange,
  periodsOverlap,
  today,
} from './date';
import { daysLabel } from './format';

const BLOCKING_STATES = [...OPEN_LEAVE_STATES, 'validated'];

export const findPlannedPeriod = (plans, employeeId, start, end) => {
  for (const plan of plans) {
    if (plan.statut === 'soumis') {
      const match = plan.periods.find(
        (period) =>
          period.id_personne === employeeId && period.date_debut <= start && period.date_fin >= end
      );
      if (match) {
        return match;
      }
    }
  }
  return null;
};

export const upcomingPlannedPeriods = (plans, employeeId) =>
  plans
    .filter((plan) => plan.statut === 'soumis')
    .flatMap((plan) => plan.periods)
    .filter((period) => period.id_personne === employeeId && period.date_debut >= today())
    .sort((a, b) => (a.date_debut > b.date_debut ? 1 : -1));

export const isOnLeave = (leaves, employeeId, date) =>
  leaves.some(
    (leave) =>
      leave.id_demandeur === employeeId &&
      leave.state === 'validated' &&
      leave.date_debut <= date &&
      leave.date_fin >= date
  );

export const resolveRoute = ({ employee, manager, leaves }) => {
  if (employee.role !== ROLES.COLLABORATEUR || !manager) {
    return { routing: 'responsable', state: 'pending_rh' };
  }
  if (!manager.disponible || isOnLeave(leaves, manager.id_personne, today())) {
    return { routing: 'responsable_indisponible', state: 'pending_rh' };
  }
  return { routing: 'standard', state: 'pending_respo' };
};

export const earliestUnplannedDate = () => addDays(today(), NOTICE_DAYS);

export const pendingDays = (leaves, employeeId, excludedId = null) =>
  leaves
    .filter(
      (leave) =>
        leave.id_demandeur === employeeId &&
        leave.id_demande !== excludedId &&
        OPEN_LEAVE_STATES.includes(leave.state) &&
        LEAVE_TYPES[leave.conge_type].deducts
    )
    .reduce((total, leave) => total + leave.jour_demande, 0);

export const takenDays = (leaves, employeeId) => {
  const year = String(new Date().getFullYear());
  return leaves
    .filter(
      (leave) =>
        leave.id_demandeur === employeeId &&
        leave.state === 'validated' &&
        leave.date_debut.startsWith(year) &&
        LEAVE_TYPES[leave.conge_type].deducts
    )
    .reduce((total, leave) => total + leave.jour_demande, 0);
};

export const evaluateLeave = ({ employee, type, start, end, leaves, plans, excludedId = null }) => {
  const days = countWorkingDays(start, end);
  const planned = start && end ? findPlannedPeriod(plans, employee.id_personne, start, end) : null;
  const notice = start ? diffInDays(today(), start) : 0;
  const deducts = LEAVE_TYPES[type].deducts;
  const balanceAfter = deducts ? employee.solde_conge - days : employee.solde_conge;
  const overlap =
    start && end
      ? leaves.find(
          (leave) =>
            leave.id_demandeur === employee.id_personne &&
            leave.id_demande !== excludedId &&
            BLOCKING_STATES.includes(leave.state) &&
            periodsOverlap(leave.date_debut, leave.date_fin, start, end)
        )
      : null;
  const errors = [];
  if (start && start <= today()) {
    errors.push({
      code: 'past',
      message: 'La date de début doit être postérieure à aujourd’hui. Pour une absence passée, utilisez la justification d’absence.',
    });
  }
  if (start && end && days === 0) {
    errors.push({ code: 'empty', message: 'La période choisie ne contient aucun jour ouvrable.' });
  }
  if (start && start > today() && !planned && notice < NOTICE_DAYS) {
    errors.push({
      code: 'notice',
      message: `Hors planning annuel, le préavis est de ${NOTICE_DAYS} jours. Première date possible : ${formatDate(earliestUnplannedDate())}.`,
    });
  }
  if (deducts && days > 0 && balanceAfter < 0) {
    errors.push({
      code: 'balance',
      message: `Solde insuffisant : ${daysLabel(days)} demandés pour ${daysLabel(employee.solde_conge)} disponibles.`,
    });
  }
  if (overlap) {
    errors.push({
      code: 'overlap',
      message: `Cette période chevauche la demande ${overlap.id_demande} (${formatRange(overlap.date_debut, overlap.date_fin)}).`,
    });
  }
  return { days, planned, notice, deducts, balanceAfter, overlap, errors };
};
