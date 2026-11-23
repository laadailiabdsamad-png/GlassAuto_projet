import { useState } from 'react';
import { View } from 'react-native';
import {
  AppHeader,
  Banner,
  Button,
  Card,
  DecisionSheet,
  EmptyState,
  ListRow,
  Screen,
  SectionHeader,
  StatusBadge,
  Timeline,
  Txt,
} from '../../components/ui';
import {
  DOCUMENT_STATES,
  DOCUMENT_TYPES,
  PICKUP_HOURS,
  PICKUP_LOCATION,
  ROLES,
} from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { canViewDocument } from '../../utils/access';
import { formatDateTime } from '../../utils/date';
import { documentSteps } from '../../utils/workflow';

export function DocumentDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const { documents, employeesById, actions } = useHrData();
  const { attempt, confirm } = useFeedback();
  const [sheet, setSheet] = useState(null);
  const document = documents.find((item) => item.id_demande === route.params.id);

  if (!canViewDocument(user, document)) {
    return (
      <Screen header={<AppHeader title="Document administratif" />}>
        <EmptyState
          icon="lock-outline"
          title="Demande non accessible"
          message="Cette demande n’existe plus ou ne fait pas partie de votre périmètre."
        />
      </Screen>
    );
  }

  const id = document.id_demande;
  const isHr = user.role === ROLES.RH && document.id_demandeur !== user.id_personne;
  const owner = employeesById[document.id_demandeur];
  const type = DOCUMENT_TYPES[document.type_doc];
  const close = () => setSheet(null);

  const markCollected = async () => {
    const accepted = await confirm({
      icon: 'hand-coin-outline',
      tone: 'success',
      title: 'Document remis ?',
      message: `Confirmez la remise en main propre à ${owner.full_name}.`,
      confirmLabel: 'Confirmer la remise',
    });
    if (accepted) {
      await attempt(() => actions.documents.confirmPickup(id), {
        title: 'Remise enregistrée',
        message: 'La demande est clôturée.',
      });
    }
  };

  const sheets = {
    ready: {
      title: 'Document prêt au retrait',
      subtitle: `${owner.full_name} reçoit une notification de mise à disposition.`,
      confirmLabel: 'Notifier le collaborateur',
      confirmIcon: 'bell-ring-outline',
      commentPlaceholder: 'Exemple : signé et cacheté',
      onConfirm: async (comment) => {
        await attempt(() => actions.documents.markReady(id, { actorId: user.id_personne, comment }), {
          title: 'Notification envoyée',
          message: `${owner.full_name} peut retirer son document.`,
        });
        close();
      },
    },
    reject: {
      title: 'Refuser la demande',
      subtitle: 'Le collaborateur reçoit le motif.',
      confirmLabel: 'Refuser la demande',
      variant: 'primary',
      commentLabel: 'Motif du refus',
      required: true,
      onConfirm: async (comment) => {
        await attempt(() => actions.documents.reject(id, { actorId: user.id_personne, comment }), {
          title: 'Demande refusée',
        });
        close();
      },
    },
  };

  const footer = (() => {
    if (!isHr) {
      return null;
    }
    if (document.state === 'pending_rh') {
      return (
        <View className="flex-row gap-3">
          <Button label="Refuser" variant="danger" className="flex-1" onPress={() => setSheet('reject')} />
          <Button
            label="Préparer"
            variant="chrome"
            icon="file-sign"
            className="flex-1"
            onPress={() =>
              attempt(() => actions.documents.startPreparation(id, { actorId: user.id_personne }), {
                title: 'Préparation lancée',
                message: 'Le collaborateur est informé.',
              })
            }
          />
        </View>
      );
    }
    if (document.state === 'preparation') {
      return (
        <>
          <Button
            label="Marquer prêt au retrait"
            icon="bell-ring-outline"
            variant="chrome"
            onPress={() => setSheet('ready')}
          />
          <Button label="Refuser la demande" variant="danger" onPress={() => setSheet('reject')} />
        </>
      );
    }
    if (document.state === 'ready') {
      return (
        <View className="flex-row gap-3">
          <Button
            label="Relancer"
            variant="outline"
            icon="bell-outline"
            className="flex-1"
            onPress={() =>
              attempt(() => actions.documents.remindPickup(id), {
                title: 'Rappel envoyé',
                message: `${owner.full_name} est notifié.`,
              })
            }
          />
          <Button label="Document remis" variant="chrome" icon="check" className="flex-1" onPress={markCollected} />
        </View>
      );
    }
    return null;
  })();

  const active = sheet ? sheets[sheet] : null;

  return (
    <Screen header={<AppHeader title={type.label} subtitle={id} />} footer={footer}>
      <View className="gap-3">
        <StatusBadge meta={DOCUMENT_STATES[document.state]} />
        <Txt tone="soft">Demandé le {formatDateTime(document.generated_at)}</Txt>
      </View>
      {document.state === 'ready' && !isHr ? (
        <Banner
          tone="success"
          icon="hand-coin-outline"
          title="Votre document vous attend"
          message={`${PICKUP_LOCATION}. ${PICKUP_HOURS}. Munissez-vous de votre pièce d’identité.`}
        />
      ) : null}
      <Card>
        <View className="-my-2">
          {isHr ? (
            <ListRow
              icon="account-outline"
              title="Collaborateur"
              value={owner.full_name}
              onPress={() => navigation.navigate('EmployeeDetail', { id: owner.id_personne })}
            />
          ) : null}
          <ListRow icon={type.icon} title="Document" value={type.label} />
          {document.precision ? (
            <ListRow icon="text-box-outline" title="Précision" value={document.precision} />
          ) : null}
          <ListRow icon="comment-text-outline" title="Motif" value={document.motif} />
          <ListRow icon="content-copy" title="Exemplaires" value={String(document.exemplaires)} last />
        </View>
      </Card>
      <View className="gap-4">
        <SectionHeader title="Suivi de la demande" />
        <Card>
          <Timeline steps={documentSteps(document)} />
        </Card>
      </View>
      <DecisionSheet visible={Boolean(active)} onClose={close} title="" confirmLabel="" {...(active || {})} />
    </Screen>
  );
}
