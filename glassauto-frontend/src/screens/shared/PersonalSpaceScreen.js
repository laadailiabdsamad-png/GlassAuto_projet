import { View } from 'react-native';
import { BalancePlate, TabHeader } from '../../components/domain';
import { Banner, Button, Card, ListRow, Screen, SwitchRow } from '../../components/ui';
import { OPEN_LEAVE_STATES, ROLES } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { useMyRecords } from '../../hooks/useMyRecords';
import { plural } from '../../utils/format';

export function PersonalSpaceScreen({ navigation }) {
  const { user } = useAuth();
  const { actions, annualPlans } = useHrData();
  const { attempt } = useFeedback();
  const { leaves, documents, absences } = useMyRecords();
  const isManager = user.role === ROLES.RESPONSABLE_CENTRE;
  const openLeaves = leaves.filter((leave) => OPEN_LEAVE_STATES.includes(leave.state));
  const openDocuments = documents.filter((document) =>
    ['pending_rh', 'preparation', 'ready'].includes(document.state)
  );
  const openAbsences = absences.filter((absence) =>
    ['a_justifier', 'en_attente'].includes(absence.statut_paie)
  );
  const hasPlan = annualPlans.some((plan) => plan.id_respo === user.id_personne);

  const toggleAvailability = (value) =>
    attempt(() => actions.employees.setAvailability(user.id_personne, value), {
      title: value ? 'Vous êtes disponible' : 'Indisponibilité activée',
      message: value
        ? 'Les demandes de votre équipe vous sont de nouveau adressées.'
        : 'Les nouvelles demandes sont acheminées directement au Service RH.',
    });

  return (
    <Screen tabbed refreshable>
      <TabHeader
        title="Mon espace"
        subtitle={user.full_name}
        actionIcon="account-cog-outline"
        actionLabel="Mon profil"
        onAction={() => navigation.navigate('Profile')}
      />
      <BalancePlate />
      <View className="gap-3">
        <Button
          label="Demander un congé"
          icon="beach"
          onPress={() => navigation.navigate('LeaveForm')}
        />
        <Banner
          tone="chrome"
          icon="routes"
          message="Vos propres congés sont transmis directement au Service RH."
        />
      </View>
      <Card>
        <View className="-my-2">
          <ListRow
            icon="calendar-month-outline"
            title="Mes congés"
            subtitle={plural(openLeaves.length, 'demande') + ' en cours'}
            onPress={() => navigation.navigate('PersonalLeaves')}
          />
          <ListRow
            icon="file-document-outline"
            title="Mes documents"
            subtitle={plural(openDocuments.length, 'demande') + ' en cours'}
            onPress={() => navigation.navigate('PersonalDocuments')}
          />
          <ListRow
            icon="calendar-remove-outline"
            title="Mes absences"
            subtitle={plural(openAbsences.length, 'absence') + ' en cours'}
            onPress={() => navigation.navigate('PersonalAbsences')}
            last={!isManager || !hasPlan}
          />
          {isManager && hasPlan ? (
            <ListRow
              icon="calendar-check-outline"
              title="Planning annuel des congés"
              subtitle="Calendrier prévisionnel de l’équipe"
              onPress={() => navigation.navigate('AnnualPlanning')}
              last
            />
          ) : null}
        </View>
      </Card>
      {isManager ? (
        <Card>
          <View className="-my-2">
            <SwitchRow
              icon={user.disponible ? 'account-check-outline' : 'account-off-outline'}
              title="Disponible pour valider"
              subtitle={
                user.disponible
                  ? 'Vous recevez les demandes de votre équipe'
                  : 'Les demandes vont directement au Service RH'
              }
              value={user.disponible}
              onValueChange={toggleAvailability}
              last
            />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
