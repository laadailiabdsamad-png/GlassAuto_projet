import { AppHeader, IconButton, Screen } from '../../components/ui';
import { DocumentsPanel } from './panels/DocumentsPanel';

export function PersonalDocumentsScreen({ navigation }) {
  return (
    <Screen
      refreshable
      gap={18}
      header={
        <AppHeader
          title="Mes documents"
          right={
            <IconButton
              icon="plus"
              label="Demander un document"
              onPress={() => navigation.navigate('DocumentForm')}
            />
          }
        />
      }
    >
      <DocumentsPanel />
    </Screen>
  );
}
