import { getState, list as readAll, patch } from './database';

export const list = async () => readAll('notifications');

export const markRead = async (id) => patch('notifications', 'id', id, { read: true });

export const markAllRead = async (employeeId) => {
  getState()
    .notifications.filter((item) => item.id_personne === employeeId && !item.read)
    .forEach((item) => patch('notifications', 'id', item.id, { read: true }));
};

export const remove = async (id) => {
  const state = getState();
  state.notifications = state.notifications.filter((item) => item.id !== id);
};
