import { ROLES } from '../data/constants';

export const canViewEmployee = (user, employee) =>
  Boolean(employee) &&
  (user.role === ROLES.RH ||
    user.role === ROLES.RESPONSABLE_TECHNIQUE ||
    employee.id_personne === user.id_personne ||
    employee.id_respo_direct === user.id_personne);

export const canViewLeave = (user, leave, requester) => {
  if (!leave || !requester) {
    return false;
  }
  if (user.role === ROLES.RH || leave.id_demandeur === user.id_personne) {
    return true;
  }
  if (user.role === ROLES.RESPONSABLE_CENTRE) {
    return requester.id_respo_direct === user.id_personne;
  }
  if (user.role === ROLES.RESPONSABLE_TECHNIQUE) {
    return Boolean(leave.escalated_at) || requester.id_respo_direct === user.id_personne;
  }
  return false;
};

export const canViewDocument = (user, document) =>
  Boolean(document) && (user.role === ROLES.RH || document.id_demandeur === user.id_personne);

export const canViewAbsence = (user, absence, owner) =>
  Boolean(absence) &&
  Boolean(owner) &&
  (user.role === ROLES.RH ||
    absence.id_personne === user.id_personne ||
    owner.id_respo_direct === user.id_personne);

export const canEditLeave = (user, leave) =>
  leave.id_demandeur === user.id_personne &&
  (leave.state === 'pending_respo' ||
    (leave.state === 'pending_rh' && leave.validation_respo !== 'validated'));

export const canCancelLeave = (user, leave) =>
  leave.id_demandeur === user.id_personne &&
  ['pending_respo', 'pending_tech', 'pending_confirmation', 'pending_rh'].includes(leave.state);
