import { LeaveDetailScreen } from '../screens/shared/LeaveDetailScreen';
import { LeaveFormScreen } from '../screens/shared/LeaveFormScreen';
import { DocumentDetailScreen } from '../screens/shared/DocumentDetailScreen';
import { DocumentFormScreen } from '../screens/shared/DocumentFormScreen';
import { AbsenceDetailScreen } from '../screens/shared/AbsenceDetailScreen';
import { AbsenceFormScreen } from '../screens/shared/AbsenceFormScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { SecurityScreen } from '../screens/shared/SecurityScreen';
import { HelpScreen } from '../screens/shared/HelpScreen';
import { EmployeeDetailScreen } from '../screens/shared/EmployeeDetailScreen';
import { PersonalLeavesScreen } from '../screens/shared/PersonalLeavesScreen';
import { PersonalDocumentsScreen } from '../screens/shared/PersonalDocumentsScreen';
import { PersonalAbsencesScreen } from '../screens/shared/PersonalAbsencesScreen';

export const stackOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: '#080808' },
};

export const sharedScreens = [
  { name: 'LeaveDetail', component: LeaveDetailScreen },
  { name: 'LeaveForm', component: LeaveFormScreen },
  { name: 'DocumentDetail', component: DocumentDetailScreen },
  { name: 'DocumentForm', component: DocumentFormScreen },
  { name: 'AbsenceDetail', component: AbsenceDetailScreen },
  { name: 'AbsenceForm', component: AbsenceFormScreen },
  { name: 'Notifications', component: NotificationsScreen },
  { name: 'Profile', component: ProfileScreen },
  { name: 'Settings', component: SettingsScreen },
  { name: 'Security', component: SecurityScreen },
  { name: 'Help', component: HelpScreen },
  { name: 'EmployeeDetail', component: EmployeeDetailScreen },
  { name: 'PersonalLeaves', component: PersonalLeavesScreen },
  { name: 'PersonalDocuments', component: PersonalDocumentsScreen },
  { name: 'PersonalAbsences', component: PersonalAbsencesScreen },
];
