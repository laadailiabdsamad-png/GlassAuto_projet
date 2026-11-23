import { LEAVE_TYPES, OPEN_LEAVE_STATES } from '../../data/constants';
import { formatRange } from '../../utils/date';
import { lowerFirst } from '../../utils/format';
import { evaluateLeave, resolveRoute } from '../../utils/leaveRules';
import { evaluateCandidate } from '../../utils/substitution';
import { findBy, getState, insert, list as readAll, nextId, now, patch, ServiceError, wait } from './database';
import { leaveTarget, notify, notifyHr, notifyTechnical, person } from './notifier';

const period = (leave) => formatRange(leave.date_debut, leave.date_fin);

const requireLeave = (id, states) => {
  const leave = findBy('leaves', 'id_demande', id);
  if (!leave) {
    throw new ServiceError('Demande introuvable.', 'not_found');
  }
  if (states && !states.includes(leave.state)) {
    throw new ServiceError('Cette demande a déjà été traitée.', 'state');
  }
  return leave;
};

const requireAvailable = (substituteId, leave) => {
  const candidate = person(substituteId);
  const requester = person(leave.id_demandeur);
  const result = candidate ? evaluateCandidate(candidate, leave, requester, getState().leaves) : null;
  if (!result || result.status !== 'available') {
    throw new ServiceError('Ce substitut n’est plus disponible sur la période.', 'substitute');
  }
  return candidate;
};

export const list = async () => readAll('leaves');

export const create = async ({ employeeId, type, start, end, motif }) => {
  await wait(650);
  const state = getState();
  const employee = person(employeeId);
  const evaluation = evaluateLeave({
    employee,
    type,
    start,
    end,
    leaves: state.leaves,
    plans: state.annualPlans,
  });
  if (evaluation.errors.length > 0) {
    throw new ServiceError(evaluation.errors[0].message, evaluation.errors[0].code);
  }
  const manager = person(employee.id_respo_direct);
  const route = resolveRoute({ employee, manager, leaves: state.leaves });
  const leave = insert('leaves', {
    id_demande: nextId('leave', 'CG'),
    state: route.state,
    generated_at: now(),
    modified_at: null,
    cancelled_at: null,
    conge_type: type,
    jour_demande: evaluation.days,
    date_debut: start,
    date_fin: end,
    motif,
    solde_reste: evaluation.balanceAfter,
    est_dans_planning_annuel: Boolean(evaluation.planned),
    routing: route.routing,
    validation_respo: route.state === 'pending_respo' ? 'pending' : null,
    validated_respo_at: null,
    comment_respo: null,
    id_substitut_local: null,
    escalated_at: null,
    comment_escalade: null,
    validation_tech: null,
    validated_tech_at: null,
    comment_tech: null,
    id_tech_valideur: null,
    id_substitut_propose: null,
    validation_confirmation: null,
    confirmed_at: null,
    comment_confirmation: null,
    validation_RH: route.state === 'pending_rh' ? 'pending' : null,
    validation_RH_at: null,
    comment_RH: null,
    id_rh_valideur: null,
    id_demandeur: employeeId,
    id_respo_valideur: employee.id_respo_direct,
  });
  const payload = {
    type: 'nouvelle_demande',
    title: 'Nouvelle demande de congé',
    message: `${employee.full_name} : ${LEAVE_TYPES[type].label.toLowerCase()}, ${period(leave)}.`,
    target: leaveTarget(leave.id_demande),
  };
  if (route.state === 'pending_respo') {
    notify(manager.id_personne, payload);
  } else {
    notifyHr({
      ...payload,
      title:
        route.routing === 'responsable'
          ? 'Congé de responsable à valider'
          : 'Demande acheminée, responsable indisponible',
    });
  }
  return leave;
};

export const alertNotice = async ({ employeeId, message }) => {
  const recent = getState().notifications.find(
    (item) =>
      item.id_personne === employeeId &&
      item.type === 'preavis' &&
      Date.now() - new Date(item.created_at).getTime() < 60000
  );
  if (!recent) {
    notify(employeeId, {
      type: 'preavis',
      title: 'Préavis de 20 jours non respecté',
      message,
      target: { screen: 'LeaveForm', params: {} },
    });
  }
};

export const update = async (id, { type, start, end, motif }) => {
  await wait(600);
  const leave = requireLeave(id, ['pending_respo', 'pending_rh']);
  if (leave.validation_respo === 'validated') {
    throw new ServiceError('Une demande déjà validée ne peut plus être modifiée.', 'state');
  }
  const state = getState();
  const employee = person(leave.id_demandeur);
  const evaluation = evaluateLeave({
    employee,
    type,
    start,
    end,
    leaves: state.leaves,
    plans: state.annualPlans,
    excludedId: id,
  });
  if (evaluation.errors.length > 0) {
    throw new ServiceError(evaluation.errors[0].message, evaluation.errors[0].code);
  }
  const updated = patch('leaves', 'id_demande', id, {
    conge_type: type,
    date_debut: start,
    date_fin: end,
    motif,
    jour_demande: evaluation.days,
    solde_reste: evaluation.balanceAfter,
    est_dans_planning_annuel: Boolean(evaluation.planned),
    modified_at: now(),
  });
  const payload = {
    type: 'nouvelle_demande',
    title: 'Demande de congé modifiée',
    message: `${employee.full_name} a modifié sa demande : ${period(updated)}.`,
    target: leaveTarget(id),
  };
  if (leave.state === 'pending_respo') {
    notify(leave.id_respo_valideur, payload);
  } else {
    notifyHr(payload);
  }
  return updated;
};

