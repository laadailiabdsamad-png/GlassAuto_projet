import { useMemo } from 'react';
import { byNewest } from '../utils/format';
import { pendingDays, takenDays } from '../utils/leaveRules';
import { useAuth } from './useAuth';
import { useHrData } from './useHrData';

export const useMyRecords = () => {
  const { user } = useAuth();
  const { leaves, documents, absences } = useHrData();

  return useMemo(() => {
    const id = user ? user.id_personne : null;
    const balance = user ? user.solde_conge : 0;
    const taken = takenDays(leaves, id);
    return {
      leaves: leaves.filter((leave) => leave.id_demandeur === id).sort(byNewest),
      documents: documents.filter((document) => document.id_demandeur === id).sort(byNewest),
      absences: absences.filter((absence) => absence.id_personne === id).sort(byNewest),
      balance,
      taken,
      pending: pendingDays(leaves, id),
      acquired: balance + taken,
    };
  }, [user, leaves, documents, absences]);
};