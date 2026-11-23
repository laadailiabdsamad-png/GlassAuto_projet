import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useHrQueues } from '../hooks/useHrQueues';
import { HrHomeScreen } from '../screens/hr/HrHomeScreen';
import { HrLeavesScreen } from '../screens/hr/HrLeavesScreen';
import { HrDocumentsScreen } from '../screens/hr/HrDocumentsScreen';
import { HrAbsencesScreen } from '../screens/hr/HrAbsencesScreen';
import { HrAnalyticsScreen } from '../screens/hr/HrAnalyticsScreen';
import { HrEmployeesScreen } from '../screens/hr/HrEmployeesScreen';
import { HrCalendarScreen } from '../screens/hr/HrCalendarScreen';
import { HrHistoryScreen } from '../screens/hr/HrHistoryScreen';
import { HrPlansScreen } from '../screens/hr/HrPlansScreen';
import { PlanDetailScreen } from '../screens/hr/PlanDetailScreen';
import { PayrollCheckScreen } from '../screens/hr/PayrollCheckScreen';
import { sharedScreens, stackOptions } from './sharedScreens';
import { TabBar } from './TabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HrTabs() {
  const { pendingLeaves, openDocuments, pendingAbsences } = useHrQueues();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen
        name="HrHome"
        component={HrHomeScreen}
        options={{ title: 'Accueil', icon: 'home-variant-outline', activeIcon: 'home-variant' }}
      />
      <Tab.Screen
        name="HrLeaves"
        component={HrLeavesScreen}
        options={{
          title: 'Congés',
          icon: 'calendar-check-outline',
          activeIcon: 'calendar-check',
          tabBarBadge: pendingLeaves.length,
        }}
      />
      <Tab.Screen
        name="HrDocuments"
        component={HrDocumentsScreen}
        options={{
          title: 'Documents',
          icon: 'file-document-outline',
          activeIcon: 'file-document',
          tabBarBadge: openDocuments.length,
        }}
      />
      <Tab.Screen
        name="HrAbsences"
        component={HrAbsencesScreen}
        options={{
          title: 'Absences',
          icon: 'calendar-remove-outline',
          activeIcon: 'calendar-remove',
          tabBarBadge: pendingAbsences.length,
        }}
      />
      <Tab.Screen
        name="HrAnalytics"
        component={HrAnalyticsScreen}
        options={{ title: 'Analyses', icon: 'chart-box-outline', activeIcon: 'chart-box' }}
      />
    </Tab.Navigator>
  );
}

export function HrNavigator() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Tabs" component={HrTabs} />
      <Stack.Screen name="HrEmployees" component={HrEmployeesScreen} />
      <Stack.Screen name="HrCalendar" component={HrCalendarScreen} />
      <Stack.Screen name="HrHistory" component={HrHistoryScreen} />
      <Stack.Screen name="HrPlans" component={HrPlansScreen} />
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} />
      <Stack.Screen name="PayrollCheck" component={PayrollCheckScreen} />
      {sharedScreens.map((screen) => (
        <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Stack.Navigator>
  );
}
