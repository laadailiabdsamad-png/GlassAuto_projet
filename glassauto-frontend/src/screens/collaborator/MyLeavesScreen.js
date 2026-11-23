import { TabHeader } from '../../components/domain';
import { Screen } from '../../components/ui';
import { LeavesPanel } from '../shared/panels/LeavesPanel';

export function MyLeavesScreen({ navigation }) {
  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader
        title="Mes congés"
        actionIcon="plus"
        actionLabel="Demander un congé"
        onAction={() => navigation.navigate('LeaveForm')}
      />
      <LeavesPanel />
    </Screen>
  );
}
