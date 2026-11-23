import { useState } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NewRequestSheet } from '../screens/collaborator/NewRequestSheet';
import { CollaboratorHomeScreen } from '../screens/collaborator/CollaboratorHomeScreen';
import { MyLeavesScreen } from '../screens/collaborator/MyLeavesScreen';
import { MyDocumentsScreen } from '../screens/collaborator/MyDocumentsScreen';
import { MyAbsencesScreen } from '../screens/collaborator/MyAbsencesScreen';
import { sharedScreens, stackOptions } from './sharedScreens';
import { TabBar } from './TabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const EmptyRoute = () => null;

function CollaboratorTabs({ navigation }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const openForm = (screen) => {
    setSheetOpen(false);
    navigation.navigate(screen);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <TabBar {...props} onCenterPress={() => setSheetOpen(true)} />}
      >
        <Tab.Screen
          name="CollaboratorHome"
          component={CollaboratorHomeScreen}
          options={{ title: 'Accueil', icon: 'home-variant-outline', activeIcon: 'home-variant' }}
        />
        <Tab.Screen
          name="MyLeaves"
          component={MyLeavesScreen}
          options={{ title: 'Congés', icon: 'calendar-month-outline', activeIcon: 'calendar-month' }}
        />
        <Tab.Screen
          name="NewRequest"
          component={EmptyRoute}
          options={{ title: 'Nouvelle demande', centerAction: true }}
        />
        <Tab.Screen
          name="MyDocuments"
          component={MyDocumentsScreen}
          options={{ title: 'Documents', icon: 'file-document-outline', activeIcon: 'file-document' }}
        />
        <Tab.Screen
          name="MyAbsences"
          component={MyAbsencesScreen}
          options={{ title: 'Absences', icon: 'calendar-remove-outline', activeIcon: 'calendar-remove' }}
        />
      </Tab.Navigator>
      <NewRequestSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onSelect={openForm} />
    </View>
  );
}

export function CollaboratorNavigator() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="Tabs" component={CollaboratorTabs} />
      {sharedScreens.map((screen) => (
        <Stack.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Stack.Navigator>
  );
}
