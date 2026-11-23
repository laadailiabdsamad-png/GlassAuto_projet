import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEscalations } from '../hooks/useEscalations';
import { TechnicalHomeScreen } from '../screens/technical/TechnicalHomeScreen';
import { EscalationsScreen } from '../screens/technical/EscalationsScreen';
import { CentresScreen } from '../screens/technical/CentresScreen';
import { TechnicalHistoryScreen } from '../screens/technical/TechnicalHistoryScreen';
import { SubstituteSearchScreen } from '../screens/technical/SubstituteSearchScreen';
import { CentreDetailScreen } from '../screens/technical/CentreDetailScreen';
import { PersonalSpaceScreen } from '../screens/shared/PersonalSpaceScreen';
import { sharedScreens, stackOptions } from './sharedScreens';
import { TabBar } from './TabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TechnicalTabs() {
  const { pending } = useEscalations();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen
        name="TechnicalHome"
        component={TechnicalHomeScreen}
        options={{ title: 'Accueil', icon: 'home-variant-outline', activeIcon: 'home-variant' }}
      />
      <Tab.Screen
        name="Escalations"
        component={EscalationsScreen}
        options={{
          title: 'Escalades',
          icon: 'swap-horizontal',
          activeIcon: 'swap-horizontal-bold',
          tabBarBadge: pending.length,
        }}
      />
      <Tab.Screen
        name="Centres"
        component={CentresScreen}
        options={{ title: 'Centres', icon: 'map-marker-radius-outline', activeIcon: 'map-marker-radius' }}
      />
      <Tab.Screen
        name="TechnicalHistory"
        component={TechnicalHistoryScreen}
        options={{ title: 'Historique', icon: 'history' }}
      />
      <Tab.Screen
        name="PersonalSpace"
        component={PersonalSpaceScreen}
        options={{ title: 'Mon espace', icon: 'account-circle-outline', activeIcon: 'account-circle' }}
      />
    </Tab.Navigator>
  );
}

export function TechnicalNavigator() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Tabs" component={TechnicalTabs} />
      <Stack.Screen name="SubstituteSearch" component={SubstituteSearchScreen} />
      <Stack.Screen name="CentreDetail" component={CentreDetailScreen} />
      {sharedScreens.map((screen) => (
        <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Stack.Navigator>
  );
}
