import {
  addDays,
  countWorkingDays,
  daysFromToday,
  periodsOverlap,
  timestampFromToday,
} from '../utils/date';
import { createRandom } from './random';
import { employees } from './employees';
import { LEAVE_TYPES, POSTES, ROLES } from './constants';

const employeeById = employees.reduce((accumulator, employee) => {
  accumulator[employee.id_personne] = employee;
  return accumulator;
}, {});

const HR_ID = 4;
const TECH_ID = 3;

let sequence = 1000;

const createLeave = (seed) => {
  sequence += 1;
  const employee = employeeById[seed.id_demandeur];
  const days = countWorkingDays(seed.date_debut, seed.date_fin);
  const type = seed.conge_type || 'annuel';
  return {
    id_demande: `CG-${sequence}`,
    state: seed.state,
    generated_at: seed.generated_at,
    modified_at: null,
    cancelled_at: null,
    conge_type: type,
    jour_demande: days,
    date_debut: seed.date_debut,
    date_fin: seed.date_fin,
    motif: seed.motif || 'Repos annuel',
    solde_reste: Math.max(0, LEAVE_TYPES[type].deducts ? employee.solde_conge - days : employee.solde_conge),
    est_dans_planning_annuel: seed.est_dans_planning_annuel ?? false,
    routing: seed.routing || 'standard',
    validation_respo: seed.validation_respo ?? null,
    validated_respo_at: seed.validated_respo_at ?? null,
    comment_respo: seed.comment_respo ?? null,
    id_substitut_local: seed.id_substitut_local ?? null,
    escalated_at: seed.escalated_at ?? null,
    comment_escalade: seed.comment_escalade ?? null,
    validation_tech: seed.validation_tech ?? null,
    validated_tech_at: seed.validated_tech_at ?? null,
    comment_tech: seed.comment_tech ?? null,
    id_tech_valideur: seed.validation_tech ? TECH_ID : null,
    id_substitut_propose: seed.id_substitut_propose ?? null,
    validation_confirmation: seed.validation_confirmation ?? null,
    confirmed_at: seed.confirmed_at ?? null,
    comment_confirmation: seed.comment_confirmation ?? null,
    validation_RH: seed.validation_RH ?? null,
    validation_RH_at: seed.validation_RH_at ?? null,
    comment_RH: seed.comment_RH ?? null,
    id_rh_valideur: seed.validation_RH ? HR_ID : null,
    id_demandeur: seed.id_demandeur,
    id_respo_valideur: employee.id_respo_direct,
  };
};

const validatedPath = (createdOffset) => ({
  state: 'validated',
  generated_at: timestampFromToday(createdOffset, 9, 20),
  validation_respo: 'validated',
  validated_respo_at: timestampFromToday(createdOffset + 1, 11, 5),
  comment_respo: 'Remplacement organisé au sein du centre.',
  validation_RH: 'validated',
  validation_RH_at: timestampFromToday(createdOffset + 2, 15, 40),
  comment_RH: 'Congé validé, bon repos.',
});

const findByPoste = (poste, centre, position = 0) =>
  employees.filter((employee) => employee.poste === poste && employee.centre_nom === centre)[position];

const idOf = (poste, centre, position = 0) => findByPoste(poste, centre, position).id_personne;

const managerOf = (centre) =>
  employees.find(
    (employee) => employee.centre_nom === centre && employee.role === ROLES.RESPONSABLE_CENTRE
  ).id_personne;

