import { TabHeader } from '../../components/domain';
import { Screen } from '../../components/ui';
import { DocumentsPanel } from '../shared/panels/DocumentsPanel';

export function MyDocumentsScreen({ navigation }) {
  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader
        title="Mes documents"
        actionIcon="plus"
        actionLabel="Demander un document"
        onAction={() => navigation.navigate('DocumentForm')}
      />
      <DocumentsPanel />
    </Screen>
  );
}
