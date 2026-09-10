"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  AUTH_CHANGE_EVENT,
  getSignedInUser,
  requestPasswordReset,
  resetPassword,
  signIn,
  signOut as clearSession,
  signUp,
  type PublicUser,
} from "@/lib/auth";

type AuthContextValue = {
  user: PublicUser | null;
  ready: boolean;
  refresh: () => void;
  signUp: typeof signUp;
  signIn: typeof signIn;
  signOut: () => void;
  requestPasswordReset: typeof requestPasswordReset;
  resetPassword: typeof resetPassword;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribeAuth(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, onStoreChange);
  };
}

function getAuthSnapshot() {
  const user = getSignedInUser();
  return user ? JSON.stringify(user) : "";
}

function getEmptySnapshot() {
  return "";
}

function subscribeMounted() {
  return () => {};
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(subscribeMounted, () => true, () => false);
  const snapshot = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getEmptySnapshot
  );
  const user = useMemo<PublicUser | null>(() => {
    if (!mounted || !snapshot) return null;
    return JSON.parse(snapshot) as PublicUser;
  }, [mounted, snapshot]);

  const refresh = useCallback(() => {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready: mounted,
      refresh,
      signUp,
      signIn,
      signOut: () => {
        clearSession();
      },
      requestPasswordReset,
      resetPassword,
    }),
    [mounted, refresh, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
