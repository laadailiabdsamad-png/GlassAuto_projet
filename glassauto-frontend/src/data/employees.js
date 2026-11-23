import { centres, departments, HEADQUARTERS } from './centres';
import { POSTES, ROLES } from './constants';

const maleNames = [
  'Amine', 'Reda', 'Walid', 'Younes', 'Adil', 'Jamal', 'Mounir', 'Hassan', 'Driss', 'Nizar',
  'Fouad', 'Ismail', 'Marouane', 'Taha', 'Badr', 'Aziz', 'Samir', 'Issam', 'Noureddine', 'Achraf',
  'Mourad', 'Simo', 'Hatim', 'Anouar', 'Jalil', 'Kamal', 'Larbi', 'Wassim', 'Zouhair', 'Tarek',
];

const femaleNames = [
  'Meryem', 'Kenza', 'Houda', 'Sara', 'Loubna', 'Asmaa', 'Ikram', 'Nawal', 'Rim', 'Dounia',
  'Hajar', 'Siham', 'Widad', 'Ghita', 'Amal', 'Oumaima', 'Safaa', 'Nisrine', 'Btissam', 'Laila',
];

const lastNames = [
  'Alami', 'Benjelloun', 'Bouzidi', 'Cherkaoui', 'Daoudi', 'El Amrani', 'El Khattabi', 'Fahmi',
  'Ghazali', 'Hajji', 'Hilali', 'Jabri', 'Kettani', 'Lamrani', 'Mansouri', 'Mernissi', 'Najib',
  'Ouali', 'Qadiri', 'Rahmouni', 'Saidi', 'Skalli', 'Tahiri', 'Wahbi', 'Yacoubi', 'Zemmouri',
  'Bakkali', 'Belhaj', 'Chaoui', 'Guessous', 'Hamdaoui', 'Khalil', 'Laaroussi', 'Maazouz',
  'Nejjar', 'Rami', 'Sabir', 'Touil', 'Zahidi', 'Znagui', 'Bennouna',
];

const usedNames = new Set();
const usedEmails = new Set();

const composeName = (index, female) => {
  const firstPool = female ? femaleNames : maleNames;
  let shift = 0;
  let name = '';
  do {
    const first = firstPool[(index * 7 + shift) % firstPool.length];
    const last = lastNames[(index * 11 + shift * 3 + Math.floor(index / 9)) % lastNames.length];
    name = `${first} ${last}`;
    shift += 1;
  } while (usedNames.has(name));
  usedNames.add(name);
  return name;
};

const composeEmail = (fullName) => {
  const clean = fullName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  const parts = clean.split(' ');
  const base = `${parts[0][0]}.${parts.slice(1).join('')}`;
  let candidate = base;
  let suffix = 2;
  while (usedEmails.has(candidate)) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }
  usedEmails.add(candidate);
  return `${candidate}@glassauto.demo`;
};

let sequence = 0;

const createEmployee = (attributes) => {
  sequence += 1;
  const id = attributes.id_personne || 100 + sequence;
  const index = sequence;
  return {
    id_personne: id,
    matricule: `GAX-${String(id).padStart(4, '0')}`,
    full_name: attributes.full_name,
    email: composeEmail(attributes.full_name),
    telephone: `06 00 00 ${String(10 + (index % 80)).padStart(2, '0')} ${String((index * 13) % 100).padStart(2, '0')}`,
    role: attributes.role || ROLES.COLLABORATEUR,
    poste: attributes.poste,
    centre_nom: attributes.centre_nom,
    departement: attributes.departement || null,
    solde_conge: attributes.solde_conge ?? 7 + ((index * 5) % 16),
    id_respo_direct: attributes.id_respo_direct ?? null,
    id_binome: attributes.id_binome ?? null,
    disponible: true,
    date_embauche: attributes.date_embauche || `${2012 + ((index * 3) % 13)}-${String(1 + (index % 12)).padStart(2, '0')}-${String(1 + ((index * 7) % 27)).padStart(2, '0')}`,
  };
};

export const DEMO_IDS = {
  collaborateur: 1,
  responsable: 2,
  technique: 3,
  rh: 4,
};

const marrakechTeam = [
  { id_personne: 2, full_name: 'Salma Idrissi', role: ROLES.RESPONSABLE_CENTRE, poste: POSTES.RESPONSABLE, solde_conge: 21, date_embauche: '2016-03-14' },
  { id_personne: 1, full_name: 'Yassine Berrada', poste: POSTES.VITRAGE, solde_conge: 18, id_binome: 15, date_embauche: '2019-09-02' },
  { id_personne: 11, full_name: 'Hamza Lahlou', poste: POSTES.VITRAGE, solde_conge: 14, id_binome: 16, date_embauche: '2018-05-21' },
  { id_personne: 12, full_name: 'Rachid Amrani', poste: POSTES.VITRAGE, solde_conge: 11, id_binome: 17, date_embauche: '2015-11-09' },
  { id_personne: 13, full_name: 'Othman Kabbaj', poste: POSTES.VITRAGE, solde_conge: 16, id_binome: 18, date_embauche: '2021-02-15' },
  { id_personne: 14, full_name: 'Anas El Fassi', poste: POSTES.ADAS, solde_conge: 19, date_embauche: '2020-06-29' },
  { id_personne: 15, full_name: 'Soufiane Naciri', poste: POSTES.AIDE, solde_conge: 9, id_binome: 1, date_embauche: '2022-01-10' },
  { id_personne: 16, full_name: 'Bilal Tazi', poste: POSTES.AIDE, solde_conge: 13, id_binome: 11, date_embauche: '2023-04-03' },
  { id_personne: 17, full_name: 'Ilyas Chraibi', poste: POSTES.AIDE, solde_conge: 15, id_binome: 12, date_embauche: '2021-10-18' },
  { id_personne: 18, full_name: 'Zakaria Mouline', poste: POSTES.AIDE, solde_conge: 10, id_binome: 13, date_embauche: '2024-02-26' },
  { id_personne: 19, full_name: 'Imane Sebti', poste: POSTES.ACCUEIL, solde_conge: 17, date_embauche: '2020-09-07' },
];

