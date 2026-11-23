import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useHrData } from './useHrData';
import { usePreferences } from './usePreferences';

const categoryOf = (notification) => {
  const screen = notification.target ? notification.target.screen : '';
  if (screen === 'DocumentDetail') {
    return 'documentAlerts';
  }
  if (screen === 'AbsenceDetail') {
    return 'absenceAlerts';
  }
  return 'leaveAlerts';
};

export const useNotifications = () => {
  const { user } = useAuth();
  const { notifications } = useHrData();
  const { preferences } = usePreferences();

  return useMemo(() => {
    const mine = notifications
      .filter((item) => user && item.id_personne === user.id_personne)
      .filter((item) => preferences[categoryOf(item)])
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return { items: mine, unread: mine.filter((item) => !item.read).length };
  }, [user, notifications, preferences]);
};