export const cancel = async (id) => {
  await wait(450);
  const leave = requireLeave(id, OPEN_LEAVE_STATES);
  const updated = patch('leaves', 'id_demande', id, { state: 'cancelled', cancelled_at: now() });
  const employee = person(leave.id_demandeur);
  const payload = {
    type: 'rejet',
    title: 'Demande annulée',
    message: `${employee.full_name} a annulé sa demande ${period(leave)}.`,
    target: leaveTarget(id),
  };
  notify(leave.id_respo_valideur, payload);
  if (leave.state === 'pending_tech') {
    notifyTechnical(payload);
  }
  if (leave.state === 'pending_rh') {
    notifyHr(payload);
  }
  return updated;
};

export const managerApprove = async (id, { substituteId, comment }) => {
  await wait(550);
  const leave = requireLeave(id, ['pending_respo']);
  const substitute = requireAvailable(substituteId, leave);
  const updated = patch('leaves', 'id_demande', id, {
    state: 'pending_rh',
    validation_respo: 'validated',
    validated_respo_at: now(),
    comment_respo: comment || null,
    id_substitut_local: substituteId,
    validation_RH: 'pending',
  });
  const employee = person(leave.id_demandeur);
  notify(leave.id_demandeur, {
    type: 'validation',
    title: 'Accord de votre responsable',
    message: `Votre demande ${period(leave)} est transmise au Service RH.`,
    target: leaveTarget(id),
  });
  notify(substituteId, {
    type: 'planning',
    title: 'Remplacement à assurer',
    message: `Vous remplacez ${employee.full_name}, ${period(leave)}.`,
  });
  notifyHr({
    type: 'nouvelle_demande',
    title: 'Congé à valider définitivement',
    message: `${employee.full_name} (${employee.centre_nom}), remplacement par ${substitute.full_name}.`,
    target: leaveTarget(id),
  });
  return updated;
};

export const managerReject = async (id, { comment }) => {
  await wait(500);
  const leave = requireLeave(id, ['pending_respo']);
  const updated = patch('leaves', 'id_demande', id, {
    state: 'rejected',
    validation_respo: 'rejected',
    validated_respo_at: now(),
    comment_respo: comment,
  });
  notify(leave.id_demandeur, {
    type: 'rejet',
    title: 'Demande refusée',
    message: `Votre demande ${period(leave)} a été refusée : ${comment}`,
    target: leaveTarget(id),
  });
  return updated;
};

export const escalate = async (id, { comment }) => {
  await wait(550);
  const leave = requireLeave(id, ['pending_respo']);
  const updated = patch('leaves', 'id_demande', id, {
    state: 'pending_tech',
    escalated_at: now(),
    comment_escalade: comment,
    validation_tech: 'pending',
  });
  const employee = person(leave.id_demandeur);
  notifyTechnical({
    type: 'escalade',
    title: `Demande escaladée par ${employee.centre_nom}`,
    message: `${employee.full_name}, ${lowerFirst(employee.poste)} : ${period(leave)}.`,
    target: leaveTarget(id),
  });
  notify(leave.id_demandeur, {
    type: 'escalade',
    title: 'Recherche d’un substitut inter-centres',
    message: `Votre demande ${period(leave)} est transmise au responsable technique.`,
    target: leaveTarget(id),
  });
  return updated;
};

export const technicalFavorable = async (id, { actorId, substituteId, comment }) => {
  await wait(600);
  const leave = requireLeave(id, ['pending_tech']);
  const substitute = requireAvailable(substituteId, leave);
  const updated = patch('leaves', 'id_demande', id, {
    state: 'pending_confirmation',
    validation_tech: 'validated',
    validated_tech_at: now(),
    comment_tech: comment || null,
    id_tech_valideur: actorId,
    id_substitut_propose: substituteId,
  });
  const employee = person(leave.id_demandeur);
  notify(leave.id_respo_valideur, {
    type: 'retour_technique',
    title: 'Substitut inter-centres trouvé',
    message: `${substitute.full_name} (${substitute.centre_nom}) peut remplacer ${employee.full_name}.`,
    target: leaveTarget(id),
  });
  return updated;
};