const featuredLeaves = [
  createLeave({
    id_demandeur: 1,
    date_debut: daysFromToday(-96),
    date_fin: daysFromToday(-88),
    est_dans_planning_annuel: true,
    motif: 'Vacances en famille',
    id_substitut_local: 11,
    ...validatedPath(-140),
  }),
  createLeave({
    id_demandeur: 1,
    date_debut: daysFromToday(-46),
    date_fin: daysFromToday(-44),
    conge_type: 'exceptionnel',
    motif: 'Naissance de ma fille',
    id_substitut_local: 12,
    ...validatedPath(-68),
  }),
  createLeave({
    id_demandeur: 1,
    date_debut: daysFromToday(-20),
    date_fin: daysFromToday(-16),
    motif: 'Voyage personnel',
    state: 'rejected',
    generated_at: timestampFromToday(-44, 10, 2),
    validation_respo: 'rejected',
    validated_respo_at: timestampFromToday(-43, 16, 30),
    comment_respo: 'Deux techniciens déjà absents sur cette période. Merci de proposer une autre date.',
  }),
  createLeave({
    id_demandeur: 1,
    date_debut: daysFromToday(34),
    date_fin: daysFromToday(41),
    motif: 'Congé de fin d\'année',
    state: 'pending_respo',
    generated_at: timestampFromToday(-1, 8, 45),
    validation_respo: 'pending',
  }),
  createLeave({
    id_demandeur: 1,
    date_debut: daysFromToday(62),
    date_fin: daysFromToday(66),
    motif: 'Démarches personnelles',
    state: 'pending_rh',
    generated_at: timestampFromToday(-5, 14, 12),
    validation_respo: 'validated',
    validated_respo_at: timestampFromToday(-3, 10, 30),
    comment_respo: 'Hamza assure le remplacement.',
    id_substitut_local: 11,
    validation_RH: 'pending',
  }),
  createLeave({
    id_demandeur: 11,
    date_debut: daysFromToday(26),
    date_fin: daysFromToday(31),
    motif: 'Mariage de mon frère',
    state: 'pending_respo',
    generated_at: timestampFromToday(-2, 17, 5),
    validation_respo: 'pending',
  }),
  createLeave({
    id_demandeur: 14,
    date_debut: daysFromToday(24),
    date_fin: daysFromToday(30),
    motif: 'Repos annuel',
    state: 'pending_respo',
    generated_at: timestampFromToday(0, 7, 50),
    validation_respo: 'pending',
  }),
  createLeave({
    id_demandeur: 17,
    date_debut: daysFromToday(48),
    date_fin: daysFromToday(53),
    motif: 'Déménagement',
    state: 'pending_tech',
    generated_at: timestampFromToday(-4, 9, 10),
    validation_respo: 'pending',
    escalated_at: timestampFromToday(-2, 11, 45),
    comment_escalade: 'Les trois autres aides sont absents ou déjà positionnés sur cette semaine.',
    validation_tech: 'pending',
  }),
  createLeave({
    id_demandeur: 19,
    date_debut: daysFromToday(38),
    date_fin: daysFromToday(44),
    motif: 'Voyage à l\'étranger',
    state: 'pending_confirmation',
    generated_at: timestampFromToday(-8, 13, 25),
    validation_respo: 'pending',
    escalated_at: timestampFromToday(-6, 9, 30),
    comment_escalade: 'Une seule personne à l\'accueil du centre.',
    validation_tech: 'validated',
    validated_tech_at: timestampFromToday(-1, 16, 20),
    comment_tech: 'Remplacement possible depuis Agadir, déplacement confirmé.',
    id_substitut_propose: idOf(POSTES.ACCUEIL, 'Agadir'),
  }),
  createLeave({
    id_demandeur: 16,
    date_debut: daysFromToday(21),
    date_fin: daysFromToday(25),
    motif: 'Travaux à domicile',
    state: 'pending_confirmation',
    generated_at: timestampFromToday(-9, 10, 40),
    validation_respo: 'pending',
    escalated_at: timestampFromToday(-7, 15, 0),
    comment_escalade: 'Aucun aide disponible sur la période.',
    validation_tech: 'rejected',
    validated_tech_at: timestampFromToday(-1, 9, 55),
    comment_tech: 'Aucun aide disponible dans les centres de la région à ces dates.',
  }),
  createLeave({
    id_demandeur: 15,
    date_debut: daysFromToday(-2),
    date_fin: daysFromToday(4),
    est_dans_planning_annuel: true,
    id_substitut_local: 18,
    ...validatedPath(-48),
  }),
  createLeave({
    id_demandeur: 13,
    date_debut: daysFromToday(9),
    date_fin: daysFromToday(14),
    est_dans_planning_annuel: true,
    id_substitut_local: 12,
    ...validatedPath(-35),
  }),
  createLeave({
    id_demandeur: 18,
    date_debut: daysFromToday(47),
    date_fin: daysFromToday(54),
    est_dans_planning_annuel: true,
    ...validatedPath(-20),
  }),
  createLeave({
    id_demandeur: 12,
    date_debut: daysFromToday(-64),
    date_fin: daysFromToday(-58),
    est_dans_planning_annuel: true,
    id_substitut_local: 13,
    ...validatedPath(-110),
  }),
  createLeave({
    id_demandeur: 14,
    date_debut: daysFromToday(-120),
    date_fin: daysFromToday(-112),
    motif: 'Vacances d\'été',
    state: 'validated',
    generated_at: timestampFromToday(-160, 9, 0),
    validation_respo: 'validated',
    validated_respo_at: timestampFromToday(-153, 9, 0),
    escalated_at: timestampFromToday(-158, 9, 0),
    comment_escalade: 'Seul technicien ADAS du centre.',
    validation_tech: 'validated',
    validated_tech_at: timestampFromToday(-155, 14, 0),
    comment_tech: 'Renfort ADAS depuis Agadir.',
    id_substitut_propose: idOf(POSTES.ADAS, 'Agadir'),
    validation_confirmation: 'validated',
    confirmed_at: timestampFromToday(-153, 9, 0),
    comment_confirmation: 'Renfort confirmé.',
    validation_RH: 'validated',
    validation_RH_at: timestampFromToday(-151, 11, 0),
    comment_RH: 'Validé.',
  }),
  createLeave({
    id_demandeur: 2,
    date_debut: daysFromToday(52),
    date_fin: daysFromToday(58),
    motif: 'Congé annuel de la responsable',
    routing: 'responsable',
    state: 'pending_rh',
    generated_at: timestampFromToday(-1, 18, 10),
    validation_RH: 'pending',
  }),
  createLeave({
    id_demandeur: 2,
    date_debut: daysFromToday(-150),
    date_fin: daysFromToday(-141),
    motif: 'Vacances d\'été',
    routing: 'responsable',
    est_dans_planning_annuel: true,
    state: 'validated',
    generated_at: timestampFromToday(-190, 9, 0),
    validation_RH: 'validated',
    validation_RH_at: timestampFromToday(-188, 10, 0),
    comment_RH: 'Validé.',
  }),
  createLeave({
    id_demandeur: 3,
    date_debut: daysFromToday(-84),
    date_fin: daysFromToday(-78),
    routing: 'responsable',
    state: 'validated',
    generated_at: timestampFromToday(-120, 9, 0),
    validation_RH: 'validated',
    validation_RH_at: timestampFromToday(-118, 10, 0),
    comment_RH: 'Validé.',
  }),
];

