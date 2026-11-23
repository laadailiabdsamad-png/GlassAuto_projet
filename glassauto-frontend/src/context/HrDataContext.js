import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  absenceService,
  authService,
  documentService,
  employeeService,
  leaveService,
  notificationService,
  planningService,
} from '../services';
import { indexBy } from '../utils/format';

export const HrDataContext = createContext(null);

const emptyData = {
  employees: [],
  leaves: [],
  documents: [],
  absences: [],
  notifications: [],
  annualPlans: [],
};

const loadAll = async () => {
  const [employees, leaves, documents, absences, notifications, annualPlans] = await Promise.all([
    employeeService.list(),
    leaveService.list(),
    documentService.list(),
    absenceService.list(),
    notificationService.list(),
    planningService.list(),
  ]);
  return { employees, leaves, documents, absences, notifications, annualPlans };
};

const bind = (service, names, run) =>
  names.reduce((accumulator, name) => {
    accumulator[name] = (...parameters) => run(() => service[name](...parameters));
    return accumulator;
  }, {});

export function HrDataProvider({ children }) {
  const [data, setData] = useState(emptyData);
  const [status, setStatus] = useState('loading');

  const refresh = useCallback(async () => {
    try {
      const next = await loadAll();
      setData(next);
      setStatus('ready');
    } catch {
      setStatus((current) => (current === 'ready' ? 'ready' : 'error'));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const actions = useMemo(() => {
    const run = async (operation) => {
      const result = await operation();
      await refresh();
      return result;
    };
    return {
      leaves: bind(
        leaveService,
        [
          'create',
          'update',
          'cancel',
          'alertNotice',
          'managerApprove',
          'managerReject',
          'escalate',
          'technicalFavorable',
          'technicalUnfavorable',
          'managerConfirm',
          'managerDecline',
          'hrApprove',
          'hrReject',
        ],
        run
      ),
      documents: bind(
        documentService,
        ['create', 'startPreparation', 'markReady', 'remindPickup', 'confirmPickup', 'reject'],
        run
      ),
      absences: bind(
        absenceService,
        ['declare', 'justify', 'review', 'requestJustification'],
        run
      ),
      plans: bind(planningService, ['addPeriod', 'removePeriod', 'submit', 'remind'], run),
      notifications: bind(notificationService, ['markRead', 'markAllRead', 'remove'], run),
      employees: bind(employeeService, ['setAvailability', 'updateContact'], run),
      demo: bind(authService, ['resetDemo'], run),
    };
  }, [refresh]);

  const employeesById = useMemo(() => indexBy(data.employees, 'id_personne'), [data.employees]);

  const value = useMemo(
    () => ({ ...data, status, refresh, actions, employeesById }),
    [data, status, refresh, actions, employeesById]
  );

  return <HrDataContext.Provider value={value}>{children}</HrDataContext.Provider>;
}
