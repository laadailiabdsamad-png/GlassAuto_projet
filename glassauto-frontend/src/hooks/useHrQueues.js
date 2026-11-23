import { useMemo } from 'react';
import { byNewest } from '../utils/format';
import { useHrData } from './useHrData';

export const useHrQueues = () => {
  const { leaves, documents, absences } = useHrData();

  return useMemo(
    () => ({
      pendingLeaves: leaves
        .filter((leave) => leave.state === 'pending_rh')
        .sort((a, b) => (a.date_debut > b.date_debut ? 1 : -1)),
      openDocuments: documents
        .filter((document) => ['pending_rh', 'preparation'].includes(document.state))
        .sort((a, b) => (a.generated_at > b.generated_at ? 1 : -1)),
      readyDocuments: documents.filter((document) => document.state === 'ready').sort(byNewest),
      pendingAbsences: absences
        .filter((absence) => absence.statut_paie === 'en_attente')
        .sort(byNewest),
      undeclaredAbsences: absences
        .filter((absence) => absence.statut_paie === 'a_justifier')
        .sort(byNewest),
    }),
    [leaves, documents, absences]
  );
};
