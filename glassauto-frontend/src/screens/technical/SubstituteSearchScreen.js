import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { CandidateCard, PagedList } from '../../components/domain';
import {
  AppHeader,
  Banner,
  Button,
  Card,
  Chip,
  DecisionSheet,
  EmptyState,
  Screen,
  SearchBar,
  SectionHeader,
  Txt,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { formatRange } from '../../utils/date';
import { daysLabel, lowerFirst, matches, plural } from '../../utils/format';
import { networkCandidates } from '../../utils/substitution';

export function SubstituteSearchScreen({ navigation, route }) {
  const { user } = useAuth();
  const { employees, employeesById, leaves, actions } = useHrData();
  const { attempt } = useFeedback();
  const [scope, setScope] = useState('available');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [sheet, setSheet] = useState(null);
  const leave = leaves.find((item) => item.id_demande === route.params.id);

  if (!leave || leave.state !== 'pending_tech') {
    return (
      <Screen header={<AppHeader title="Recherche de substitut" />}>
        <EmptyState
          icon="check-all"
          title="Demande déjà arbitrée"
          message="Cette demande n’attend plus votre retour."
          actionLabel="Retour"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const requester = employeesById[leave.id_demandeur];
  const candidates = networkCandidates(leave, requester, employees, leaves);
  const available = candidates.filter((candidate) => candidate.status === 'available');
  const sameRegion = available.filter((candidate) => candidate.sameRegion);
  const pools = { available, region: sameRegion, all: candidates };
  const visible = pools[scope].filter(
    (candidate) =>
      !query ||
      matches(
        `${candidate.employee.full_name} ${candidate.employee.centre_nom} ${candidate.region}`,
        query
      )
  );
  const selected = available.find((candidate) => candidate.employee.id_personne === selectedId);
  const centresCount = new Set(available.map((candidate) => candidate.employee.centre_nom)).size;

  const finish = async (operation, success) => {
    const outcome = await attempt(operation, success);
    setSheet(null);
    if (outcome.ok) {
      navigation.goBack();
    }
  };

  const sheets = {
    favorable: {
      title: 'Proposer ce substitut',
      subtitle: selected
        ? `${selected.employee.full_name}, ${selected.employee.centre_nom}. Le responsable de ${requester.centre_nom} confirme ensuite.`
        : '',
      confirmLabel: 'Notifier le responsable de centre',
      confirmIcon: 'check',
      commentPlaceholder: 'Organisation du déplacement',
      onConfirm: (comment) =>
        finish(
          () =>
            actions.leaves.technicalFavorable(leave.id_demande, {
              actorId: user.id_personne,
              substituteId: selectedId,
              comment,
            }),
          { title: 'Substitut proposé', message: `Le responsable de ${requester.centre_nom} est notifié.` }
        ),
    },
    unfavorable: {
      title: 'Aucun substitut trouvé',
      subtitle: 'Le responsable de centre est notifié et procède au rejet.',
      confirmLabel: 'Notifier le responsable de centre',
      variant: 'primary',
      commentLabel: 'Explication',
      commentPlaceholder: 'Centres consultés et raison',
      required: true,
      onConfirm: (comment) =>
        finish(
          () =>
            actions.leaves.technicalUnfavorable(leave.id_demande, {
              actorId: user.id_personne,
              comment,
            }),
          { title: 'Retour transmis', message: `Le responsable de ${requester.centre_nom} est notifié.` }
        ),
    },
  };

  const active = sheet ? sheets[sheet] : null;

  return (
    <Screen
      gap={20}
      header={<AppHeader title="Recherche de substitut" subtitle={`${leave.id_demande}, ${requester.centre_nom}`} />}
      footer={
        <>
          <Button
            label={selected ? `Proposer ${selected.employee.full_name}` : 'Sélectionnez un substitut'}
            variant="chrome"
            icon={selected ? 'check' : undefined}
            disabled={!selected}
            onPress={() => setSheet('favorable')}
          />
          <Button label="Aucun substitut trouvé" variant="danger" onPress={() => setSheet('unfavorable')} />
        </>
      }
    >
      <Card>
        <View className="flex-row items-end justify-between">
          <View className="flex-1 gap-0.5">
            <Txt weight="semi">{requester.full_name}</Txt>
            <Txt size="sm" tone="mute">
              {requester.poste}
            </Txt>
            <Txt size="sm" weight="medium" tone="soft" className="mt-1">
              {formatRange(leave.date_debut, leave.date_fin)}
            </Txt>
          </View>
          <Txt size="lg" weight="figure">
            {daysLabel(leave.jour_demande)}
          </Txt>
        </View>
        {leave.comment_escalade ? (
          <View className="mt-3 rounded-xl bg-steel px-3 py-2">
            <Txt size="sm" tone="soft">
              {leave.comment_escalade}
            </Txt>
          </View>
        ) : null}
      </Card>
      <Banner
        tone={available.length > 0 ? 'success' : 'amber'}
        icon={available.length > 0 ? 'account-check-outline' : 'account-alert-outline'}
        title={
          available.length > 0
            ? `${plural(available.length, 'profil disponible', 'profils disponibles')} dans ${plural(centresCount, 'centre')}`
            : 'Aucun profil disponible sur le réseau'
        }
        message={`Poste recherché : ${lowerFirst(requester.poste)}.`}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Nom, centre ou région" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          <Chip
            label={`Disponibles (${available.length})`}
            selected={scope === 'available'}
            onPress={() => setScope('available')}
          />
          <Chip
            label={`Même région (${sameRegion.length})`}
            selected={scope === 'region'}
            onPress={() => setScope('region')}
          />
          <Chip
            label={`Tous (${candidates.length})`}
            selected={scope === 'all'}
            onPress={() => setScope('all')}
          />
        </View>
      </ScrollView>
      <View className="gap-3">
        <SectionHeader title="Profils" count={visible.length} />
        {visible.length === 0 ? (
          <EmptyState
            icon="account-search-outline"
            title="Aucun profil"
            message="Élargissez la recherche à tous les centres."
            actionLabel="Voir tous les profils"
            onAction={() => {
              setScope('all');
              setQuery('');
            }}
          />
        ) : (
          <PagedList
            items={visible}
            resetKey={`${scope}-${query}`}
            renderItem={(candidate) => (
              <CandidateCard
                key={candidate.employee.id_personne}
                candidate={candidate}
                showCentre
                selected={candidate.employee.id_personne === selectedId}
                onPress={() => setSelectedId(candidate.employee.id_personne)}
              />
            )}
          />
        )}
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
