import { ABSENCE_CATEGORIES } from '../../data/constants';
import { countWorkingDays, formatRange, periodsOverlap, today } from '../../utils/date';
import { findBy, getState, insert, list as readAll, nextId, now, patch, ServiceError, wait } from './database';
import { absenceTarget, notify, notifyHr, person } from './notifier';

const period = (absence) => formatRange(absence.date_absence_debut, absence.date_absence_fin);

const requireAbsence = (id, states) => {
  const absence = findBy('absences', 'id_justification', id);
  if (!absence) {
    throw new ServiceError('Absence introuvable.', 'not_found');
  }
  if (!states.includes(absence.statut_paie)) {
    throw new ServiceError('Cette absence a déjà été traitée.', 'state');
  }
  return absence;
};

const announce = (employee, absence) => {
  const payload = {
    type: 'absence',
    title: 'Justification d’absence déclarée',
    message: `${employee.full_name} : ${ABSENCE_CATEGORIES[absence.categorie].label.toLowerCase()}, ${period(absence)}.`,
    target: absenceTarget(absence.id_justification),
  };
  notify(employee.id_respo_direct, payload);
  notifyHr(payload);
};

export const list = async () => readAll('absences');

export const declare = async ({ employeeId, start, end, category, motif }) => {
  await wait(600);
  if (end > today()) {
    throw new ServiceError('La justification concerne uniquement une absence passée.', 'future');
  }
  const duplicate = getState().absences.find(
    (absence) =>
      absence.id_personne === employeeId &&
      periodsOverlap(absence.date_absence_debut, absence.date_absence_fin, start, end)
  );
  if (duplicate) {
    throw new ServiceError(
      `Une absence est déjà enregistrée sur cette période (${duplicate.id_justification}).`,
      'duplicate'
    );
  }
  const timestamp = now();
  const absence = insert('absences', {
    id_justification: nextId('absence', 'ABS'),
    generated_at: timestamp,
    declared_at: timestamp,
    date_absence_debut: start,
    date_absence_fin: end,
    jours: Math.max(1, countWorkingDays(start, end)),
    categorie: category,
    motif_absence: motif,
    statut_paie: 'en_attente',
    validation_RH_at: null,
    comment_RH: null,
    id_personne: employeeId,
    id_rh_valideur: null,
  });
  announce(person(employeeId), absence);
  return absence;
};

export const justify = async (id, { category, motif }) => {
  await wait(550);
  const absence = requireAbsence(id, ['a_justifier']);
  const updated = patch('absences', 'id_justification', id, {
    statut_paie: 'en_attente',
    declared_at: now(),
    categorie: category,
    motif_absence: motif,
  });
  announce(person(absence.id_personne), updated);
  return updated;
};

export const review = async (id, { actorId, accepted, comment }) => {
  await wait(500);
  const absence = requireAbsence(id, ['en_attente', 'a_justifier']);
  const updated = patch('absences', 'id_justification', id, {
    statut_paie: accepted ? 'justifiee' : 'non_justifiee',
    validation_RH_at: now(),
    comment_RH: comment || null,
    id_rh_valideur: actorId,
  });
  notify(absence.id_personne, {
    type: accepted ? 'validation' : 'rejet',
    title: accepted ? 'Absence justifiée' : 'Absence non justifiée',
    message: accepted
      ? `Votre absence ${period(absence)} est régularisée pour la paie.`
      : `Votre absence ${period(absence)} n’est pas retenue : ${comment}`,
    target: absenceTarget(id),
  });
  return updated;
};

export const requestJustification = async (id) => {
  await wait(400);
  const absence = requireAbsence(id, ['a_justifier']);
  notify(absence.id_personne, {
    type: 'absence',
    title: 'Rappel : absence à justifier',
    message: `Déclarez le motif de votre absence ${period(absence)} avant le calcul de la paie.`,
    target: absenceTarget(id),
  });
  return absence;
};
