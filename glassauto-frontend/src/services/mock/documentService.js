import { DOCUMENT_TYPES, PICKUP_LOCATION } from '../../data/constants';
import { findBy, insert, list as readAll, nextId, now, patch, ServiceError, wait } from './database';
import { documentTarget, notify, notifyHr, person } from './notifier';

const labelOf = (document) => DOCUMENT_TYPES[document.type_doc].label;

const requireDocument = (id, states) => {
  const document = findBy('documents', 'id_demande', id);
  if (!document) {
    throw new ServiceError('Demande introuvable.', 'not_found');
  }
  if (!states.includes(document.state)) {
    throw new ServiceError('Cette demande a déjà été traitée.', 'state');
  }
  return document;
};

export const list = async () => readAll('documents');

export const create = async ({ employeeId, type, precision, motif, copies }) => {
  await wait(600);
  const employee = person(employeeId);
  const document = insert('documents', {
    id_demande: nextId('document', 'DOC'),
    state: 'pending_rh',
    generated_at: now(),
    type_doc: type,
    precision: precision || null,
    motif,
    exemplaires: copies,
    validation_RH: 'pending',
    validation_RH_at: null,
    comment_RH: null,
    is_ready_for_pickup: false,
    notified_at: null,
    collected_at: null,
    id_demandeur: employeeId,
    id_respo_valideur: employee.id_respo_direct,
    id_rh_valideur: null,
  });
  notifyHr({
    type: 'document',
    title: 'Nouvelle demande de document',
    message: `${employee.full_name} demande : ${labelOf(document).toLowerCase()}.`,
    target: documentTarget(document.id_demande),
  });
  return document;
};

export const startPreparation = async (id, { actorId }) => {
  await wait(450);
  const document = requireDocument(id, ['pending_rh']);
  const updated = patch('documents', 'id_demande', id, {
    state: 'preparation',
    validation_RH: 'validated',
    validation_RH_at: now(),
    id_rh_valideur: actorId,
  });
  notify(document.id_demandeur, {
    type: 'document',
    title: 'Document en préparation',
    message: `Le Service RH prépare votre document : ${labelOf(document).toLowerCase()}.`,
    target: documentTarget(id),
  });
  return updated;
};

export const markReady = async (id, { actorId, comment }) => {
  await wait(550);
  const document = requireDocument(id, ['preparation']);
  const updated = patch('documents', 'id_demande', id, {
    state: 'ready',
    is_ready_for_pickup: true,
    notified_at: now(),
    comment_RH: comment || null,
    id_rh_valideur: actorId,
  });
  notify(document.id_demandeur, {
    type: 'document_pret',
    title: 'Document prêt au retrait',
    message: `${labelOf(document)} : signé et cacheté, à retirer en main propre (${PICKUP_LOCATION}).`,
    target: documentTarget(id),
  });
  return updated;
};

export const remindPickup = async (id) => {
  await wait(400);
  const document = requireDocument(id, ['ready']);
  notify(document.id_demandeur, {
    type: 'document_pret',
    title: 'Rappel de retrait',
    message: `${labelOf(document)} vous attend toujours au bureau RH.`,
    target: documentTarget(id),
  });
  return patch('documents', 'id_demande', id, { notified_at: now() });
};

export const confirmPickup = async (id) => {
  await wait(450);
  requireDocument(id, ['ready']);
  return patch('documents', 'id_demande', id, { state: 'completed', collected_at: now() });
};

export const reject = async (id, { actorId, comment }) => {
  await wait(500);
  const document = requireDocument(id, ['pending_rh', 'preparation']);
  const updated = patch('documents', 'id_demande', id, {
    state: 'rejected',
    validation_RH: 'rejected',
    validation_RH_at: now(),
    comment_RH: comment,
    id_rh_valideur: actorId,
  });
  notify(document.id_demandeur, {
    type: 'rejet',
    title: 'Demande de document refusée',
    message: `${labelOf(document)} : ${comment}`,
    target: documentTarget(id),
  });
  return updated;
};