export const technicalUnfavorable = async (id, { actorId, comment }) => {
  await wait(550);
  const leave = requireLeave(id, ['pending_tech']);
  const updated = patch('leaves', 'id_demande', id, {
    state: 'pending_confirmation',
    validation_tech: 'rejected',
    validated_tech_at: now(),
    comment_tech: comment,
    id_tech_valideur: actorId,
    id_substitut_propose: null,
  });
  const employee = person(leave.id_demandeur);
  notify(leave.id_respo_valideur, {
    type: 'retour_technique',
    title: 'Aucun substitut trouvé',
    message: `Pas de solution inter-centres pour ${employee.full_name}. La demande est à rejeter.`,
    target: leaveTarget(id),
  });
  return updated;
};

export const managerConfirm = async (id, { comment }) => {
  await wait(550);
  const leave = requireLeave(id, ['pending_confirmation']);
  if (leave.validation_tech !== 'validated') {
    throw new ServiceError('Aucun substitut n’a été proposé pour cette demande.', 'state');
  }
  const confirmedAt = now();
  const updated = patch('leaves', 'id_demande', id, {
    state: 'pending_rh',
    validation_confirmation: 'validated',
    confirmed_at: confirmedAt,
    comment_confirmation: comment || null,
    validation_respo: 'validated',
    validated_respo_at: confirmedAt,
    validation_RH: 'pending',
  });
  const employee = person(leave.id_demandeur);
  const substitute = person(leave.id_substitut_propose);
  notify(leave.id_demandeur, {
    type: 'validation',
    title: 'Accord de votre responsable',
    message: `Un substitut a été trouvé. Votre demande ${period(leave)} est transmise au Service RH.`,
    target: leaveTarget(id),
  });
  if (substitute) {
    notify(substitute.id_personne, {
      type: 'planning',
      title: 'Remplacement inter-centres à assurer',
      message: `Vous remplacez ${employee.full_name} à ${employee.centre_nom}, ${period(leave)}.`,
    });
  }
  notifyHr({
    type: 'nouvelle_demande',
    title: 'Congé à valider définitivement',
    message: `${employee.full_name} (${employee.centre_nom}), renfort inter-centres confirmé.`,
    target: leaveTarget(id),
  });
  return updated;
};

export const managerDecline = async (id, { comment }) => {
  await wait(500);
  const leave = requireLeave(id, ['pending_confirmation']);
  const declinedAt = now();
  const updated = patch('leaves', 'id_demande', id, {
    state: 'rejected',
    validation_confirmation: 'rejected',
    confirmed_at: declinedAt,
    comment_confirmation: comment,
    validation_respo: 'rejected',
    validated_respo_at: declinedAt,
  });
  notify(leave.id_demandeur, {
    type: 'rejet',
    title: 'Demande refusée',
    message: `Votre demande ${period(leave)} a été refusée : ${comment}`,
    target: leaveTarget(id),
  });
  return updated;
};

export const hrApprove = async (id, { actorId, comment }) => {
  await wait(600);
  const leave = requireLeave(id, ['pending_rh']);
  const employee = person(leave.id_demandeur);
  const deducts = LEAVE_TYPES[leave.conge_type].deducts;
  const balance = deducts ? employee.solde_conge - leave.jour_demande : employee.solde_conge;
  if (balance < 0) {
    throw new ServiceError('Solde insuffisant pour valider cette demande.', 'balance');
  }
  const updated = patch('leaves', 'id_demande', id, {
    state: 'validated',
    validation_RH: 'validated',
    validation_RH_at: now(),
    comment_RH: comment || null,
    id_rh_valideur: actorId,
    solde_reste: balance,
  });
  patch('employees', 'id_personne', employee.id_personne, { solde_conge: balance });
  notify(leave.id_demandeur, {
    type: 'validation',
    title: 'Congé validé',
    message: deducts
      ? `Votre congé ${period(leave)} est validé. Nouveau solde : ${balance} jours.`
      : `Votre congé ${period(leave)} est validé.`,
    target: leaveTarget(id),
  });
  notify(leave.id_respo_valideur, {
    type: 'validation',
    title: 'Congé validé par le Service RH',
    message: `${employee.full_name} : ${period(leave)}.`,
    target: leaveTarget(id),
  });
  return updated;
};

export const hrReject = async (id, { actorId, comment }) => {
  await wait(550);
  const leave = requireLeave(id, ['pending_rh']);
  const employee = person(leave.id_demandeur);
  const updated = patch('leaves', 'id_demande', id, {
    state: 'rejected',
    validation_RH: 'rejected',
    validation_RH_at: now(),
    comment_RH: comment,
    id_rh_valideur: actorId,
  });
  notify(leave.id_demandeur, {
    type: 'rejet',
    title: 'Demande refusée par le Service RH',
    message: `Votre demande ${period(leave)} a été refusée : ${comment}`,
    target: leaveTarget(id),
  });
  notify(leave.id_respo_valideur, {
    type: 'rejet',
    title: 'Congé refusé par le Service RH',
    message: `${employee.full_name} : ${comment}`,
    target: leaveTarget(id),
  });
  return updated;
};
