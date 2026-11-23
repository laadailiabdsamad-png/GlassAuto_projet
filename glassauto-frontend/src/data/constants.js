export const ROLES = {
  COLLABORATEUR: 'COLLABORATEUR',
  RESPONSABLE_CENTRE: 'RESPONSABLE_CENTRE',
  RESPONSABLE_TECHNIQUE: 'RESPONSABLE_TECHNIQUE',
  RH: 'RH',
};

export const ROLE_META = {
  COLLABORATEUR: {
    label: 'Collaborateur',
    description: 'Congés, documents et absences',
    icon: 'account-wrench-outline',
  },
  RESPONSABLE_CENTRE: {
    label: 'Responsable de centre',
    description: 'Validation et planning de son équipe',
    icon: 'garage-variant',
  },
  RESPONSABLE_TECHNIQUE: {
    label: 'Responsable technique',
    description: 'Substitution sur les 31 centres',
    icon: 'swap-horizontal-bold',
  },
  RH: {
    label: 'Service RH',
    description: 'Validation finale et pilotage',
    icon: 'office-building-outline',
  },
};

export const NOTICE_DAYS = 20;

export const POSTES = {
  RESPONSABLE: 'Responsable de centre',
  VITRAGE: 'Technicien vitrage',
  ADAS: 'Technicien calibrage ADAS',
  AIDE: 'Aide technicien',
  ACCUEIL: "Chargé(e) d'accueil",
};

export const POSTE_SHORT = {
  [POSTES.VITRAGE]: 'Vitrage',
  [POSTES.ADAS]: 'ADAS',
  [POSTES.AIDE]: 'Aide',
  [POSTES.ACCUEIL]: 'Accueil',
};

export const LEAVE_TYPES = {
  annuel: {
    label: 'Congé annuel',
    description: 'Décompté de votre solde',
    icon: 'beach',
    deducts: true,
  },
  exceptionnel: {
    label: 'Congé exceptionnel',
    description: 'Mariage, naissance, décès',
    icon: 'account-heart-outline',
    deducts: false,
  },
  recuperation: {
    label: 'Récupération',
    description: 'Heures ou jours à récupérer',
    icon: 'backup-restore',
    deducts: false,
  },
  sans_solde: {
    label: 'Congé sans solde',
    description: 'Sans rémunération',
    icon: 'wallet-outline',
    deducts: false,
  },
};

export const LEAVE_TYPE_ORDER = ['annuel', 'exceptionnel', 'recuperation', 'sans_solde'];

export const LEAVE_STATES = {
  pending_respo: {
    label: 'En attente responsable',
    tone: 'amber',
    icon: 'account-clock-outline',
  },
  pending_tech: {
    label: 'En attente technique',
    tone: 'sky',
    icon: 'account-search-outline',
  },
  pending_confirmation: {
    label: 'Retour technique reçu',
    tone: 'violet',
    icon: 'message-reply-text-outline',
  },
  pending_rh: {
    label: 'En attente RH',
    tone: 'chrome',
    icon: 'office-building-outline',
  },
  validated: {
    label: 'Validé',
    tone: 'success',
    icon: 'check-circle-outline',
  },
  rejected: {
    label: 'Rejeté',
    tone: 'crimson',
    icon: 'close-circle-outline',
  },
  cancelled: {
    label: 'Annulé',
    tone: 'mute',
    icon: 'cancel',
  },
};

export const OPEN_LEAVE_STATES = [
  'pending_respo',
  'pending_tech',
  'pending_confirmation',
  'pending_rh',
];

export const ROUTING_META = {
  standard: {
    label: 'Circuit standard',
    description: 'Responsable de centre puis Service RH',
  },
  responsable: {
    label: 'Congé de responsable',
    description: 'Transmis directement au Service RH',
  },
  responsable_indisponible: {
    label: 'Responsable indisponible',
    description: 'Acheminé directement au Service RH',
  },
};

export const DOCUMENT_TYPES = {
  attestation_travail: { label: 'Attestation de travail', icon: 'briefcase-outline' },
  attestation_salaire: { label: 'Attestation de salaire', icon: 'cash-multiple' },
  attestation_cnss: { label: 'Attestation CNSS', icon: 'shield-half-full' },
  fiche_paie: { label: 'Fiche de paie', icon: 'file-document-outline' },
  releve_conges: { label: 'Relevé des congés', icon: 'calendar-text-outline' },
  autre: { label: 'Autre document RH', icon: 'dots-horizontal-circle-outline' },
};

export const DOCUMENT_TYPE_ORDER = [
  'attestation_travail',
  'attestation_salaire',
  'attestation_cnss',
  'fiche_paie',
  'releve_conges',
  'autre',
];

export const DOCUMENT_STATES = {
  pending_rh: { label: 'En attente RH', tone: 'amber', icon: 'inbox-arrow-down-outline' },
  preparation: { label: 'En préparation', tone: 'sky', icon: 'file-sign' },
  ready: { label: 'Prêt au retrait', tone: 'success', icon: 'hand-coin-outline' },
  completed: { label: 'Remis en main propre', tone: 'chrome', icon: 'check-decagram-outline' },
  rejected: { label: 'Rejeté', tone: 'crimson', icon: 'close-circle-outline' },
};

export const ABSENCE_STATES = {
  a_justifier: { label: 'À justifier', tone: 'crimson', icon: 'alert-circle-outline' },
  en_attente: { label: 'En vérification RH', tone: 'amber', icon: 'clock-outline' },
  justifiee: { label: 'Justifiée', tone: 'success', icon: 'check-circle-outline' },
  non_justifiee: { label: 'Non justifiée', tone: 'mute', icon: 'close-circle-outline' },
};

export const ABSENCE_CATEGORIES = {
  maladie: { label: 'Maladie', icon: 'medical-bag' },
  famille: { label: 'Urgence familiale', icon: 'home-heart' },
  transport: { label: 'Transport', icon: 'bus-alert' },
  administratif: { label: 'Administratif', icon: 'bank-outline' },
  autre: { label: 'Autre motif', icon: 'dots-horizontal' },
};

export const ABSENCE_CATEGORY_ORDER = [
  'maladie',
  'famille',
  'transport',
  'administratif',
  'autre',
];

export const NOTIFICATION_TYPES = {
  nouvelle_demande: { icon: 'send-outline', tone: 'sky' },
  preavis: { icon: 'calendar-alert', tone: 'crimson' },
  validation: { icon: 'check-circle-outline', tone: 'success' },
  rejet: { icon: 'close-circle-outline', tone: 'crimson' },
  escalade: { icon: 'swap-horizontal-bold', tone: 'violet' },
  retour_technique: { icon: 'message-reply-text-outline', tone: 'violet' },
  document_pret: { icon: 'hand-coin-outline', tone: 'success' },
  document: { icon: 'file-document-outline', tone: 'sky' },
  absence: { icon: 'calendar-remove-outline', tone: 'amber' },
  planning: { icon: 'calendar-check-outline', tone: 'chrome' },
};

export const PICKUP_LOCATION = 'Bureau RH, siège, 2e étage';

export const PICKUP_HOURS = 'Du lundi au vendredi, 9 h – 12 h et 14 h – 17 h';
