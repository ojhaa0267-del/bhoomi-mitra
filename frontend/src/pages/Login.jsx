/**
 * Login.jsx – Bhoomi Mitra Authentication Page
 *
 * Features:
 *  - Dark-mode Cyber-Civic glassmorphic login card
 *  - Firebase email/password sign-in and sign-up
 *  - One-click "Continue as Demo" mode for judging walkthroughs
 *  - Smooth Slide-Up card entrance animation
 */
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const navigate = useNavigate();

  // ── Firebase Auth ──────────────────────────────────────────────────────
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Demo Mode ──────────────────────────────────────────────────────────
  const handleDemo = () => {
    localStorage.setItem('bm_demo_mode', 'true');
    // Full reload so AuthProvider picks up the demo flag
    window.location.href = '/dashboard?demo=true';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-deep px-4 py-10 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent-blue/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-accent-emerald/5 blur-3xl" />
      </div>

      {/* Logo / Brand */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <span className="text-4xl">🌾</span>
          <h1 className="text-3xl font-black font-display text-white tracking-tight">
            Bhoomi Mitra
          </h1>
        </div>
        <p className="text-sm text-slate-400">Pratyaksh AI · Citizen Land Portal</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bm-card p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-xl font-bold text-white text-center mb-1">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-slate-400 text-center mb-7">
          {isRegistering
            ? 'Register to access land records and AI insights.'
            : 'Sign in to verify land parcels and check risk scores.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="citizen@example.com"
              className="bm-input"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bm-input"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bm-btn-primary w-full mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Register / Login */}
        <p
          onClick={() => { setIsRegistering(r => !r); setError(''); }}
          className="mt-4 text-xs text-center text-slate-400 cursor-pointer hover:text-accent-blue transition-colors"
        >
          {isRegistering
            ? 'Already have an account? Sign In →'
            : "New user? Create an account →"}
        </p>

        {/* Demo Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-blue-900/40" />
          <span className="mx-3 text-xs text-slate-500">or</span>
          <div className="flex-1 h-px bg-blue-900/40" />
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={handleDemo}
          className="bm-btn-outline w-full flex items-center justify-center gap-2 text-sm"
        >
          <span>🎯</span>
          Continue as Demo (No Login Required)
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-2">
          Ideal for hackathon demos. Uses sample land data.
        </p>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-slate-600 text-center">
        Bhoomi Mitra © 2026 · Powered by Pratyaksh AI · Civic Tech Initiative
      </p>
    </div>
  );
}

// ── Firebase error code → friendly message ─────────────────────────────────
function friendlyFirebaseError(code) {
  const map = {
    'auth/invalid-email':             'Please enter a valid email address.',
    'auth/user-not-found':            'No account found with this email.',
    'auth/wrong-password':            'Incorrect password. Please try again.',
    'auth/email-already-in-use':      'An account with this email already exists.',
    'auth/weak-password':             'Password must be at least 6 characters.',
    'auth/too-many-requests':         'Too many attempts. Please wait a moment.',
    'auth/network-request-failed':    'Network error. Check your connection.',
    'auth/invalid-credential':        'Invalid credentials. Please try again.',
  };
  return map[code] || `Authentication error (${code}).`;
}
