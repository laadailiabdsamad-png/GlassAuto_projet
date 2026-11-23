import { useState } from 'react';
import { View } from 'react-native';
import {
  AppHeader,
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
import { ABSENCE_CATEGORIES, ABSENCE_STATES, ROLES } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { canViewAbsence } from '../../utils/access';
import { formatRange } from '../../utils/date';
import { daysLabel } from '../../utils/format';
import { absenceSteps } from '../../utils/workflow';

export function AbsenceDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const { absences, employeesById, actions } = useHrData();
  const { attempt } = useFeedback();
  const [sheet, setSheet] = useState(null);
  const absence = absences.find((item) => item.id_justification === route.params.id);
  const owner = absence ? employeesById[absence.id_personne] : null;

  if (!canViewAbsence(user, absence, owner)) {
    return (
      <Screen header={<AppHeader title="Absence" />}>
        <EmptyState
          icon="lock-outline"
          title="Absence non accessible"
          message="Cette absence n’existe plus ou ne fait pas partie de votre périmètre."
        />
      </Screen>
    );
  }

  const id = absence.id_justification;
  const own = absence.id_personne === user.id_personne;
  const isHr = user.role === ROLES.RH && !own;
  const category = absence.categorie ? ABSENCE_CATEGORIES[absence.categorie] : null;
  const close = () => setSheet(null);

  const review = (accepted) => async (comment) => {
    await attempt(
      () => actions.absences.review(id, { actorId: user.id_personne, accepted, comment }),
      {
        title: accepted ? 'Absence justifiée' : 'Absence non justifiée',
        message: accepted ? 'La paie sera régularisée.' : 'Le collaborateur est informé.',
      }
    );
    close();
  };

  const sheets = {
    accept: {
      title: 'Accepter la justification',
      subtitle: `${daysLabel(absence.jours)} à régulariser en paie.`,
      confirmLabel: 'Accepter',
      confirmIcon: 'check',
      onConfirm: review(true),
    },
    refuse: {
      title: 'Refuser la justification',
      subtitle: 'L’absence sera retenue en paie.',
      confirmLabel: 'Refuser',
      variant: 'primary',
      commentLabel: 'Motif du refus',
      required: true,
      onConfirm: review(false),
    },
  };

  const footer = (() => {
    if (own && absence.statut_paie === 'a_justifier') {
      return (
        <Button
          label="Justifier cette absence"
          onPress={() => navigation.navigate('AbsenceForm', { id })}
        />
      );
    }
    if (isHr && absence.statut_paie === 'en_attente') {
      return (
        <View className="flex-row gap-3">
          <Button label="Refuser" variant="danger" className="flex-1" onPress={() => setSheet('refuse')} />
          <Button label="Accepter" variant="chrome" icon="check" className="flex-1" onPress={() => setSheet('accept')} />
        </View>
      );
    }
    if (isHr && absence.statut_paie === 'a_justifier') {
      return (
        <View className="flex-row gap-3">
          <Button label="Non justifiée" variant="danger" className="flex-1" onPress={() => setSheet('refuse')} />
          <Button
            label="Relancer"
            variant="chrome"
            icon="bell-outline"
            className="flex-1"
            onPress={() =>
              attempt(() => actions.absences.requestJustification(id), {
                title: 'Rappel envoyé',
                message: `${owner.full_name} est notifié.`,
              })
            }
          />
        </View>
      );
    }
    return null;
  })();

  const active = sheet ? sheets[sheet] : null;

  return (
    <Screen header={<AppHeader title="Absence" subtitle={id} />} footer={footer}>
      <View className="gap-3">
        <StatusBadge meta={ABSENCE_STATES[absence.statut_paie]} />
        <Txt size="2xl" weight="figure">
          {daysLabel(absence.jours)}
        </Txt>
        <Txt size="md" tone="soft">
          {formatRange(absence.date_absence_debut, absence.date_absence_fin, { weekday: true })}
        </Txt>
      </View>
      <Card>
        <View className="-my-2">
          {own ? null : (
            <ListRow
              icon="account-outline"
              title="Collaborateur"
              value={owner.full_name}
              onPress={() => navigation.navigate('EmployeeDetail', { id: owner.id_personne })}
            />
          )}
          <ListRow
            icon={category ? category.icon : 'help-circle-outline'}
            title="Catégorie"
            value={category ? category.label : 'Non déclarée'}
          />
          <ListRow
            icon="cash-check"
            title="Traitement en paie"
            value={
              absence.statut_paie === 'justifiee'
                ? 'Régularisée'
                : absence.statut_paie === 'non_justifiee'
                  ? 'Retenue'
                  : 'En attente'
            }
            last
          />
        </View>
      </Card>
      <View className="gap-4">
        <SectionHeader title="Suivi" />
        <Card>
          <Timeline steps={absenceSteps(absence)} />
        </Card>
      </View>
      <DecisionSheet visible={Boolean(active)} onClose={close} title="" confirmLabel="" {...(active || {})} />
    </Screen>
  );
}
