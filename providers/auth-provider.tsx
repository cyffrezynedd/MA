import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';

import { getFirebaseAuth } from '@/lib/firebase/auth';
import { rethrowFirebaseAuthWithHints } from '@/lib/firebase/auth-user-message';
import { isFirebaseConfigured } from '@/lib/firebase/app';

type AuthContextValue = {
  user: User | null;
  /** True until first `onAuthStateChanged` fires when Firebase Auth is active; otherwise false immediately. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured());

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setUser(null);
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase Auth is not configured');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      rethrowFirebaseAuthWithHints(e);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase Auth is not configured');
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      rethrowFirebaseAuthWithHints(e);
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [loading, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
