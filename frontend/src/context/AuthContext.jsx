/**
 * AuthContext – Firebase Authentication + API token state
 *
 * Provides:
 *  - currentUser   : Firebase User object (null if signed out)
 *  - token         : Firebase ID token (or DEMO_TOKEN in demo mode)
 *  - isDemoMode    : true when using DEMO_BYPASS_AUTH backend
 *  - signOut()     : Sign the user out from Firebase
 *
 * Usage:
 *   const { token, currentUser } = useAuth();
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { firebaseConfig, DEMO_TOKEN } from '../config';

// ── Firebase Initialisation ───────────────────────────────────────────────
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token,       setToken]       = useState(null);
  const [loading,     setLoading]     = useState(true);

  // Detect demo mode from URL param (?demo=true) or localStorage
  const isDemoMode =
    new URLSearchParams(window.location.search).get('demo') === 'true' ||
    localStorage.getItem('bm_demo_mode') === 'true';

  useEffect(() => {
    if (isDemoMode) {
      // Use static demo token – no Firebase project needed
      setToken(DEMO_TOKEN);
      setCurrentUser({ uid: 'demo-uid', email: 'citizen@bhoomi-demo.in', displayName: 'Demo Citizen' });
      localStorage.setItem('bm_demo_mode', 'true');
      setLoading(false);
      return;
    }

    // Normal Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isDemoMode]);

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('bm_demo_mode');
      setToken(null);
      setCurrentUser(null);
      window.location.href = '/';
      return;
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, isDemoMode, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
