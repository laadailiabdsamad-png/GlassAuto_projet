import {
  addDays,
  countWorkingDays,
  daysFromToday,
  isWorkingDay,
  timestampFromToday,
} from '../utils/date';
import { createRandom } from './random';
import { employees } from './employees';
import { ABSENCE_CATEGORY_ORDER, ROLES } from './constants';

const HR_ID = 4;

const reasons = {
  maladie: 'Consultation médicale et repos prescrit par le médecin.',
  famille: 'Hospitalisation d’un proche, présence indispensable.',
  transport: 'Interruption de la ligne de transport vers le centre.',
  administratif: 'Convocation administrative non reportable.',
  autre: 'Empêchement personnel signalé par téléphone au responsable.',
};

let sequence = 200;

const previousWorkingDay = (iso) => {
  let cursor = iso;
  while (!isWorkingDay(cursor)) {
    cursor = addDays(cursor, -1);
  }
  return cursor;
};

const createAbsence = (seed) => {
  sequence += 1;
  const start = previousWorkingDay(daysFromToday(seed.start));
  const end = previousWorkingDay(addDays(start, seed.length || 0));
  const reviewed = seed.state === 'justifiee' || seed.state === 'non_justifiee';
  const declared = seed.state !== 'a_justifier';
  return {
    id_justification: `ABS-${sequence}`,
    generated_at: timestampFromToday(Math.min(seed.start + (seed.length || 0) + 1, 0), 9, 35),
    declared_at: declared
      ? timestampFromToday(Math.min(seed.start + (seed.length || 0) + 1, 0), 10, 5)
      : null,
    date_absence_debut: start,
    date_absence_fin: end,
    jours: Math.max(1, countWorkingDays(start, end)),
    categorie: declared ? seed.categorie : null,
    motif_absence: declared ? seed.motif || reasons[seed.categorie] : null,
    statut_paie: seed.state,
    validation_RH_at: reviewed
      ? timestampFromToday(Math.min(seed.start + (seed.length || 0) + 3, 0), 15, 20)
      : null,
    comment_RH: reviewed ? seed.comment || null : null,
    id_personne: seed.id_personne,
    id_rh_valideur: reviewed ? HR_ID : null,
  };
};

const featured = [
  createAbsence({ id_personne: 1, start: -6, length: 0, state: 'a_justifier' }),
  createAbsence({
    id_personne: 1,
    start: -13,
    length: 1,
    state: 'en_attente',
    categorie: 'maladie',
    motif: 'Forte fièvre, consultation au centre médical de Guéliz.',
  }),
  createAbsence({ id_personne: 1, start: -71, state: 'justifiee', categorie: 'famille', comment: 'Absence régularisée en paie.' }),
  createAbsence({ id_personne: 1, start: -125, state: 'non_justifiee', categorie: 'transport', comment: 'Absence non signalée au responsable.' }),
  createAbsence({ id_personne: 12, start: -3, state: 'en_attente', categorie: 'famille' }),
  createAbsence({ id_personne: 18, start: -8, length: 1, state: 'a_justifier' }),
  createAbsence({ id_personne: 2, start: -27, state: 'justifiee', categorie: 'maladie', comment: 'Absence régularisée en paie.' }),
  createAbsence({ id_personne: 3, start: -52, state: 'justifiee', categorie: 'administratif', comment: 'Convocation présentée.' }),
];

const generated = () => {
  const random = createRandom(4102);
  const pool = employees.filter((employee) => employee.id_personne > 20 && employee.role !== ROLES.RH);
  const records = [];
  const add = (state, start) =>
    records.push(
      createAbsence({
        id_personne: random.pick(pool).id_personne,
        start,
        length: random.integer(0, 2),
        state,
        categorie: random.pick(ABSENCE_CATEGORY_ORDER),
        comment: state === 'justifiee' ? 'Absence régularisée en paie.' : 'Motif insuffisant, retenue appliquée.',
      })
    );
  for (let index = 0; index < 46; index += 1) {
    add(random.chance(0.78) ? 'justifiee' : 'non_justifiee', random.integer(-170, -9));
  }
  for (let index = 0; index < 5; index += 1) {
    add('en_attente', random.integer(-9, -4));
  }
  for (let index = 0; index < 6; index += 1) {
    add('a_justifier', random.integer(-12, -4));
  }
  return records;
};

export const absences = [...featured, ...generated()];
