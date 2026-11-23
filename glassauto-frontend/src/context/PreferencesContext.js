import { createContext, useCallback, useMemo, useState } from 'react';

export const PreferencesContext = createContext(null);

const defaults = {
  leaveAlerts: true,
  documentAlerts: true,
  absenceAlerts: true,
  haptics: true,
};

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(defaults);

  const setPreference = useCallback((key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  }, []);

  const value = useMemo(() => ({ preferences, setPreference }), [preferences, setPreference]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
