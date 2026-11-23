import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EmptyState, SkeletonScreen } from '../components/ui';
import { ROLES } from '../data/constants';
import { useAuth } from '../hooks/useAuth';
import { useHrData } from '../hooks/useHrData';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { CollaboratorNavigator } from './CollaboratorNavigator';
import { ManagerNavigator } from './ManagerNavigator';
import { TechnicalNavigator } from './TechnicalNavigator';
import { HrNavigator } from './HrNavigator';
import { stackOptions } from './sharedScreens';

const Stack = createNativeStackNavigator();

const NAVIGATORS = {
  [ROLES.COLLABORATEUR]: { name: 'CollaboratorRoot', component: CollaboratorNavigator },
  [ROLES.RESPONSABLE_CENTRE]: { name: 'ManagerRoot', component: ManagerNavigator },
  [ROLES.RESPONSABLE_TECHNIQUE]: { name: 'TechnicalRoot', component: TechnicalNavigator },
  [ROLES.RH]: { name: 'HrRoot', component: HrNavigator },
};

export function RootNavigator() {
  const { status, refresh } = useHrData();
  const { user } = useAuth();

  if (status === 'loading') {
    return <SkeletonScreen />;
  }

  if (status === 'error') {
    return (
      <View className="flex-1 justify-center bg-obsidian px-6">
        <EmptyState
          icon="cloud-off-outline"
          title="Données indisponibles"
          message="Le chargement a échoué. Vérifiez votre connexion puis réessayez."
          actionLabel="Réessayer"
          onAction={refresh}
        />
      </View>
    );
  }

  const root = user ? NAVIGATORS[user.role] : { name: 'Login', component: LoginScreen };

  return (
    <Stack.Navigator
      key={user ? user.id_personne : 'anonymous'}
      screenOptions={{ ...stackOptions, animation: 'fade' }}
    >
      <Stack.Screen name={root.name} component={root.component} />
    </Stack.Navigator>
  );
}
