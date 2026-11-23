import { employees } from '../../data/employees';
import { leaves } from '../../data/leaves';
import { documents } from '../../data/documents';
import { absences } from '../../data/absences';
import { notifications } from '../../data/notifications';
import { annualPlans } from '../../data/annualPlans';

const LATENCY = 420;

const clone = (value) => JSON.parse(JSON.stringify(value));

const createState = () => ({
  employees: clone(employees),
  leaves: clone(leaves),
  documents: clone(documents),
  absences: clone(absences),
  notifications: clone(notifications),
  annualPlans: clone(annualPlans),
  counters: { leave: 5000, document: 5000, absence: 5000, notification: 5000, period: 5000 },
});

let state = createState();

export class ServiceError extends Error {
  constructor(message, code = 'invalid') {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

export const wait = (duration = LATENCY) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

export const getState = () => state;

export const resetState = () => {
  state = createState();
};

export const list = (collection) => [...state[collection]];

export const findBy = (collection, key, value) =>
  state[collection].find((item) => item[key] === value) || null;

export const patch = (collection, key, value, changes) => {
  let updated = null;
  state[collection] = state[collection].map((item) => {
    if (item[key] !== value) {
      return item;
    }
    updated = { ...item, ...changes };
    return updated;
  });
  if (!updated) {
    throw new ServiceError('Élément introuvable.', 'not_found');
  }
  return updated;
};

export const insert = (collection, item) => {
  state[collection] = [item, ...state[collection]];
  return item;
};

export const nextId = (counter, prefix) => {
  state.counters[counter] += 1;
  return `${prefix}-${state.counters[counter]}`;
};

export const now = () => new Date().toISOString();
