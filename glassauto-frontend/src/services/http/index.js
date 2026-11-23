import { apiClient, setAuthToken } from '../../api/client';
import { endpoints } from '../../api/endpoints';

const read = async (request) => {
  const response = await request;
  return response.data;
};

const authService = {
  demoAccounts: () => [],
  login: async (credentials) => {
    const session = await read(apiClient.post(endpoints.auth.login, credentials));
    setAuthToken(session.token);
    return session;
  },
  loginAs: async () => {
    throw new Error('Les profils de démonstration sont indisponibles avec une API réelle.');
  },
  logout: async () => {
    await apiClient.post(endpoints.auth.logout);
    setAuthToken(null);
  },
  requestPasswordReset: (payload) => read(apiClient.post(endpoints.auth.resetPassword, payload)),
  changePassword: (payload) => read(apiClient.post(endpoints.auth.changePassword, payload)),
  resetDemo: async () => {},
};

const employeeService = {
  list: () => read(apiClient.get(endpoints.employees.root)),
  setAvailability: (id, available) =>
    read(apiClient.patch(endpoints.employees.availability(id), { disponible: available })),
  updateContact: (id, payload) => read(apiClient.patch(endpoints.employees.detail(id), payload)),
};

const leaveAction = (action) => (id, payload) =>
  read(apiClient.post(endpoints.leaves.action(id, action), payload));

const leaveService = {
  list: () => read(apiClient.get(endpoints.leaves.root)),
  create: (payload) => read(apiClient.post(endpoints.leaves.root, payload)),
  update: (id, payload) => read(apiClient.put(endpoints.leaves.detail(id), payload)),
  alertNotice: (payload) => read(apiClient.post(endpoints.leaves.noticeAlert, payload)),
  cancel: leaveAction('cancel'),
  managerApprove: leaveAction('manager-approve'),
  managerReject: leaveAction('manager-reject'),
  escalate: leaveAction('escalate'),
  technicalFavorable: leaveAction('technical-favorable'),
  technicalUnfavorable: leaveAction('technical-unfavorable'),
  managerConfirm: leaveAction('manager-confirm'),
  managerDecline: leaveAction('manager-decline'),
  hrApprove: leaveAction('hr-approve'),
  hrReject: leaveAction('hr-reject'),
};

const documentAction = (action) => (id, payload) =>
  read(apiClient.post(endpoints.documents.action(id, action), payload));

const documentService = {
  list: () => read(apiClient.get(endpoints.documents.root)),
  create: (payload) => read(apiClient.post(endpoints.documents.root, payload)),
  startPreparation: documentAction('prepare'),
  markReady: documentAction('ready'),
  remindPickup: documentAction('remind'),
  confirmPickup: documentAction('collected'),
  reject: documentAction('reject'),
};

const absenceService = {
  list: () => read(apiClient.get(endpoints.absences.root)),
  declare: (payload) => read(apiClient.post(endpoints.absences.root, payload)),
  justify: (id, payload) => read(apiClient.post(endpoints.absences.action(id, 'justify'), payload)),
  review: (id, payload) => read(apiClient.post(endpoints.absences.action(id, 'review'), payload)),
  requestJustification: (id) => read(apiClient.post(endpoints.absences.action(id, 'remind'))),
};

const planningService = {
  list: () => read(apiClient.get(endpoints.plans.root)),
  addPeriod: (id, payload) => read(apiClient.post(endpoints.plans.periods(id), payload)),
  removePeriod: (id, periodId) => read(apiClient.delete(endpoints.plans.period(id, periodId))),
  submit: (id) => read(apiClient.post(endpoints.plans.submit(id))),
  remind: (id) => read(apiClient.post(endpoints.plans.remind(id))),
};

const notificationService = {
  list: () => read(apiClient.get(endpoints.notifications.root)),
  markRead: (id) => read(apiClient.patch(endpoints.notifications.detail(id), { read: true })),
  markAllRead: () => read(apiClient.post(endpoints.notifications.readAll)),
  remove: (id) => read(apiClient.delete(endpoints.notifications.detail(id))),
};

export const httpServices = {
  authService,
  employeeService,
  leaveService,
  documentService,
  absenceService,
  planningService,
  notificationService,
};
