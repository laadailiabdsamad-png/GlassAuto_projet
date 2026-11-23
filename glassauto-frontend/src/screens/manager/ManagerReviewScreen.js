import { useState } from 'react';
import { View } from 'react-native';
import { CandidateCard } from '../../components/domain';
import {
  AppHeader,
  Banner,
  Button,
  Card,
  DecisionSheet,
  EmptyState,
  Screen,
  SectionHeader,
  Txt,
} from '../../components/ui';
import { LEAVE_TYPES } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { formatRange, periodsOverlap } from '../../utils/date';
import { daysLabel, plural } from '../../utils/format';
import { localCandidates } from '../../utils/substitution';

export function ManagerReviewScreen({ navigation, route }) {
  const { user } = useAuth();
  const { employees, employeesById, leaves, actions } = useHrData();
  const { attempt } = useFeedback();
  const [selectedId, setSelectedId] = useState(null);
  const [sheet, setSheet] = useState(null);
  const leave = leaves.find((item) => item.id_demande === route.params.id);
  const requester = leave ? employeesById[leave.id_demandeur] : null;

  if (!leave || requester.id_respo_direct !== user.id_personne || leave.state !== 'pending_respo') {
    return (
      <Screen header={<AppHeader title="Substitution locale" />}>
        <EmptyState
          icon="check-all"
          title="Demande déjà traitée"
          message="Cette demande n’attend plus votre décision."
          actionLabel="Retour"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const candidates = localCandidates(leave, requester, employees, leaves);
  const available = candidates.filter((candidate) => candidate.status === 'available');
  const others = candidates.filter((candidate) => candidate.status !== 'available');
  const selected = available.find((candidate) => candidate.employee.id_personne === selectedId);
  const concurrent = leaves.filter(
    (item) =>
      item.id_demande !== leave.id_demande &&
      item.state === 'validated' &&
      employeesById[item.id_demandeur].id_respo_direct === user.id_personne &&
      periodsOverlap(item.date_debut, item.date_fin, leave.date_debut, leave.date_fin)
  );
  const id = leave.id_demande;

  const finish = async (operation, success) => {
    const outcome = await attempt(operation, success);
    setSheet(null);
    if (outcome.ok) {
      navigation.goBack();
    }
  };

  const sheets = {
    approve: {
      title: 'Valider avec un substitut local',
      subtitle: selected ? `${selected.employee.full_name} remplace ${requester.full_name}.` : '',
      confirmLabel: 'Valider et transmettre aux RH',
      confirmIcon: 'check',
      commentPlaceholder: 'Consigne pour l’équipe',
      onConfirm: (comment) =>
        finish(
          () => actions.leaves.managerApprove(id, { substituteId: selectedId, comment }),
          { title: 'Demande validée', message: 'Le Service RH est notifié pour validation finale.' }
        ),
    },
    reject: {
      title: 'Rejeter la demande',
      subtitle: 'Le collaborateur reçoit le motif.',
      confirmLabel: 'Rejeter la demande',
      variant: 'primary',
      commentLabel: 'Motif du rejet',
      commentPlaceholder: 'Expliquez votre décision',
      required: true,
      onConfirm: (comment) =>
        finish(() => actions.leaves.managerReject(id, { comment }), { title: 'Demande rejetée' }),
    },
    escalate: {
      title: 'Transférer au responsable technique',
      subtitle: 'Il recherche un remplaçant dans les autres centres.',
      confirmLabel: 'Transférer la demande',
      confirmIcon: 'swap-horizontal',
      variant: 'primary',
      commentLabel: 'Contexte',
      commentPlaceholder: 'Pourquoi aucun remplaçant n’est disponible',
      required: true,
      onConfirm: (comment) =>
        finish(() => actions.leaves.escalate(id, { comment }), {
          title: 'Demande transférée',
          message: 'Le responsable technique est notifié.',
        }),
    },
  };

  const active = sheet ? sheets[sheet] : null;

  return (
    <Screen
      header={<AppHeader title="Substitution locale" subtitle={`Centre de ${requester.centre_nom}`} />}
      footer={
        available.length > 0 ? (
          <View className="flex-row gap-3">
            <Button label="Rejeter" variant="danger" className="flex-1" onPress={() => setSheet('reject')} />
            <Button
              label="Valider"
              icon="check"
              variant="chrome"
              className="flex-1"
              disabled={!selected}
              onPress={() => setSheet('approve')}
            />
          </View>
        ) : (
          <>
            <Button
              label="Transférer au responsable technique"
              icon="swap-horizontal"
              onPress={() => setSheet('escalate')}
            />
            <Button label="Rejeter la demande" variant="danger" onPress={() => setSheet('reject')} />
          </>
        )
      }
    >
      <Card>
        <Txt weight="semi">{requester.full_name}</Txt>
        <Txt size="sm" tone="mute">
          {requester.poste}
        </Txt>
        <View className="mt-3 flex-row items-end justify-between border-t border-white/10 pt-3">
          <View className="flex-1">
            <Txt size="sm" tone="soft">
              {LEAVE_TYPES[leave.conge_type].label}
            </Txt>
            <Txt weight="semi">{formatRange(leave.date_debut, leave.date_fin)}</Txt>
          </View>
          <Txt size="lg" weight="figure">
            {daysLabel(leave.jour_demande)}
          </Txt>
        </View>
        {leave.motif ? (
          <Txt size="sm" tone="soft" className="mt-2">
            {leave.motif}
          </Txt>
        ) : null}
      </Card>
      {available.length > 0 ? (
        <Banner
          tone="success"
          icon="account-check-outline"
          title={plural(available.length, 'substitut disponible', 'substituts disponibles')}
          message="Choisissez le remplaçant, puis validez la demande."
        />
      ) : (
        <Banner
          tone="amber"
          icon="account-alert-outline"
          title="Aucun substitut disponible dans le centre"
          message="Transférez la demande au responsable technique pour une recherche inter-centres."
        />
      )}
      {concurrent.length > 0 ? (
        <Banner
          tone="sky"
          icon="calendar-alert"
          title={plural(concurrent.length, 'congé validé', 'congés validés') + ' sur la même période'}
          message={concurrent
            .map((item) => employeesById[item.id_demandeur].full_name)
            .join(', ')}
        />
      ) : null}
      {available.length > 0 ? (
        <View className="gap-3">
          <SectionHeader title="Disponibles" count={available.length} />
          {available.map((candidate) => (
            <CandidateCard
              key={candidate.employee.id_personne}
              candidate={candidate}
              selected={candidate.employee.id_personne === selectedId}
              onPress={() => setSelectedId(candidate.employee.id_personne)}
            />
          ))}
        </View>
      ) : null}
      <View className="gap-3">
        <SectionHeader title="Non disponibles" count={others.length} />
        {others.map((candidate) => (
          <CandidateCard key={candidate.employee.id_personne} candidate={candidate} selected={false} />
        ))}
      </View>
      <DecisionSheet
        visible={Boolean(active)}
        onClose={() => setSheet(null)}
        title=""
        confirmLabel=""
        {...(active || {})}
      />
    </Screen>
  );
}
