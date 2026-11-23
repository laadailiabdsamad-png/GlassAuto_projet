import { timestampFromToday } from '../utils/date';
import { createRandom } from './random';
import { employees } from './employees';
import { DOCUMENT_TYPE_ORDER, ROLES } from './constants';

const HR_ID = 4;

const motifs = [
  'Dossier bancaire',
  'Demande de visa',
  'Dossier de location',
  'Inscription scolaire',
  'Mutuelle',
  'Usage personnel',
];

let sequence = 500;

const createDocument = (seed) => {
  sequence += 1;
  const employee = employees.find((item) => item.id_personne === seed.id_demandeur);
  const created = seed.created;
  const reached = (states) => states.includes(seed.state);
  return {
    id_demande: `DOC-${sequence}`,
    state: seed.state,
    generated_at: timestampFromToday(created, seed.hour || 10, 25),
    type_doc: seed.type_doc,
    precision: seed.precision || null,
    motif: seed.motif,
    exemplaires: seed.exemplaires || 1,
    validation_RH: seed.state === 'pending_rh' ? 'pending' : seed.state === 'rejected' ? 'rejected' : 'validated',
    validation_RH_at: seed.state === 'pending_rh' ? null : timestampFromToday(Math.min(created + 1, 0), 9, 40),
    comment_RH: seed.comment_RH || null,
    is_ready_for_pickup: reached(['ready', 'completed']),
    notified_at: reached(['ready', 'completed']) ? timestampFromToday(Math.min(created + 2, 0), 14, 10) : null,
    collected_at: seed.state === 'completed' ? timestampFromToday(Math.min(created + 4, 0), 11, 30) : null,
    id_demandeur: seed.id_demandeur,
    id_respo_valideur: employee.id_respo_direct,
    id_rh_valideur: seed.state === 'pending_rh' ? null : HR_ID,
  };
};

const featured = [
  createDocument({ id_demandeur: 1, type_doc: 'attestation_travail', motif: 'Dossier de location', state: 'ready', created: -4, comment_RH: 'Document signé et cacheté.' }),
  createDocument({ id_demandeur: 1, type_doc: 'fiche_paie', motif: 'Dossier bancaire', precision: 'Trois derniers mois', state: 'preparation', created: -2, exemplaires: 2 }),
  createDocument({ id_demandeur: 1, type_doc: 'releve_conges', motif: 'Usage personnel', state: 'completed', created: -41 }),
  createDocument({ id_demandeur: 1, type_doc: 'attestation_salaire', motif: 'Demande de visa', state: 'completed', created: -92 }),
  createDocument({ id_demandeur: 1, type_doc: 'autre', precision: 'Copie du contrat', motif: 'Motif non précisé', state: 'rejected', created: -60, comment_RH: 'Merci de préciser le motif de la demande.' }),
  createDocument({ id_demandeur: 11, type_doc: 'attestation_cnss', motif: 'Mutuelle', state: 'pending_rh', created: -1 }),
  createDocument({ id_demandeur: 19, type_doc: 'attestation_travail', motif: 'Demande de visa', state: 'pending_rh', created: -2 }),
  createDocument({ id_demandeur: 2, type_doc: 'attestation_salaire', motif: 'Dossier bancaire', state: 'completed', created: -30 }),
  createDocument({ id_demandeur: 2, type_doc: 'attestation_travail', motif: 'Inscription scolaire', state: 'preparation', created: -1 }),
  createDocument({ id_demandeur: 3, type_doc: 'fiche_paie', motif: 'Dossier bancaire', state: 'completed', created: -22 }),
];

const generated = () => {
  const random = createRandom(7781);
  const pool = employees.filter((employee) => employee.id_personne > 20 && employee.role !== ROLES.RH);
  const records = [];
  const add = (state, created) =>
    records.push(
      createDocument({
        id_demandeur: random.pick(pool).id_personne,
        type_doc: random.next() < 0.36 ? 'attestation_travail' : random.pick(DOCUMENT_TYPE_ORDER.slice(0, 5)),
        motif: random.pick(motifs),
        state,
        created,
        hour: random.integer(8, 17),
      })
    );
  for (let index = 0; index < 64; index += 1) {
    add(random.chance(0.07) ? 'rejected' : 'completed', random.integer(-172, -8));
  }
  for (let index = 0; index < 5; index += 1) {
    add('pending_rh', random.integer(-3, -1));
  }
  for (let index = 0; index < 4; index += 1) {
    add('preparation', random.integer(-4, -2));
  }
  for (let index = 0; index < 4; index += 1) {
    add('ready', random.integer(-6, -3));
  }
  return records;
};

export const documents = [...featured, ...generated()];
