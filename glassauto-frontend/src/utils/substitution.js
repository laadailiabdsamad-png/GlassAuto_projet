import { centres, regionOf } from '../data/centres';
import { OPEN_LEAVE_STATES, POSTES } from '../data/constants';
import { formatRange, periodsOverlap } from './date';

const ABSENCE_STATES = ['validated', 'pending_rh', 'pending_confirmation'];

const ASSIGNMENT_STATES = ['validated', 'pending_rh', 'pending_confirmation'];

export const FIELD_POSTES = [POSTES.VITRAGE, POSTES.ADAS, POSTES.AIDE, POSTES.ACCUEIL];

export const substituteIdOf = (leave) =>
  leave.id_substitut_propose || leave.id_substitut_local || null;

export const findConflict = (employeeId, start, end, leaves, excludedId = null) => {
  const ownLeave = leaves.find(
    (leave) =>
      leave.id_demandeur === employeeId &&
      leave.id_demande !== excludedId &&
      ABSENCE_STATES.includes(leave.state) &&
      periodsOverlap(leave.date_debut, leave.date_fin, start, end)
  );
  if (ownLeave) {
    return {
      kind: 'leave',
      label: `En congé ${formatRange(ownLeave.date_debut, ownLeave.date_fin, { hideYear: true })}`,
    };
  }
  const assignment = leaves.find(
    (leave) =>
      substituteIdOf(leave) === employeeId &&
      leave.id_demande !== excludedId &&
      ASSIGNMENT_STATES.includes(leave.state) &&
      periodsOverlap(leave.date_debut, leave.date_fin, start, end)
  );
  if (assignment) {
    return {
      kind: 'assignment',
      label: `Déjà en remplacement ${formatRange(assignment.date_debut, assignment.date_fin, { hideYear: true })}`,
    };
  }
  return null;
};

const pendingRequest = (employeeId, start, end, leaves) =>
  leaves.find(
    (leave) =>
      leave.id_demandeur === employeeId &&
      OPEN_LEAVE_STATES.includes(leave.state) &&
      periodsOverlap(leave.date_debut, leave.date_fin, start, end)
  );

export const evaluateCandidate = (candidate, leave, requester, leaves) => {
  const conflict = findConflict(
    candidate.id_personne,
    leave.date_debut,
    leave.date_fin,
    leaves,
    leave.id_demande
  );
  if (conflict) {
    return { status: 'busy', label: conflict.label };
  }
  if (candidate.poste !== requester.poste) {
    return { status: 'unqualified', label: 'Poste différent' };
  }
  const pending = pendingRequest(candidate.id_personne, leave.date_debut, leave.date_fin, leaves);
  if (pending) {
    return { status: 'busy', label: 'Demande de congé en cours sur la période' };
  }
  return { status: 'available', label: 'Disponible sur la période' };
};

const STATUS_ORDER = { available: 0, busy: 1, unqualified: 2 };

export const localCandidates = (leave, requester, employees, leaves) =>
  employees
    .filter(
      (employee) =>
        employee.centre_nom === requester.centre_nom &&
        employee.departement === requester.departement &&
        employee.id_personne !== requester.id_personne &&
        employee.id_personne !== requester.id_respo_direct
    )
    .map((employee) => ({
      employee,
      ...evaluateCandidate(employee, leave, requester, leaves),
    }))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

export const networkCandidates = (leave, requester, employees, leaves) => {
  const requesterRegion = regionOf(requester.centre_nom);
  return employees
    .filter(
      (employee) =>
        employee.poste === requester.poste &&
        employee.centre_nom !== requester.centre_nom &&
        FIELD_POSTES.includes(employee.poste)
    )
    .map((employee) => {
      const region = regionOf(employee.centre_nom);
      return {
        employee,
        region,
        sameRegion: region === requesterRegion,
        ...evaluateCandidate(employee, leave, requester, leaves),
      };
    })
    .sort((a, b) => {
      if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      }
      if (a.sameRegion !== b.sameRegion) {
        return a.sameRegion ? -1 : 1;
      }
      return a.employee.centre_nom.localeCompare(b.employee.centre_nom);
    });
};

export const centreAvailability = (employees, leaves, start, end, poste = null) =>
  centres.map((centre) => {
    const team = employees.filter(
      (employee) =>
        employee.centre_nom === centre.nom &&
        FIELD_POSTES.includes(employee.poste) &&
        (!poste || employee.poste === poste)
    );
    const members = team.map((employee) => ({
      employee,
      conflict: findConflict(employee.id_personne, start, end, leaves),
    }));
    const available = members.filter((member) => !member.conflict).length;
    return { ...centre, members, total: team.length, available };
  });
