import { AppHeader, IconButton, Screen } from '../../components/ui';
import { LeavesPanel } from './panels/LeavesPanel';

export function PersonalLeavesScreen({ navigation }) {
  return (
    <Screen
      refreshable
      gap={18}
      header={
        <AppHeader
          title="Mes congés"
          right={
            <IconButton
              icon="plus"
              label="Demander un congé"
              onPress={() => navigation.navigate('LeaveForm')}
            />
          }
        />
      }
    >
      <LeavesPanel />
    </Screen>
  );
}
