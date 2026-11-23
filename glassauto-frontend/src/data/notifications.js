import { timestampFromToday } from '../utils/date';
import { leaves } from './leaves';
import { documents } from './documents';
import { absences } from './absences';

const findLeave = (id_demandeur, state) =>
  leaves.find((leave) => leave.id_demandeur === id_demandeur && leave.state === state);

const findDocument = (id_demandeur, state) =>
  documents.find((document) => document.id_demandeur === id_demandeur && document.state === state);

const findAbsence = (id_personne, state) =>
  absences.find((absence) => absence.id_personne === id_personne && absence.statut_paie === state);

const leaveTarget = (leave) => ({ screen: 'LeaveDetail', params: { id: leave.id_demande } });

const documentTarget = (document) => ({ screen: 'DocumentDetail', params: { id: document.id_demande } });

const absenceTarget = (absence) => ({ screen: 'AbsenceDetail', params: { id: absence.id_justification } });

const anasLeave = findLeave(14, 'pending_respo');
const hamzaLeave = findLeave(11, 'pending_respo');
const imaneLeave = findLeave(19, 'pending_confirmation');
const bilalLeave = findLeave(16, 'pending_confirmation');
const ilyasLeave = findLeave(17, 'pending_tech');
const yassineHrLeave = findLeave(1, 'pending_rh');
const yassineNewLeave = findLeave(1, 'pending_respo');
const salmaLeave = findLeave(2, 'pending_rh');
const fesEscalation = leaves.find(
  (leave) => leave.state === 'pending_tech' && leave.comment_escalade.includes('Fès')
);

const seeds = [
  {
    id_personne: 1,
    type: 'document_pret',
    title: 'Document prêt au retrait',
    message: 'Votre attestation de travail est disponible au bureau RH, en main propre.',
    created_at: timestampFromToday(-2, 14, 10),
    target: documentTarget(findDocument(1, 'ready')),
  },
  {
    id_personne: 1,
    type: 'absence',
    title: 'Absence à justifier',
    message: 'Une absence non planifiée a été constatée. Déclarez votre motif avant le calcul de la paie.',
    created_at: timestampFromToday(-5, 9, 35),
    target: absenceTarget(findAbsence(1, 'a_justifier')),
  },
  {
    id_personne: 1,
    type: 'validation',
    title: 'Accord de votre responsable',
    message: 'Votre demande de congé est transmise au Service RH pour validation finale.',
    created_at: timestampFromToday(-3, 10, 30),
    target: leaveTarget(yassineHrLeave),
    read: true,
  },
  {
    id_personne: 2,
    type: 'nouvelle_demande',
    title: 'Nouvelle demande de congé',
    message: 'Anas El Fassi a soumis une demande. Vérifiez la disponibilité d’un substitut.',
    created_at: timestampFromToday(0, 7, 50),
    target: leaveTarget(anasLeave),
  },
  {
    id_personne: 2,
    type: 'retour_technique',
    title: 'Substitut inter-centres trouvé',
    message: 'Le responsable technique propose un remplaçant pour Imane Sebti. Confirmez l’envoi au Service RH.',
    created_at: timestampFromToday(-1, 16, 20),
    target: leaveTarget(imaneLeave),
  },
  {
    id_personne: 2,
    type: 'retour_technique',
    title: 'Aucun substitut trouvé',
    message: 'Pas de solution inter-centres pour Bilal Tazi. La demande est à rejeter.',
    created_at: timestampFromToday(-1, 9, 55),
    target: leaveTarget(bilalLeave),
  },
  {
    id_personne: 2,
    type: 'nouvelle_demande',
    title: 'Nouvelle demande de congé',
    message: 'Yassine Berrada a soumis une demande de congé annuel.',
    created_at: timestampFromToday(-1, 8, 45),
    target: leaveTarget(yassineNewLeave),
  },
  {
    id_personne: 2,
    type: 'nouvelle_demande',
    title: 'Nouvelle demande de congé',
    message: 'Hamza Lahlou a soumis une demande de congé annuel.',
    created_at: timestampFromToday(-2, 17, 5),
    target: leaveTarget(hamzaLeave),
    read: true,
  },
  {
    id_personne: 3,
    type: 'escalade',
    title: 'Demande escaladée par Marrakech',
    message: 'Aucun aide disponible localement pour Ilyas Chraibi.',
    created_at: timestampFromToday(-2, 11, 45),
    target: leaveTarget(ilyasLeave),
  },
  {
    id_personne: 3,
    type: 'escalade',
    title: 'Demande escaladée par Fès',
    message: 'Un technicien calibrage ADAS est recherché sur le réseau.',
    created_at: timestampFromToday(-3, 14, 15),
    target: leaveTarget(fesEscalation),
  },
  {
    id_personne: 4,
    type: 'nouvelle_demande',
    title: 'Congé de responsable à valider',
    message: 'Salma Idrissi, responsable du centre de Marrakech, a soumis une demande.',
    created_at: timestampFromToday(-1, 18, 10),
    target: leaveTarget(salmaLeave),
  },
  {
    id_personne: 4,
    type: 'document',
    title: 'Nouvelle demande de document',
    message: 'Hamza Lahlou demande une attestation CNSS.',
    created_at: timestampFromToday(-1, 10, 25),
    target: documentTarget(findDocument(11, 'pending_rh')),
  },
  {
    id_personne: 4,
    type: 'absence',
    title: 'Justification à vérifier',
    message: 'Rachid Amrani a déclaré une absence pour urgence familiale.',
    created_at: timestampFromToday(-2, 10, 5),
    target: absenceTarget(findAbsence(12, 'en_attente')),
  },
];

export const notifications = seeds.map((seed, index) => ({
  id: `NOT-${index + 1}`,
  read: false,
  ...seed,
}));
