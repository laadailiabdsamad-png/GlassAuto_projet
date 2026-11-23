import { centres } from '../data/centres';
import { DOCUMENT_TYPE_ORDER, LEAVE_TYPE_ORDER } from '../data/constants';
import {
  addMonths,
  eachDay,
  isWithin,
  isWorkingDay,
  MONTHS_SHORT,
  parseISO,
  toISO,
  today,
} from './date';
import { percent } from './format';

export const lastMonths = (count) => {
  const current = today();
  const months = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const iso = addMonths(current, -index);
    months.push({ key: iso.slice(0, 7), label: MONTHS_SHORT[parseISO(iso).getMonth()].replace('.', '') });
  }
  return months;
};

const monthOfTimestamp = (timestamp) => toISO(new Date(timestamp)).slice(0, 7);

export const leaveDaysByMonth = (leaves, count = 6) =>
  lastMonths(count).map((month) => {
    const total = leaves
      .filter((leave) => leave.state === 'validated')
      .reduce(
        (sum, leave) =>
          sum +
          eachDay(leave.date_debut, leave.date_fin).filter(
            (day) => day.startsWith(month.key) && isWorkingDay(day)
          ).length,
        0
      );
    return { ...month, value: total };
  });

export const requestsByMonth = (records, count = 6) =>
  lastMonths(count).map((month) => ({
    ...month,
    value: records.filter((record) => monthOfTimestamp(record.generated_at) === month.key).length,
  }));

export const leavesByType = (leaves) =>
  LEAVE_TYPE_ORDER.map((type) => ({
    type,
    value: leaves.filter((leave) => leave.state === 'validated' && leave.conge_type === type).length,
  }));

export const documentsByType = (documents) =>
  DOCUMENT_TYPE_ORDER.map((type) => ({
    type,
    value: documents.filter((document) => document.type_doc === type).length,
  })).sort((a, b) => b.value - a.value);

export const absentOn = (leaves, date) =>
  leaves.filter((leave) => leave.state === 'validated' && isWithin(date, leave.date_debut, leave.date_fin));

export const approvalRate = (leaves) => {
  const approved = leaves.filter((leave) => leave.state === 'validated').length;
  const refused = leaves.filter((leave) => leave.state === 'rejected').length;
  return percent(approved, approved + refused);
};

export const averageProcessingDays = (leaves) => {
  const closed = leaves.filter((leave) => leave.state === 'validated' && leave.validation_RH_at);
  if (closed.length === 0) {
    return 0;
  }
  const total = closed.reduce(
    (sum, leave) =>
      sum + (new Date(leave.validation_RH_at).getTime() - new Date(leave.generated_at).getTime()),
    0
  );
  return total / closed.length / 86400000;
};

export const averageDocumentDays = (documents) => {
  const closed = documents.filter((document) => document.notified_at);
  if (closed.length === 0) {
    return 0;
  }
  const total = closed.reduce(
    (sum, document) =>
      sum + (new Date(document.notified_at).getTime() - new Date(document.generated_at).getTime()),
    0
  );
  return total / closed.length / 86400000;
};

export const justificationRate = (absences) => {
  const reviewed = absences.filter((absence) =>
    ['justifiee', 'non_justifiee'].includes(absence.statut_paie)
  );
  const justified = reviewed.filter((absence) => absence.statut_paie === 'justifiee').length;
  return percent(justified, reviewed.length);
};

export const centreAbsenceRanking = (leaves, employeesById, limit = 6) =>
  centres
    .map((centre) => ({
      label: centre.nom,
      value: leaves
        .filter(
          (leave) =>
            leave.state === 'validated' &&
            employeesById[leave.id_demandeur] &&
            employeesById[leave.id_demandeur].centre_nom === centre.nom
        )
        .reduce((sum, leave) => sum + leave.jour_demande, 0),
      effectif: centre.effectif,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
