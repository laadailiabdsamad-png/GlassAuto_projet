import { useEffect, useState } from 'react';
import { DocumentCard, PagedList, TabHeader } from '../../components/domain';
import { Button, EmptyState, Screen, SearchBar, Segmented } from '../../components/ui';
import { DOCUMENT_TYPES } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { useHrQueues } from '../../hooks/useHrQueues';
import { byNewest, matches } from '../../utils/format';

export function HrDocumentsScreen({ navigation, route }) {
  const { user } = useAuth();
  const { documents, employeesById, actions } = useHrData();
  const { attempt } = useFeedback();
  const { openDocuments, readyDocuments } = useHrQueues();
  const requested = route.params ? route.params.filter : null;
  const [filter, setFilter] = useState(requested || 'open');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (requested) {
      setFilter(requested);
      navigation.setParams({ filter: undefined });
    }
  }, [requested, navigation]);

  const pools = {
    open: openDocuments,
    ready: readyDocuments,
    closed: documents
      .filter((document) => ['completed', 'rejected'].includes(document.state))
      .sort(byNewest),
  };
  const visible = pools[filter].filter((document) => {
    if (!query) {
      return true;
    }
    const employee = employeesById[document.id_demandeur];
    return matches(
      `${employee.full_name} ${employee.centre_nom} ${DOCUMENT_TYPES[document.type_doc].label}`,
      query
    );
  });

  const prepare = (document) =>
    attempt(
      () =>
        actions.documents.startPreparation(document.id_demande, { actorId: user.id_personne }),
      { title: 'Préparation lancée', message: 'Le collaborateur est informé.' }
    );

  const notifyReady = (document) =>
    attempt(
      () =>
        actions.documents.markReady(document.id_demande, {
          actorId: user.id_personne,
          comment: 'Document signé et cacheté.',
        }),
      {
        title: 'Notification de retrait envoyée',
        message: `${employeesById[document.id_demandeur].full_name} est prévenu.`,
      }
    );

  const remind = (document) =>
    attempt(() => actions.documents.remindPickup(document.id_demande), {
      title: 'Rappel envoyé',
      message: `${employeesById[document.id_demandeur].full_name} est prévenu.`,
    });

  const cardAction = (document) => {
    if (document.state === 'pending_rh') {
      return { label: 'Lancer la préparation', icon: 'file-sign', run: prepare };
    }
    if (document.state === 'preparation') {
      return { label: 'Prêt, notifier le retrait', icon: 'bell-ring-outline', run: notifyReady };
    }
    if (document.state === 'ready') {
      return { label: 'Envoyer un rappel', icon: 'bell-outline', run: remind };
    }
    return null;
  };

  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader title="Documents RH" subtitle="Préparation et retrait en main propre" />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: 'À traiter', count: openDocuments.length },
          { value: 'ready', label: 'À remettre', count: readyDocuments.length },
          { value: 'closed', label: 'Historique' },
        ]}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Nom, centre ou document" />
      {visible.length === 0 ? (
        <EmptyState
          icon="file-check-outline"
          title="Aucun document"
          message={query ? 'Modifiez la recherche.' : 'Rien à traiter dans cette catégorie.'}
        />
      ) : (
        <PagedList
          items={visible}
          resetKey={`${filter}-${query}`}
          renderItem={(document) => {
            const action = cardAction(document);
            return (
              <DocumentCard
                key={document.id_demande}
                document={document}
                showEmployee
                onPress={() => navigation.navigate('DocumentDetail', { id: document.id_demande })}
                footer={
                  action ? (
                    <Button
                      label={action.label}
                      icon={action.icon}
                      size="sm"
                      variant={document.state === 'preparation' ? 'chrome' : 'subtle'}
                      onPress={() => action.run(document)}
                    />
                  ) : null
                }
              />
            );
          }}
        />
      )}
    </Screen>
  );
}
