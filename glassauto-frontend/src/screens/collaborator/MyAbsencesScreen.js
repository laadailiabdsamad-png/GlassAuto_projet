import { TabHeader } from '../../components/domain';
import { Screen } from '../../components/ui';
import { AbsencesPanel } from '../shared/panels/AbsencesPanel';

export function MyAbsencesScreen({ navigation }) {
  return (
    <Screen tabbed refreshable gap={18}>
      <TabHeader
        title="Mes absences"
        actionIcon="plus"
        actionLabel="Justifier une absence"
        onAction={() => navigation.navigate('AbsenceForm')}
      />
      <AbsencesPanel />
    </Screen>
  );
}
