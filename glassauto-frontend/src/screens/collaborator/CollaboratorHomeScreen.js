import { View } from 'react-native';
import {
  AlertCard,
  BalancePlate,
  DocumentCard,
  HomeHeader,
  LeaveCard,
  QuickAction,
  StepTrack,
} from '../../components/domain';
import { Card, EmptyState, IconTile, Screen, SectionHeader, Txt } from '../../components/ui';
import { DOCUMENT_TYPES, OPEN_LEAVE_STATES, PICKUP_LOCATION } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useHrData } from '../../hooks/useHrData';
import { useMyRecords } from '../../hooks/useMyRecords';
import { diffInDays, formatDate, formatRange, greeting, today } from '../../utils/date';
import { daysLabel, firstName } from '../../utils/format';
import { upcomingPlannedPeriods } from '../../utils/leaveRules';
import { leaveSteps } from '../../utils/workflow';

export function CollaboratorHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { annualPlans } = useHrData();
  const { leaves, documents, absences } = useMyRecords();
  const open = leaves.filter((leave) => OPEN_LEAVE_STATES.includes(leave.state));
  const ready = documents.filter((document) => document.state === 'ready');
  const undeclared = absences.filter((absence) => absence.statut_paie === 'a_justifier');
  const planned = upcomingPlannedPeriods(annualPlans, user.id_personne)[0];
  const nextLeave = leaves
    .filter((leave) => leave.state === 'validated' && leave.date_fin >= today())
    .sort((a, b) => (a.date_debut > b.date_debut ? 1 : -1))[0];

  return (
    <Screen tabbed refreshable>
      <HomeHeader
        title={`${greeting()} ${firstName(user.full_name)}`}
        subtitle={`${user.poste}, ${user.centre_nom}`}
      />
      <BalancePlate />
      {ready.length > 0 || undeclared.length > 0 ? (
        <View className="gap-3">
          {ready.map((document) => (
            <AlertCard
              key={document.id_demande}
              icon="hand-coin-outline"
              tone="success"
              title="Document prêt au retrait"
              message={`${DOCUMENT_TYPES[document.type_doc].label}, ${PICKUP_LOCATION}`}
              onPress={() => navigation.navigate('DocumentDetail', { id: document.id_demande })}
            />
          ))}
          {undeclared.map((absence) => (
            <AlertCard
              key={absence.id_justification}
              icon="alert-circle-outline"
              tone="crimson"
              title="Absence à justifier"
              message={`Le ${formatDate(absence.date_absence_debut, { weekday: true })}, avant le calcul de la paie`}
              onPress={() => navigation.navigate('AbsenceDetail', { id: absence.id_justification })}
            />
          ))}
        </View>
      ) : null}
      <View className="flex-row gap-3">
        <QuickAction
          icon="beach"
          label="Demander un congé"
          tone="crimson"
          onPress={() => navigation.navigate('LeaveForm')}
        />
        <QuickAction
          icon="file-document-outline"
          label="Demander un document"
          onPress={() => navigation.navigate('DocumentForm')}
        />
        <QuickAction
          icon="calendar-remove-outline"
          label="Justifier une absence"
          onPress={() => navigation.navigate('AbsenceForm')}
        />
      </View>
      {nextLeave || planned ? (
        <Card
          onPress={() =>
            nextLeave
              ? navigation.navigate('LeaveDetail', { id: nextLeave.id_demande })
              : navigation.navigate('LeaveForm', { start: planned.date_debut, end: planned.date_fin })
          }
        >
          <View className="flex-row items-center gap-3">
            <IconTile icon="calendar-star" tone="sky" size={44} />
            <View className="flex-1">
              <Txt weight="semi">
                {nextLeave ? 'Prochain congé validé' : 'Période prévue au planning annuel'}
              </Txt>
              <Txt size="sm" tone="soft">
                {formatRange((nextLeave || planned).date_debut, (nextLeave || planned).date_fin)}
              </Txt>
            </View>
            <View className="items-end">
              <Txt size="lg" weight="figure">
                {Math.max(0, diffInDays(today(), (nextLeave || planned).date_debut))}
              </Txt>
              <Txt size="xs" tone="mute">
                {daysLabel(Math.max(0, diffInDays(today(), (nextLeave || planned).date_debut))).split(' ')[1]} restants
              </Txt>
            </View>
          </View>
        </Card>
      ) : null}
      <View className="gap-3">
        <SectionHeader
          title="Demandes en cours"
          count={open.length}
          actionLabel="Voir tout"
          onAction={() => navigation.navigate('MyLeaves')}
        />
        {open.length === 0 ? (
          <EmptyState
            icon="calendar-check-outline"
            title="Aucune demande en cours"
            message="Votre prochaine demande de congé apparaîtra ici."
            actionLabel="Demander un congé"
            onAction={() => navigation.navigate('LeaveForm')}
          />
        ) : (
          open.slice(0, 3).map((leave) => (
            <LeaveCard
              key={leave.id_demande}
              leave={leave}
              onPress={() => navigation.navigate('LeaveDetail', { id: leave.id_demande })}
            >
              <StepTrack steps={leaveSteps(leave)} />
            </LeaveCard>
          ))
        )}
      </View>
      {documents.length > 0 ? (
        <View className="gap-3">
          <SectionHeader
            title="Derniers documents"
            actionLabel="Voir tout"
            onAction={() => navigation.navigate('MyDocuments')}
          />
          {documents.slice(0, 2).map((document) => (
            <DocumentCard
              key={document.id_demande}
              document={document}
              onPress={() => navigation.navigate('DocumentDetail', { id: document.id_demande })}
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
