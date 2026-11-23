import { View } from 'react-native';
import { AppHeader, Banner, Button, Card, Screen, SectionHeader, SwitchRow } from '../../components/ui';
import { useFeedback } from '../../hooks/useFeedback';
import { useHrData } from '../../hooks/useHrData';
import { usePreferences } from '../../hooks/usePreferences';

export function SettingsScreen() {
  const { preferences, setPreference } = usePreferences();
  const { actions } = useHrData();
  const { attempt, confirm } = useFeedback();

  const reset = async () => {
    const accepted = await confirm({
      icon: 'backup-restore',
      title: 'Réinitialiser la démonstration ?',
      message: 'Toutes les demandes saisies pendant cette session seront effacées.',
      confirmLabel: 'Réinitialiser',
      danger: true,
    });
    if (accepted) {
      await attempt(() => actions.demo.resetDemo(), { title: 'Démonstration réinitialisée' });
    }
  };

  return (
    <Screen header={<AppHeader title="Paramètres" />}>
      <View className="gap-3">
        <SectionHeader title="Notifications affichées" />
        <Card>
          <View className="-my-2">
            <SwitchRow
              icon="calendar-month-outline"
              title="Congés et planning"
              value={preferences.leaveAlerts}
              onValueChange={(value) => setPreference('leaveAlerts', value)}
            />
            <SwitchRow
              icon="file-document-outline"
              title="Documents"
              value={preferences.documentAlerts}
              onValueChange={(value) => setPreference('documentAlerts', value)}
            />
            <SwitchRow
              icon="calendar-remove-outline"
              title="Absences"
              value={preferences.absenceAlerts}
              onValueChange={(value) => setPreference('absenceAlerts', value)}
              last
            />
          </View>
        </Card>
      </View>
      <View className="gap-3">
        <SectionHeader title="Appareil" />
        <Card>
          <View className="-my-2">
            <SwitchRow
              icon="vibrate"
              title="Vibrations"
              subtitle="À chaque confirmation"
              value={preferences.haptics}
              onValueChange={(value) => setPreference('haptics', value)}
              last
            />
          </View>
        </Card>
      </View>
      <View className="gap-3">
        <SectionHeader title="Démonstration" />
        <Banner
          tone="sky"
          icon="flask-outline"
          message="Les données sont fictives et conservées en mémoire jusqu’à la fermeture de l’application. La connexion est simulée."
        />
        <Button label="Réinitialiser les données" icon="backup-restore" variant="outline" onPress={reset} />
      </View>
    </Screen>
  );
}
