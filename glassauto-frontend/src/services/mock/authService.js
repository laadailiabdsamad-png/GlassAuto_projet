import { DEMO_IDS } from '../../data/employees';
import { findBy, getState, resetState, ServiceError, wait } from './database';

export const DEMO_PASSWORD = 'demo2026';

export const demoAccounts = () =>
  [DEMO_IDS.collaborateur, DEMO_IDS.responsable, DEMO_IDS.technique, DEMO_IDS.rh].map((id) =>
    findBy('employees', 'id_personne', id)
  );

export const login = async ({ email, password }) => {
  await wait(700);
  const employee = getState().employees.find(
    (item) => item.email === String(email).trim().toLowerCase()
  );
  if (!employee || password !== DEMO_PASSWORD) {
    throw new ServiceError('Identifiant ou mot de passe incorrect.', 'credentials');
  }
  return { userId: employee.id_personne, token: `demo-${employee.id_personne}` };
};

export const loginAs = async (userId) => {
  await wait(450);
  const employee = findBy('employees', 'id_personne', userId);
  if (!employee) {
    throw new ServiceError('Profil de démonstration introuvable.', 'credentials');
  }
  return { userId: employee.id_personne, token: `demo-${employee.id_personne}` };
};

export const logout = async () => {
  await wait(200);
};

export const requestPasswordReset = async ({ email }) => {
  await wait(600);
  return { email: String(email).trim().toLowerCase() };
};

export const changePassword = async ({ current, next }) => {
  await wait(600);
  if (current !== DEMO_PASSWORD) {
    throw new ServiceError('Le mot de passe actuel est incorrect.', 'credentials');
  }
  return { simulated: true, length: next.length };
};

export const resetDemo = async () => {
  await wait(500);
  resetState();
};
