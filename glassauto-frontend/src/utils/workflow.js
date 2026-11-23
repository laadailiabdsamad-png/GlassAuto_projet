const decided = (decision) => decision === 'validated' || decision === 'rejected';

const stepStatus = (decision, isCurrent) => {
  if (decision === 'validated') {
    return 'done';
  }
  if (decision === 'rejected') {
    return 'rejected';
  }
  return isCurrent ? 'current' : 'todo';
};

export const leaveSteps = (leave) => {
  const direct = leave.routing !== 'standard';
  const escalated = Boolean(leave.escalated_at);
  const steps = [
    {
      key: 'submit',
      label: 'Demande soumise',
      status: 'done',
      at: leave.generated_at,
      actorId: leave.id_demandeur,
      comment: leave.motif,
    },
  ];
  if (leave.modified_at) {
    steps.push({
      key: 'modified',
      label: 'Demande modifiée',
      status: 'done',
      at: leave.modified_at,
      actorId: leave.id_demandeur,
    });
  }
  if (leave.state === 'cancelled') {
    steps.push({
      key: 'cancelled',
      label: 'Demande annulée',
      status: 'rejected',
      at: leave.cancelled_at,
      actorId: leave.id_demandeur,
    });
    return steps;
  }
  if (!direct && !escalated) {
    steps.push({
      key: 'respo',
      label: 'Responsable de centre',
      status: stepStatus(leave.validation_respo, leave.state === 'pending_respo'),
      at: leave.validated_respo_at,
      actorId: decided(leave.validation_respo) ? leave.id_respo_valideur : null,
      comment: leave.comment_respo,
      substituteId: leave.id_substitut_local,
      hint: 'Recherche d’un substitut dans le centre',
    });
  }
  if (!direct && escalated) {
    steps.push({
      key: 'escalade',
      label: 'Escalade au responsable technique',
      status: 'done',
      at: leave.escalated_at,
      actorId: leave.id_respo_valideur,
      comment: leave.comment_escalade,
    });
    steps.push({
      key: 'tech',
      label: 'Responsable technique',
      status: stepStatus(leave.validation_tech, leave.state === 'pending_tech'),
      at: leave.validated_tech_at,
      actorId: leave.id_tech_valideur,
      comment: leave.comment_tech,
      substituteId: leave.id_substitut_propose,
      hint: 'Recherche d’un substitut sur les 31 centres',
    });
    steps.push({
      key: 'confirmation',
      label: 'Confirmation du responsable de centre',
      status: stepStatus(leave.validation_confirmation, leave.state === 'pending_confirmation'),
      at: leave.confirmed_at,
      actorId: decided(leave.validation_confirmation) ? leave.id_respo_valideur : null,
      comment: leave.comment_confirmation,
      hint: 'Décision suite au retour technique',
    });
  }
  const stopped = steps.some((step) => step.status === 'rejected' && step.key !== 'tech');
  if (!stopped) {
    steps.push({
      key: 'rh',
      label: 'Validation finale du Service RH',
      status: stepStatus(leave.validation_RH, leave.state === 'pending_rh'),
      at: leave.validation_RH_at,
      actorId: leave.id_rh_valideur,
      comment: leave.comment_RH,
      hint: direct ? 'Transmis directement au Service RH' : 'Contrôle du solde et clôture',
    });
  }
  return steps;
};

export const documentSteps = (document) => {
  const steps = [
    {
      key: 'submit',
      label: 'Demande envoyée',
      status: 'done',
      at: document.generated_at,
      actorId: document.id_demandeur,
      comment: document.motif,
    },
  ];
  if (document.state === 'rejected') {
    steps.push({
      key: 'rejected',
      label: 'Demande rejetée par le Service RH',
      status: 'rejected',
      at: document.validation_RH_at,
      actorId: document.id_rh_valideur,
      comment: document.comment_RH,
    });
    return steps;
  }
  steps.push({
    key: 'preparation',
    label: 'Préparation du document',
    status: document.state === 'pending_rh' ? 'current' : 'done',
    at: document.validation_RH_at,
    actorId: document.id_rh_valideur,
    hint: 'Signature et cachet en cours',
  });
  steps.push({
    key: 'ready',
    label: 'Prêt au retrait',
    status: document.is_ready_for_pickup ? 'done' : document.state === 'preparation' ? 'current' : 'todo',
    at: document.notified_at,
    actorId: document.is_ready_for_pickup ? document.id_rh_valideur : null,
    comment: document.is_ready_for_pickup ? document.comment_RH : null,
    hint: 'Vous recevrez une notification',
  });
  steps.push({
    key: 'collected',
    label: 'Remis en main propre',
    status: document.state === 'completed' ? 'done' : document.state === 'ready' ? 'current' : 'todo',
    at: document.collected_at,
    hint: 'À retirer au bureau RH',
  });
  return steps;
};

export const absenceSteps = (absence) => {
  const steps = [];
  if (absence.statut_paie === 'a_justifier') {
    steps.push({
      key: 'detected',
      label: 'Absence constatée',
      status: 'done',
      at: absence.generated_at,
    });
    steps.push({
      key: 'declare',
      label: 'Justification du collaborateur',
      status: 'current',
      hint: 'En attente de déclaration',
    });
  } else {
    steps.push({
      key: 'declare',
      label: 'Justification déclarée',
      status: 'done',
      at: absence.declared_at,
      actorId: absence.id_personne,
      comment: absence.motif_absence,
    });
  }
  steps.push({
    key: 'rh',
    label:
      absence.statut_paie === 'non_justifiee'
        ? 'Justification refusée'
        : absence.statut_paie === 'justifiee'
          ? 'Absence régularisée'
          : 'Vérification du Service RH',
    status:
      absence.statut_paie === 'justifiee'
        ? 'done'
        : absence.statut_paie === 'non_justifiee'
          ? 'rejected'
          : absence.statut_paie === 'en_attente'
            ? 'current'
            : 'todo',
    at: absence.validation_RH_at,
    actorId: absence.id_rh_valideur,
    comment: absence.comment_RH,
    hint: 'Contrôle avant le calcul de la paie',
  });
  return steps;
};
