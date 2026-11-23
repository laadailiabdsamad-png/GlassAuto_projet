import { AppHeader, IconButton, Screen } from '../../components/ui';
import { AbsencesPanel } from './panels/AbsencesPanel';

export function PersonalAbsencesScreen({ navigation }) {
  return (
    <Screen
      refreshable
      gap={18}
      header={
        <AppHeader
          title="Mes absences"
          right={
            <IconButton
              icon="plus"
              label="Justifier une absence"
              onPress={() => navigation.navigate('AbsenceForm')}
            />
          }
        />
      }
    >
      <AbsencesPanel />
    </Screen>
  );
}