marrakechTeam.forEach((member) => usedNames.add(member.full_name));
usedNames.add('Mehdi Ouazzani');
usedNames.add('Nadia Bennis');

const centrePostes = (effectif) => {
  const postes = [];
  if (effectif >= 6) {
    postes.push(POSTES.ADAS);
  }
  if (effectif >= 8) {
    postes.push(POSTES.ACCUEIL);
  }
  let technician = true;
  while (postes.length < effectif - 1) {
    postes.push(technician ? POSTES.VITRAGE : POSTES.AIDE);
    technician = !technician;
  }
  return postes;
};

const buildCentreTeam = (centre, centreIndex) => {
  if (centre.nom === 'Marrakech') {
    return marrakechTeam.map((member) =>
      createEmployee({
        ...member,
        centre_nom: 'Marrakech',
        id_respo_direct: member.id_personne === 2 ? null : 2,
      })
    );
  }
  const managerId = 1000 + centreIndex * 20;
  const manager = createEmployee({
    id_personne: managerId,
    full_name: composeName(centreIndex * 3 + 1, centreIndex % 3 === 1),
    role: ROLES.RESPONSABLE_CENTRE,
    poste: POSTES.RESPONSABLE,
    centre_nom: centre.nom,
  });
  const members = centrePostes(centre.effectif).map((poste, position) =>
    createEmployee({
      id_personne: managerId + position + 1,
      full_name: composeName(centreIndex * 5 + position * 2, poste === POSTES.ACCUEIL),
      poste,
      centre_nom: centre.nom,
      id_respo_direct: managerId,
    })
  );
  const technicians = members.filter((member) => member.poste === POSTES.VITRAGE);
  const helpers = members.filter((member) => member.poste === POSTES.AIDE);
  technicians.forEach((technician, position) => {
    if (helpers[position]) {
      technician.id_binome = helpers[position].id_personne;
      helpers[position].id_binome = technician.id_personne;
    }
  });
  return [manager, ...members];
};

const headquartersPoste = (departmentName, position) => {
  if (position === 0) {
    return `Responsable ${departmentName}`;
  }
  return position % 3 === 0 ? 'Chargé(e) de mission' : 'Assistant(e) de département';
};

const buildDepartment = (department, departmentIndex) => {
  const headId = 3000 + departmentIndex * 20;
  const team = [];
  for (let position = 0; position < department.effectif; position += 1) {
    const isTechnicalHead = department.nom === 'Prise en charge technique' && position === 0;
    const isHr = department.nom === 'Ressources humaines';
    const isHrLead = isHr && position === 0;
    if (isTechnicalHead) {
      team.push(
        createEmployee({
          id_personne: 3,
          full_name: 'Mehdi Ouazzani',
          role: ROLES.RESPONSABLE_TECHNIQUE,
          poste: 'Responsable technique',
          centre_nom: HEADQUARTERS,
          departement: department.nom,
          solde_conge: 16,
          date_embauche: '2014-04-07',
        })
      );
    } else if (isHrLead) {
      team.push(
        createEmployee({
          id_personne: 4,
          full_name: 'Nadia Bennis',
          role: ROLES.RH,
          poste: 'Chargée des ressources humaines',
          centre_nom: HEADQUARTERS,
          departement: department.nom,
          solde_conge: 19,
          date_embauche: '2017-01-16',
        })
      );
    } else {
      const head = position === 0;
      team.push(
        createEmployee({
          id_personne: headId + position,
          full_name: composeName(departmentIndex * 7 + position * 3, (departmentIndex + position) % 2 === 0),
          role: isHr ? ROLES.RH : head ? ROLES.RESPONSABLE_CENTRE : ROLES.COLLABORATEUR,
          poste: isHr ? 'Gestionnaire RH et paie' : headquartersPoste(department.nom, position),
          centre_nom: HEADQUARTERS,
          departement: department.nom,
        })
      );
    }
  }
  const lead = team[0];
  return team.map((member, position) => ({
    ...member,
    id_respo_direct: position === 0 || member.role === ROLES.RH ? null : lead.id_personne,
  }));
};

export const employees = [
  ...centres.flatMap(buildCentreTeam),
  ...departments.flatMap(buildDepartment),
];