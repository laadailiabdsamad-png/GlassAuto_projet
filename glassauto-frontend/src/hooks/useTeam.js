import { useMemo } from 'react';
import { byNewest } from '../utils/format';
import { useAuth } from './useAuth';
import { useHrData } from './useHrData';

export const useTeam = () => {
  const { user } = useAuth();
  const { employees, leaves, absences, annualPlans } = useHrData();

  return useMemo(() => {
    const members = employees.filter((employee) => employee.id_respo_direct === user.id_personne);
    const ids = new Set(members.map((member) => member.id_personne));
    const teamLeaves = leaves.filter((leave) => ids.has(leave.id_demandeur)).sort(byNewest);
    return {
      members,
      ids,
      leaves: teamLeaves,
      toReview: teamLeaves.filter(
        (leave) => leave.state === 'pending_respo' && leave.routing === 'standard'
      ),
      toConfirm: teamLeaves.filter((leave) => leave.state === 'pending_confirmation'),
      escalated: teamLeaves.filter((leave) => Boolean(leave.escalated_at)),
      absences: absences.filter((absence) => ids.has(absence.id_personne)).sort(byNewest),
      plans: annualPlans.filter((plan) => plan.id_respo === user.id_personne),
    };
  }, [user, employees, leaves, absences, annualPlans]);
};