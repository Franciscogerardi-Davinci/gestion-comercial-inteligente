import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import type { AuthUser } from '../../types/auth';
import { AuthContext } from './authContext';
import {
  getMeRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
  type LoginInput,
  type RegisterInput,
} from './authApi';
import { authStorage } from './authStorage';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!authStorage.getToken()) {
        setIsLoading(false);
        return;
      }

      try {
        setUser(await getMeRequest());
      } catch {
        authStorage.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login: async (input: LoginInput) => {
        const session = await loginRequest(input);
        authStorage.setToken(session.token);
        setUser(session.user);
      },
      register: async (input: RegisterInput) => {
        const session = await registerRequest(input);
        authStorage.setToken(session.token);
        setUser(session.user);
      },
      logout: async () => {
        try {
          if (authStorage.getToken()) {
            await logoutRequest();
          }
        } finally {
          authStorage.clearToken();
          setUser(null);
        }
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
