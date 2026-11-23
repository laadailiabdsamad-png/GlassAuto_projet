import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTeam } from '../hooks/useTeam';
import { ManagerHomeScreen } from '../screens/manager/ManagerHomeScreen';
import { ManagerRequestsScreen } from '../screens/manager/ManagerRequestsScreen';
import { TeamCalendarScreen } from '../screens/manager/TeamCalendarScreen';
import { TeamScreen } from '../screens/manager/TeamScreen';
import { ManagerReviewScreen } from '../screens/manager/ManagerReviewScreen';
import { TechnicalTrackingScreen } from '../screens/manager/TechnicalTrackingScreen';
import { AnnualPlanningScreen } from '../screens/manager/AnnualPlanningScreen';
import { PlanPeriodScreen } from '../screens/manager/PlanPeriodScreen';
import { TeamAbsencesScreen } from '../screens/manager/TeamAbsencesScreen';
import { PersonalSpaceScreen } from '../screens/shared/PersonalSpaceScreen';
import { sharedScreens, stackOptions } from './sharedScreens';
import { TabBar } from './TabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ManagerTabs() {
  const { toReview, toConfirm } = useTeam();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen
        name="ManagerHome"
        component={ManagerHomeScreen}
        options={{ title: 'Accueil', icon: 'home-variant-outline', activeIcon: 'home-variant' }}
      />
      <Tab.Screen
        name="ManagerRequests"
        component={ManagerRequestsScreen}
        options={{
          title: 'Demandes',
          icon: 'inbox-outline',
          activeIcon: 'inbox',
          tabBarBadge: toReview.length + toConfirm.length,
        }}
      />
      <Tab.Screen
        name="TeamCalendar"
        component={TeamCalendarScreen}
        options={{ title: 'Planning', icon: 'calendar-month-outline', activeIcon: 'calendar-month' }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{ title: 'Équipe', icon: 'account-group-outline', activeIcon: 'account-group' }}
      />
      <Tab.Screen
        name="PersonalSpace"
        component={PersonalSpaceScreen}
        options={{ title: 'Mon espace', icon: 'account-circle-outline', activeIcon: 'account-circle' }}
      />
    </Tab.Navigator>
  );
}

export function ManagerNavigator() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Tabs" component={ManagerTabs} />
      <Stack.Screen name="ManagerReview" component={ManagerReviewScreen} />
      <Stack.Screen name="TechnicalTracking" component={TechnicalTrackingScreen} />
      <Stack.Screen name="AnnualPlanning" component={AnnualPlanningScreen} />
      <Stack.Screen name="PlanPeriod" component={PlanPeriodScreen} />
      <Stack.Screen name="TeamAbsences" component={TeamAbsencesScreen} />
      {sharedScreens.map((screen) => (
        <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Stack.Navigator>
  );
}