const escalationSeeds = [
  {
    id_demandeur: idOf(POSTES.ADAS, 'Fès'),
    start: 23,
    length: 6,
    motif: 'Repos annuel',
    comment: 'Unique technicien ADAS du centre de Fès.',
    created: -4,
  },
  {
    id_demandeur: idOf(POSTES.VITRAGE, 'Essaouira'),
    start: 29,
    length: 4,
    motif: 'Événement familial',
    comment: 'Centre à deux personnes, aucun relais possible sur place.',
    created: -3,
  },
  {
    id_demandeur: idOf(POSTES.VITRAGE, 'Oujda'),
    start: 36,
    length: 7,
    motif: 'Voyage',
    comment: 'Second technicien déjà planifié en congé.',
    created: -5,
  },
  {
    id_demandeur: idOf(POSTES.ADAS, 'Tanger'),
    start: 41,
    length: 5,
    motif: 'Repos annuel',
    comment: 'Calibrages programmés, remplacement ADAS indispensable.',
    created: -2,
  },
];

const escalatedLeaves = escalationSeeds.map((seed) =>
  createLeave({
    id_demandeur: seed.id_demandeur,
    date_debut: daysFromToday(seed.start),
    date_fin: daysFromToday(seed.start + seed.length),
    motif: seed.motif,
    state: 'pending_tech',
    generated_at: timestampFromToday(seed.created, 9, 30),
    validation_respo: 'pending',
    escalated_at: timestampFromToday(seed.created + 1, 14, 15),
    comment_escalade: seed.comment,
    validation_tech: 'pending',
  })
);

const technicalHistorySeeds = [
  { centre: 'Safi', poste: POSTES.VITRAGE, start: -70, from: 'Arsalane', ok: true },
  { centre: 'Fès', poste: POSTES.ADAS, start: -55, from: 'Maarif', ok: true },
  { centre: 'Nador', poste: POSTES.VITRAGE, start: -38, from: 'Oujda', ok: true },
  { centre: 'Dakhla', poste: POSTES.VITRAGE, start: -33, from: null, ok: false },
  { centre: 'Tiznit', poste: POSTES.AIDE, start: -26, from: 'Agadir', ok: true },
  { centre: 'Beni Mellal', poste: POSTES.ADAS, start: -18, from: 'Arsalane', ok: true },
  { centre: 'Guelmim', poste: POSTES.VITRAGE, start: 6, from: null, ok: false },
  { centre: 'Settat', poste: POSTES.VITRAGE, start: 12, from: 'Maarif', ok: true },
];

