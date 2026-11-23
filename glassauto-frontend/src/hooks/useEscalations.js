import { useMemo } from 'react';
import { useHrData } from './useHrData';

export const useEscalations = () => {
  const { leaves } = useHrData();

  return useMemo(() => {
    const all = leaves
      .filter((leave) => Boolean(leave.escalated_at))
      .sort((a, b) => (a.escalated_at < b.escalated_at ? 1 : -1));
    const pending = all
      .filter((leave) => leave.state === 'pending_tech')
      .sort((a, b) => (a.date_debut > b.date_debut ? 1 : -1));
    const decided = all.filter((leave) => ['validated', 'rejected'].includes(leave.validation_tech));
    const favorable = decided.filter((leave) => leave.validation_tech === 'validated');
    return { all, pending, decided, favorable };
  }, [leaves]);
};
