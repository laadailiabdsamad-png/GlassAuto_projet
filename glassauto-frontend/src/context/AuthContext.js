import { createContext, useCallback, useMemo, useState } from 'react';
import { authService } from '../services';
import { useHrData } from '../hooks/useHrData';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { employeesById, refresh } = useHrData();
  const [userId, setUserId] = useState(null);

  const login = useCallback(
    async (credentials) => {
      const session = await authService.login(credentials);
      await refresh();
      setUserId(session.userId);
    },
    [refresh]
  );

  const loginAs = useCallback(
    async (id) => {
      const session = await authService.loginAs(id);
      await refresh();
      setUserId(session.userId);
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUserId(null);
  }, []);

  const user = userId ? employeesById[userId] || null : null;

  const value = useMemo(() => ({ user, login, loginAs, logout }), [user, login, loginAs, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
