'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, toAuthUser } from './api';
import type { AuthUser, UserRole } from './types';

type SessionValue = {
  user?: AuthUser;
  ready: boolean;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  signup: (input: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionValue>({
  ready: false,
  pickerOpen: false,
  openPicker: () => undefined,
  closePicker: () => undefined,
  signup: async () => undefined,
  login: async () => undefined,
  logout: async () => undefined,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>();
  const [ready, setReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  const signup = useCallback(async (input: { name: string; email: string; password: string; role: UserRole }) => {
    const result = await api.signup(input);
    setUser(toAuthUser(result.user));
    setPickerOpen(false);
  }, []);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const result = await api.login(input);
    setUser(toAuthUser(result.user));
    setPickerOpen(false);
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => undefined);
    setUser(undefined);
  }, []);

  useEffect(() => {
    void api
      .me()
      .then((result) => setUser(toAuthUser(result.user)))
      .catch(() => setUser(undefined))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({ user, ready, pickerOpen, openPicker, closePicker, signup, login, logout }),
    [user, ready, pickerOpen, openPicker, closePicker, signup, login, logout],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
