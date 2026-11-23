import { useState } from 'react';
import { View } from 'react-native';
import { RequestFacts } from '../../components/domain';
import {
  AppHeader,
  Avatar,
  Banner,
  Button,
  Card,
  DecisionSheet,
  EmptyState,
  Icon,
  Screen,
  SectionHeader,
  StatusBadge,
  Timeline,
  Txt,
} from '../../components/ui';
import { LEAVE_STATES, LEAVE_TYPES, ROLES, ROUTING_META } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { colors } from '../../theme';
import { canCancelLeave, canEditLeave, canViewLeave } from '../../utils/access';
import { formatRange } from '../../utils/date';
import { daysLabel, firstName, lowerFirst } from '../../utils/format';
import { leaveSteps } from '../../utils/workflow';

function BalanceImpact({ employee, leave }) {
  const deducts = LEAVE_TYPES[leave.conge_type].deducts;
  const after = deducts ? employee.solde_conge - leave.jour_demande : employee.solde_conge;
  return (
    <Card>
      <Txt size="sm" tone="soft">
        Impact sur le solde de {firstName(employee.full_name)}
      </Txt>
      <View className="mt-2 flex-row items-center justify-between">
        <View>
          <Txt size="xl" weight="figure">
            {employee.solde_conge}
          </Txt>
          <Txt size="xs" tone="mute">
            Solde actuel
          </Txt>
        </View>
        <View className="items-center">
          <Icon name="arrow-right" size={22} color={colors.mute} />
          <Txt size="sm" weight="semi" tone={deducts ? 'ember' : 'soft'}>
            {deducts ? `− ${daysLabel(leave.jour_demande)}` : 'Non déduit'}
          </Txt>
        </View>
        <View className="items-end">
          <Txt size="xl" weight="figure" tone={after < 0 ? 'ember' : 'success'}>
            {after}
          </Txt>
          <Txt size="xs" tone="mute">
            Après validation
          </Txt>
        </View>
      </View>
    </Card>
  );
}

function TechnicalAnswer({ leave, employeesById }) {
  const favorable = leave.validation_tech === 'validated';
  const substitute = employeesById[leave.id_substitut_propose];
  return (
    <Banner
      tone={favorable ? 'success' : 'crimson'}
      icon={favorable ? 'account-check-outline' : 'account-cancel-outline'}
      title={favorable ? 'Substitut inter-centres trouvé' : 'Aucun substitut trouvé'}
      message={
        favorable && substitute
          ? `${substitute.full_name}, ${lowerFirst(substitute.poste)} à ${substitute.centre_nom}. ${leave.comment_tech || ''}`
          : leave.comment_tech
      }
    />
  );
}

