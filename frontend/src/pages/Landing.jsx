/**
 * Landing.jsx – Bhoomi Mitra Public Hero Page
 *
 * A stunning dark-mode hero page for first-time visitors:
 *  - Animated headline with gradient text
 *  - 3 feature cards (GIS / AI / Voice)
 *  - Floating stats row
 *  - CTA buttons: "Login" + "Try Demo"
 *  - Subtle background grid + glow orbs
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon:    '🗺️',
    title:   'GIS Risk Mapping',
    desc:    'Real-time Leaflet.js maps with colour-coded parcel polygons — green for safe, amber for caution, crimson for high-risk disputes.',
    accent:  'from-blue-600/20 to-blue-600/5',
    border:  'border-blue-600/30',
  },
  {
    icon:    '🛡️',
    title:   'Explainable AI Trust Score',
    desc:    'A 0–100% trust score powered by multi-factor GIS analysis, court record checks, and SHAP-style transparent AI attribution.',
    accent:  'from-emerald-600/20 to-emerald-600/5',
    border:  'border-emerald-600/30',
  },
  {
    icon:    '🎙️',
    title:   'Hinglish Voice Agent',
    desc:    'Ask your land questions by voice — "Mutation mein kitna time?" — and get instant audio answers with map navigation.',
    accent:  'from-violet-600/20 to-violet-600/5',
    border:  'border-violet-600/30',
  },
  {
    icon:    '⏳',
    title:   'SRO Delay Predictor',
    desc:    'ML-powered prediction of Sub-Registrar Office processing time, accounting for queue depth, fiscal cycles, and dispute flags.',
    accent:  'from-amber-600/20 to-amber-600/5',
    border:  'border-amber-600/30',
  },
  {
    icon:    '📜',
    title:   'RTI Generator',
    desc:    'One-click RTI application drafts pre-filled with your parcel details — ready to submit to government offices instantly.',
    accent:  'from-pink-600/20 to-pink-600/5',
    border:  'border-pink-600/30',
  },
  {
    icon:    '🔷',
    title:   'Bhu-Aadhar Integration',
    desc:    'Connects to the DILRMP 14-digit ULPIN registry to pull verified ownership, soil, survey, and market price gap data.',
    accent:  'from-cyan-600/20 to-cyan-600/5',
    border:  'border-cyan-600/30',
  },
];

const STATS = [
  { value: '3 Cr+',   label: 'Land Records' },
  { value: '99.2%',  label: 'Data Accuracy' },
  { value: '<2 sec', label: 'Query Time' },
  { value: '18 States', label: 'Coverage' },
];

export default function Landing() {
  const navigate = useNavigate();

  const handleDemo = () => {
    localStorage.setItem('bm_demo_mode', 'true');
    window.location.href = '/dashboard?demo=true';
  };

  return (
    <div className="min-h-screen bg-background-deep text-white overflow-x-hidden">

      {/* ── Background Effects ──────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-accent-blue/8 blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 rounded-full bg-emerald-500/6 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-violet-600/6 blur-3xl" />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 border-b border-blue-900/20">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌾</span>
          <div>
            <span className="font-black text-lg font-display">Bhoomi Mitra</span>
            <span className="ml-2 text-[10px] text-slate-400 font-medium">Pratyaksh AI</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="bm-btn-outline text-sm py-2 px-5">
            Login
          </button>
          <button onClick={handleDemo} className="bm-btn-primary text-sm py-2 px-5">
            Try Demo
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 text-center px-6 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full bg-accent-blue/15 border border-accent-blue/30 text-accent-blue mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
          Civic Tech Initiative · DILRMP Integrated
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-display leading-tight max-w-4xl mx-auto mb-6 animate-slide-up">
          Apni Zameen Ki{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #10B981, #3B82F6, #8B5CF6)' }}
          >
            Poori Sachhai
          </span>
          {' '}— Ek Click Mein
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.15s' }}>
          Bhoomi Mitra uses AI, GIS satellite data, and real court records to give citizens 
          instant land parcel verification, risk scoring, and administrative delay prediction — 
          in plain Hinglish, by voice.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <button
            onClick={handleDemo}
            className="bm-btn-primary text-base px-10 py-4 shadow-glow-blue flex items-center gap-2"
          >
            🎯 Try Live Demo
            <span className="text-blue-200 text-xs font-normal">No login needed</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="bm-btn-outline text-base px-10 py-4 flex items-center gap-2"
          >
            🔐 Login with Firebase
          </button>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="bm-card p-5 text-center">
              <p className="text-2xl font-black font-display text-white mb-1">{s.value}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Grid ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-black font-display text-center mb-10">
          Complete Land Intelligence Suite
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`relative bg-gradient-to-br ${f.accent} border ${f.border} rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 cursor-default`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 text-center pb-10 text-xs text-slate-600 border-t border-blue-900/20 pt-6">
        <p>Bhoomi Mitra · Pratyaksh AI · Civic Tech Initiative · © 2026</p>
        <p className="mt-1">Built with FastAPI · React · Leaflet · Scikit-Learn · Firebase · Groq LLM</p>
      </footer>
    </div>
  );
}
