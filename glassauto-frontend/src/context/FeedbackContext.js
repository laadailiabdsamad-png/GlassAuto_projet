import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Toast } from '../components/ui/Toast';
import { usePreferences } from '../hooks/usePreferences';

export const FeedbackContext = createContext(null);

const vibrate = (tone) => {
  const type =
    tone === 'error'
      ? Haptics.NotificationFeedbackType.Error
      : Haptics.NotificationFeedbackType.Success;
  Haptics.notificationAsync(type).catch(() => null);
};

export function FeedbackProvider({ children }) {
  const { preferences } = usePreferences();
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const timer = useRef(null);
  const resolver = useRef(null);
  const haptics = preferences.haptics;

  const hideToast = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const showToast = useCallback(
    ({ tone = 'success', title, message }) => {
      clearTimeout(timer.current);
      if (haptics) {
        vibrate(tone);
      }
      setToast({ key: Date.now(), tone, title, message });
      timer.current = setTimeout(() => setToast(null), 3800);
    },
    [haptics]
  );

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setDialog(options);
      }),
    []
  );

  const closeDialog = useCallback((answer) => {
    setDialog(null);
    if (resolver.current) {
      resolver.current(answer);
      resolver.current = null;
    }
  }, []);

  const attempt = useCallback(
    async (operation, success) => {
      try {
        const result = await operation();
        if (success) {
          showToast({ tone: 'success', ...success });
        }
        return { ok: true, result };
      } catch (error) {
        showToast({ tone: 'error', title: 'Action impossible', message: error.message });
        return { ok: false, error };
      }
    },
    [showToast]
  );

  const value = useMemo(() => ({ showToast, confirm, attempt }), [showToast, confirm, attempt]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <ConfirmDialog dialog={dialog} onClose={closeDialog} />
      <Toast toast={toast} onHide={hideToast} />
    </FeedbackContext.Provider>
  );
}