export function LeaveDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const { leaves, employeesById, actions } = useHrData();
  const { attempt, confirm } = useFeedback();
  const [sheet, setSheet] = useState(null);
  const leave = leaves.find((item) => item.id_demande === route.params.id);
  const requester = leave ? employeesById[leave.id_demandeur] : null;

  if (!canViewLeave(user, leave, requester)) {
    return (
      <Screen header={<AppHeader title="Demande de congé" />}>
        <EmptyState
          icon="lock-outline"
          title="Demande non accessible"
          message="Cette demande n’existe plus ou ne fait pas partie de votre périmètre."
        />
      </Screen>
    );
  }

  const own = leave.id_demandeur === user.id_personne;
  const isManager = requester.id_respo_direct === user.id_personne;
  const isTechnical = user.role === ROLES.RESPONSABLE_TECHNIQUE;
  const isHr = user.role === ROLES.RH;
  const id = leave.id_demande;
  const close = () => setSheet(null);

  const run = async (operation, success) => {
    const outcome = await attempt(operation, success);
    close();
    return outcome;
  };

  const cancelRequest = async () => {
    const accepted = await confirm({
      icon: 'calendar-remove',
      title: 'Annuler cette demande ?',
      message: `${formatRange(leave.date_debut, leave.date_fin)}. Vous pourrez en soumettre une nouvelle.`,
      confirmLabel: 'Annuler la demande',
      cancelLabel: 'Conserver',
      danger: true,
    });
    if (accepted) {
      await attempt(() => actions.leaves.cancel(id), { title: 'Demande annulée' });
    }
  };

  const sheets = {
    confirm: {
      title: 'Confirmer et envoyer au Service RH',
      subtitle: 'Le remplacement inter-centres est retenu.',
      confirmLabel: 'Confirmer la demande',
      confirmIcon: 'check',
      onConfirm: (comment) =>
        run(() => actions.leaves.managerConfirm(id, { comment }), {
          title: 'Demande confirmée',
          message: 'Le Service RH est notifié pour validation finale.',
        }),
    },
    decline: {
      title: 'Rejeter la demande',
      subtitle: 'Le collaborateur reçoit le motif.',
      confirmLabel: 'Rejeter la demande',
      variant: 'primary',
      commentLabel: 'Motif du rejet',
      commentPlaceholder: 'Aucun substitut disponible sur la période',
      required: true,
      onConfirm: (comment) =>
        run(() => actions.leaves.managerDecline(id, { comment }), { title: 'Demande rejetée' }),
    },
    unfavorable: {
      title: 'Aucun substitut trouvé',
      subtitle: 'Le responsable de centre est notifié et procède au rejet.',
      confirmLabel: 'Notifier le responsable',
      variant: 'primary',
      commentLabel: 'Explication',
      commentPlaceholder: 'Centres consultés et raison',
      required: true,
      onConfirm: (comment) =>
        run(
          () => actions.leaves.technicalUnfavorable(id, { actorId: user.id_personne, comment }),
          { title: 'Retour transmis', message: 'Le responsable de centre est notifié.' }
        ),
    },
    hrApprove: {
      title: 'Validation finale',
      subtitle: LEAVE_TYPES[leave.conge_type].deducts
        ? `${daysLabel(leave.jour_demande)} seront déduits du solde.`
        : 'Ce type de congé n’est pas déduit du solde.',
      confirmLabel: 'Valider définitivement',
      confirmIcon: 'check',
      onConfirm: (comment) =>
        run(() => actions.leaves.hrApprove(id, { actorId: user.id_personne, comment }), {
          title: 'Congé validé',
          message: 'Le solde est à jour et le collaborateur est notifié.',
        }),
    },
    hrReject: {
      title: 'Refuser la demande',
      subtitle: 'Le collaborateur et son responsable reçoivent le motif.',
      confirmLabel: 'Refuser la demande',
      variant: 'primary',
      commentLabel: 'Motif du refus',
      required: true,
      onConfirm: (comment) =>
        run(() => actions.leaves.hrReject(id, { actorId: user.id_personne, comment }), {
          title: 'Demande refusée',
        }),
    },
  };

  const footer = (() => {
    if (isHr && leave.state === 'pending_rh') {
      return (
        <View className="flex-row gap-3">
          <Button label="Refuser" variant="danger" className="flex-1" onPress={() => setSheet('hrReject')} />
          <Button label="Valider" variant="chrome" icon="check" className="flex-1" onPress={() => setSheet('hrApprove')} />
        </View>
      );
    }
    if (isManager && leave.state === 'pending_respo') {
      return (
        <Button
          label="Vérifier les substituts du centre"
          icon="account-switch-outline"
          onPress={() => navigation.navigate('ManagerReview', { id })}
        />
      );
    }
    if (isManager && leave.state === 'pending_confirmation') {
      return leave.validation_tech === 'validated' ? (
        <View className="flex-row gap-3">
          <Button label="Rejeter" variant="danger" className="flex-1" onPress={() => setSheet('decline')} />
          <Button label="Confirmer" variant="chrome" icon="check" className="flex-1" onPress={() => setSheet('confirm')} />
        </View>
      ) : (
        <Button label="Rejeter la demande" onPress={() => setSheet('decline')} />
      );
    }
    if (isTechnical && leave.state === 'pending_tech') {
      return (
        <>
          <Button
            label="Rechercher un substitut"
            icon="account-search-outline"
            onPress={() => navigation.navigate('SubstituteSearch', { id })}
          />
          <Button label="Aucun substitut trouvé" variant="outline" onPress={() => setSheet('unfavorable')} />
        </>
      );
    }
    if (own && canCancelLeave(user, leave)) {
      return (
        <View className="flex-row gap-3">
          <Button label="Annuler" variant="danger" className="flex-1" onPress={cancelRequest} />
          {canEditLeave(user, leave) ? (
            <Button
              label="Modifier"
              variant="chrome"
              icon="pencil-outline"
              className="flex-1"
              onPress={() => navigation.navigate('LeaveForm', { id })}
            />
          ) : null}
        </View>
      );
    }
    return null;
  })();

  const active = sheet ? sheets[sheet] : null;

  return (
    <Screen
      header={<AppHeader title={LEAVE_TYPES[leave.conge_type].label} subtitle={leave.id_demande} />}
      footer={footer}
    >
      <View className="gap-3">
        <StatusBadge meta={LEAVE_STATES[leave.state]} />
        <Txt size="2xl" weight="figure">
          {daysLabel(leave.jour_demande)}
        </Txt>
        <Txt size="md" tone="soft">
          {formatRange(leave.date_debut, leave.date_fin)}
        </Txt>
      </View>
      {own ? null : (
        <Card
          onPress={() => navigation.navigate('EmployeeDetail', { id: requester.id_personne })}
          accessibilityLabel={requester.full_name}
        >
          <View className="flex-row items-center gap-3">
            <Avatar name={requester.full_name} size={46} />
            <View className="flex-1">
              <Txt weight="semi">{requester.full_name}</Txt>
              <Txt size="sm" tone="mute">
                {requester.poste}, {requester.centre_nom}
              </Txt>
            </View>
            <Icon name="chevron-right" size={22} color={colors.mute} />
          </View>
        </Card>
      )}
      {leave.routing !== 'standard' && isHr ? (
        <Banner
          tone="violet"
          icon="routes"
          title={`Cas particulier : ${ROUTING_META[leave.routing].label.toLowerCase()}`}
          message={ROUTING_META[leave.routing].description}
        />
      ) : null}
      {leave.escalated_at && leave.validation_tech !== 'pending' && leave.state === 'pending_confirmation' ? (
        <TechnicalAnswer leave={leave} employeesById={employeesById} />
      ) : null}
      {isHr && leave.state === 'pending_rh' ? <BalanceImpact employee={requester} leave={leave} /> : null}
      <RequestFacts leave={leave} />
      <View className="gap-4">
        <SectionHeader title="Suivi de la demande" />
        <Card>
          <Timeline steps={leaveSteps(leave)} />
        </Card>
      </View>
      <DecisionSheet visible={Boolean(active)} onClose={close} title="" confirmLabel="" {...(active || {})} />
    </Screen>
  );
}
