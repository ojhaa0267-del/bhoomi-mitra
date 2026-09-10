// ─────────────────────────────────────────────────────────────────────────────
// Firebase Configuration
// Replace the placeholder values below with your actual Firebase project config.
// Get them from: https://console.firebase.google.com → Your Project → Settings → General
// ─────────────────────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "bhoomi-mitra.firebaseapp.com",
  projectId:         "bhoomi-mitra",
  storageBucket:     "bhoomi-mitra.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

// ─────────────────────────────────────────────────────────────────────────────
// Backend API Base URL
// In development, Vite proxies /api → http://localhost:8000 (see vite.config.js)
// In production, set VITE_API_BASE_URL in your .env file.
// ─────────────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Mode Token
// In demo mode (DEMO_BYPASS_AUTH=true on backend), use this static Bearer token.
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_TOKEN = 'demo-citizen-token';

// Demo preset land codes for judging walkthroughs
export const DEMO_PARCELS = [
  { label: '✅ Safe Parcel',          code: '14029857364199', description: 'Verified & Clear Title' },
  { label: '⚠️  Highway Buffer',       code: '14029857364102', description: 'Minor NH Widening Overlap' },
  { label: '🔴 High-Risk / Disputed', code: '14029857364103', description: 'Active Court + Forest Zone' },
];