const technicalHistory = technicalHistorySeeds.map((seed) => {
  const created = seed.start - 32;
  return createLeave({
    id_demandeur: idOf(seed.poste, seed.centre),
    date_debut: daysFromToday(seed.start),
    date_fin: daysFromToday(seed.start + 5),
    state: seed.ok ? 'validated' : 'rejected',
    generated_at: timestampFromToday(created, 9, 0),
    validation_respo: seed.ok ? 'validated' : 'rejected',
    validated_respo_at: timestampFromToday(created + 5, 9, 0),
    comment_respo: seed.ok ? 'Renfort confirmé.' : 'Aucun remplaçant trouvé.',
    escalated_at: timestampFromToday(created + 1, 10, 0),
    comment_escalade: 'Aucun substitut disponible dans le centre.',
    validation_tech: seed.ok ? 'validated' : 'rejected',
    validated_tech_at: timestampFromToday(created + 3, 15, 0),
    comment_tech: seed.ok
      ? `Substitut disponible au centre de ${seed.from}.`
      : 'Aucun profil équivalent disponible sur la période.',
    id_substitut_propose: seed.ok ? idOf(seed.poste, seed.from) : null,
    validation_confirmation: seed.ok ? 'validated' : 'rejected',
    confirmed_at: timestampFromToday(created + 5, 9, 0),
    comment_confirmation: seed.ok ? 'Confirmé.' : 'Demande rejetée faute de substitut.',
    validation_RH: seed.ok ? 'validated' : null,
    validation_RH_at: seed.ok ? timestampFromToday(created + 7, 11, 0) : null,
    comment_RH: seed.ok ? 'Validé.' : null,
  });
});

const hrQueue = [
  createLeave({
    id_demandeur: managerOf('Tanger'),
    date_debut: daysFromToday(30),
    date_fin: daysFromToday(36),
    motif: 'Congé du responsable de Tanger',
    routing: 'responsable',
    state: 'pending_rh',
    generated_at: timestampFromToday(-3, 11, 0),
    validation_RH: 'pending',
  }),
  createLeave({
    id_demandeur: idOf(POSTES.VITRAGE, 'Rabat'),
    date_debut: daysFromToday(22),
    date_fin: daysFromToday(27),
    motif: 'Repos annuel',
    routing: 'responsable_indisponible',
    state: 'pending_rh',
    generated_at: timestampFromToday(-2, 10, 0),
    validation_RH: 'pending',
  }),
  createLeave({
    id_demandeur: idOf(POSTES.VITRAGE, 'Maarif', 1),
    date_debut: daysFromToday(25),
    date_fin: daysFromToday(33),
    motif: 'Vacances',
    state: 'pending_rh',
    generated_at: timestampFromToday(-6, 8, 30),
    validation_respo: 'validated',
    validated_respo_at: timestampFromToday(-4, 9, 0),
    comment_respo: 'Remplacement assuré localement.',
    id_substitut_local: idOf(POSTES.VITRAGE, 'Maarif', 2),
    validation_RH: 'pending',
  }),
  createLeave({
    id_demandeur: idOf(POSTES.AIDE, 'Arsalane', 1),
    date_debut: daysFromToday(28),
    date_fin: daysFromToday(32),
    motif: 'Repos annuel',
    est_dans_planning_annuel: true,
    state: 'pending_rh',
    generated_at: timestampFromToday(-4, 15, 30),
    validation_respo: 'validated',
    validated_respo_at: timestampFromToday(-2, 9, 45),
    comment_respo: 'Conforme au planning annuel.',
    id_substitut_local: idOf(POSTES.AIDE, 'Arsalane', 2),
    validation_RH: 'pending',
  }),
  createLeave({
    id_demandeur: idOf(POSTES.ADAS, 'Agadir'),
    date_debut: daysFromToday(64),
    date_fin: daysFromToday(70),
    motif: 'Voyage',
    state: 'pending_rh',
    generated_at: timestampFromToday(-10, 9, 0),
    validation_respo: 'validated',
    validated_respo_at: timestampFromToday(-5, 9, 0),
    comment_respo: 'Renfort inter-centres confirmé.',
    escalated_at: timestampFromToday(-9, 9, 0),
    comment_escalade: 'Unique technicien ADAS à Agadir.',
    validation_tech: 'validated',
    validated_tech_at: timestampFromToday(-6, 12, 0),
    comment_tech: 'Substitut trouvé à Maarif.',
    id_substitut_propose: idOf(POSTES.ADAS, 'Maarif'),
    validation_confirmation: 'validated',
    confirmed_at: timestampFromToday(-5, 9, 0),
    comment_confirmation: 'Renfort inter-centres confirmé.',
    validation_RH: 'pending',
  }),
];

