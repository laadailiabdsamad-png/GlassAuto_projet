import { ROLES } from '../../data/constants';
import { findBy, getState, insert, nextId, now } from './database';

export const notify = (recipientId, { type, title, message, target }) => {
  if (!recipientId) {
    return null;
  }
  return insert('notifications', {
    id: nextId('notification', 'NOT'),
    id_personne: recipientId,
    type,
    title,
    message,
    created_at: now(),
    read: false,
    target: target || null,
  });
};

export const notifyRole = (role, payload) =>
  getState()
    .employees.filter((employee) => employee.role === role)
    .forEach((employee) => notify(employee.id_personne, payload));

export const notifyHr = (payload) => notifyRole(ROLES.RH, payload);

export const notifyTechnical = (payload) => notifyRole(ROLES.RESPONSABLE_TECHNIQUE, payload);

export const person = (id) => findBy('employees', 'id_personne', id);

export const leaveTarget = (id) => ({ screen: 'LeaveDetail', params: { id } });

export const documentTarget = (id) => ({ screen: 'DocumentDetail', params: { id } });

export const absenceTarget = (id) => ({ screen: 'AbsenceDetail', params: { id } });
