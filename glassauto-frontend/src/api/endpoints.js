export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
  },
  employees: {
    root: '/personnes',
    detail: (id) => `/personnes/${id}`,
    availability: (id) => `/personnes/${id}/disponibilite`,
  },
  leaves: {
    root: '/demandes-conge',
    detail: (id) => `/demandes-conge/${id}`,
    action: (id, action) => `/demandes-conge/${id}/${action}`,
    noticeAlert: '/demandes-conge/alerte-preavis',
  },
  documents: {
    root: '/demandes-doc',
    action: (id, action) => `/demandes-doc/${id}/${action}`,
  },
  absences: {
    root: '/justifications-absence',
    action: (id, action) => `/justifications-absence/${id}/${action}`,
  },
  plans: {
    root: '/plannings-annuels',
    periods: (id) => `/plannings-annuels/${id}/periodes`,
    period: (id, periodId) => `/plannings-annuels/${id}/periodes/${periodId}`,
    submit: (id) => `/plannings-annuels/${id}/soumettre`,
    remind: (id) => `/plannings-annuels/${id}/relancer`,
  },
  notifications: {
    root: '/notifications',
    detail: (id) => `/notifications/${id}`,
    readAll: '/notifications/lues',
  },
};