const buildHistory = (existing) => {
  const random = createRandom(20260411);
  const pool = employees.filter(
    (employee) => employee.centre_nom !== 'Marrakech' && employee.id_personne > 20 && employee.role !== ROLES.RH
  );
  const records = [];
  const isFree = (id, start, end) =>
    ![...existing, ...records].some(
      (leave) =>
        leave.id_demandeur === id && periodsOverlap(leave.date_debut, leave.date_fin, start, end)
    );
  const push = (employee, startOffset, length, rejected) => {
    const start = daysFromToday(startOffset);
    const end = addDays(start, length);
    if (countWorkingDays(start, end) === 0 || !isFree(employee.id_personne, start, end)) {
      return;
    }
    const created = Math.min(startOffset - random.integer(22, 48), -4);
    const direct = employee.role !== ROLES.COLLABORATEUR;
    const respoDelay = random.integer(0, 2);
    const hrDelay = respoDelay + random.integer(1, 2);
    const typeRoll = random.next();
    const type =
      typeRoll < 0.7 ? 'annuel' : typeRoll < 0.84 ? 'exceptionnel' : typeRoll < 0.94 ? 'recuperation' : 'sans_solde';
    const rejectedByManager = rejected && !direct && random.chance(0.7);
    records.push(
      createLeave({
        id_demandeur: employee.id_personne,
        conge_type: type,
        date_debut: start,
        date_fin: end,
        motif: type === 'exceptionnel' ? 'Événement familial' : 'Repos',
        est_dans_planning_annuel: random.chance(0.55),
        routing: direct ? 'responsable' : 'standard',
        state: rejected ? 'rejected' : 'validated',
        generated_at: timestampFromToday(created, random.integer(8, 17), random.integer(0, 59)),
        validation_respo: direct ? null : rejectedByManager ? 'rejected' : 'validated',
        validated_respo_at: direct ? null : timestampFromToday(created + respoDelay, 18, 5),
        comment_respo: direct ? null : rejectedByManager ? 'Effectif insuffisant sur la période.' : 'Accord du responsable.',
        validation_RH: rejectedByManager ? null : rejected ? 'rejected' : 'validated',
        validation_RH_at: rejectedByManager ? null : timestampFromToday(created + hrDelay, 18, 30),
        comment_RH: rejectedByManager ? null : rejected ? 'Solde insuffisant.' : 'Validé.',
      })
    );
  };
  for (let index = 0; index < 190; index += 1) {
    push(random.pick(pool), random.integer(-178, -8), random.integer(1, 9), random.chance(0.11));
  }
  for (let index = 0; index < 11; index += 1) {
    const startOffset = random.integer(-5, -1);
    push(random.pick(pool), startOffset, random.integer(Math.abs(startOffset) + 1, 11), false);
  }
  for (let index = 0; index < 18; index += 1) {
    push(random.pick(pool), random.integer(3, 58), random.integer(2, 8), false);
  }
  return records;
};

const pendingElsewhere = (existing) => {
  const centresWithPending = ['Agadir', 'Arsalane', 'Maarif', 'Safi', 'Kénitra', 'Meknès', 'Tétouan'];
  return centresWithPending
    .map((centre, index) => ({
      id: idOf(POSTES.VITRAGE, centre),
      start: daysFromToday(70 + index * 2),
      end: daysFromToday(74 + index * 2),
      created: -1 - (index % 4),
    }))
    .filter(
      (seed) =>
        !existing.some(
          (leave) =>
            leave.id_demandeur === seed.id &&
            periodsOverlap(leave.date_debut, leave.date_fin, seed.start, seed.end)
        )
    )
    .map((seed) =>
      createLeave({
        id_demandeur: seed.id,
        date_debut: seed.start,
        date_fin: seed.end,
        motif: 'Repos annuel',
        state: 'pending_respo',
        generated_at: timestampFromToday(seed.created, 10, 10),
        validation_respo: 'pending',
      })
    );
};

const handcrafted = [...featuredLeaves, ...escalatedLeaves, ...technicalHistory, ...hrQueue];
const waiting = pendingElsewhere(handcrafted);

export const leaves = [...handcrafted, ...waiting, ...buildHistory([...handcrafted, ...waiting])];


