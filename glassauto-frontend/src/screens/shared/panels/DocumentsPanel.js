import { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DocumentCard } from '../../../components/domain';
import { Banner, EmptyState, Segmented } from '../../../components/ui';
import { PICKUP_HOURS, PICKUP_LOCATION } from '../../../data/constants';
import { useMyRecords } from '../../../hooks/useMyRecords';

export function DocumentsPanel() {
  const navigation = useNavigation();
  const { documents } = useMyRecords();
  const [filter, setFilter] = useState('open');
  const groups = {
    open: documents.filter((document) =>
      ['pending_rh', 'preparation', 'ready'].includes(document.state)
    ),
    closed: documents.filter((document) => ['completed', 'rejected'].includes(document.state)),
  };
  const visible = groups[filter];

  return (
    <>
      <Banner
        tone="chrome"
        icon="office-building-marker-outline"
        title="Retrait en main propre"
        message={`${PICKUP_LOCATION}. ${PICKUP_HOURS}.`}
      />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: 'En cours', count: groups.open.length },
          { value: 'closed', label: 'Historique' },
        ]}
      />
      <View className="gap-3">
        {visible.length === 0 ? (
          <EmptyState
            icon="file-document-outline"
            title="Aucun document"
            message="Demandez une attestation, une fiche de paie ou un relevé."
            actionLabel="Demander un document"
            onAction={() => navigation.navigate('DocumentForm')}
          />
        ) : (
          visible.map((document) => (
            <DocumentCard
              key={document.id_demande}
              document={document}
              onPress={() => navigation.navigate('DocumentDetail', { id: document.id_demande })}
            />
          ))
        )}
      </View>
    </>
  );
}
