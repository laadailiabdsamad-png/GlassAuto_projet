import { View } from 'react-native';
import { AbsenceCard, LeaveCard } from '../../components/domain';
import { AppHeader, Avatar, Card, EmptyState, ListRow, Screen, SectionHeader, StatusBadge, Txt } from '../../components/ui';
import { ROLES } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useHrData } from '../../hooks/useHrData';
import { canViewEmployee } from '../../utils/access';
import { formatDate, today } from '../../utils/date';
import { byNewest, daysLabel } from '../../utils/format';
import { isOnLeave } from '../../utils/leaveRules';

const PRESENT = { tone: 'success', icon: 'account-check-outline', label: 'Présent aujourd’hui' };
const ABSENT = { tone: 'crimson', icon: 'beach', label: 'En congé aujourd’hui' };
const UNAVAILABLE = { tone: 'amber', icon: 'account-off-outline', label: 'Indisponible' };

function Metric({ value, label }) {
  return (
    <View className="flex-1 items-center gap-0.5">
      <Txt size="xl" weight="figure" align="center">
        {value}
      </Txt>
      <Txt size="xs" tone="mute" align="center">
        {label}
      </Txt>
    </View>
  );
}

export function EmployeeDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const { employeesById, leaves, absences } = useHrData();
  const employee = employeesById[route.params.id];

  if (!canViewEmployee(user, employee)) {
    return (
      <Screen header={<AppHeader title="Collaborateur" />}>
        <EmptyState
          icon="lock-outline"
          title="Fiche non accessible"
          message="Ce collaborateur ne fait pas partie de votre périmètre."
        />
      </Screen>
    );
  }

  const full = user.role === ROLES.RH || employee.id_respo_direct === user.id_personne || employee.id_personne === user.id_personne;
  const manager = employeesById[employee.id_respo_direct];
  const partner = employeesById[employee.id_binome];
  const ownLeaves = leaves.filter((leave) => leave.id_demandeur === employee.id_personne).sort(byNewest);
  const ownAbsences = absences.filter((absence) => absence.id_personne === employee.id_personne).sort(byNewest);
  const validated = ownLeaves.filter((leave) => leave.state === 'validated').length;
  const absent = isOnLeave(leaves, employee.id_personne, today());
  const presence = absent ? ABSENT : employee.disponible ? PRESENT : UNAVAILABLE;

  return (
    <Screen header={<AppHeader title={employee.full_name} subtitle={employee.matricule} />}>
      <View className="flex-row items-center gap-4">
        <Avatar name={employee.full_name} size={72} />
        <View className="flex-1 gap-1.5">
          <Txt size="md" weight="display">
            {employee.poste}
          </Txt>
          <Txt size="sm" tone="soft">
            {employee.departement ? `${employee.centre_nom}, ${employee.departement}` : `Centre de ${employee.centre_nom}`}
          </Txt>
          <StatusBadge meta={presence} />
        </View>
      </View>
      {full ? (
        <Card>
          <View className="flex-row">
            <Metric value={employee.solde_conge} label="Jours de solde" />
            <View className="w-px bg-white/10" />
            <Metric value={ownLeaves.length} label="Demandes" />
            <View className="w-px bg-white/10" />
            <Metric value={validated} label="Validées" />
          </View>
        </Card>
      ) : null}
      <Card>
        <View className="-my-2">
          {manager ? <ListRow icon="account-tie-outline" title="Responsable" value={manager.full_name} /> : null}
          {partner ? <ListRow icon="account-multiple-outline" title="Binôme" value={partner.full_name} /> : null}
          <ListRow icon="email-outline" title="E-mail" value={employee.email} />
          <ListRow icon="phone-outline" title="Téléphone" value={employee.telephone} />
          <ListRow icon="calendar-account-outline" title="Embauche" value={formatDate(employee.date_embauche)} last />
        </View>
      </Card>
      {full ? (
        <View className="gap-3">
          <SectionHeader title="Demandes de congé" count={ownLeaves.length} />
          {ownLeaves.length === 0 ? (
            <EmptyState icon="calendar-blank-outline" title="Aucune demande de congé" />
          ) : (
            ownLeaves
              .slice(0, 6)
              .map((leave) => (
                <LeaveCard
                  key={leave.id_demande}
                  leave={leave}
                  onPress={() => navigation.push('LeaveDetail', { id: leave.id_demande })}
                />
              ))
          )}
        </View>
      ) : null}
      {full && ownAbsences.length > 0 ? (
        <View className="gap-3">
          <SectionHeader
            title="Absences inopinées"
            actionLabel={daysLabel(ownAbsences.reduce((sum, absence) => sum + absence.jours, 0))}
          />
          {ownAbsences.slice(0, 4).map((absence) => (
            <AbsenceCard
              key={absence.id_justification}
              absence={absence}
              onPress={() => navigation.push('AbsenceDetail', { id: absence.id_justification })}
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
