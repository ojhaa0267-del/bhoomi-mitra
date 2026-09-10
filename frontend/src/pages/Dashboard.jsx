/**
 * Dashboard.jsx – Bhoomi Mitra Full Application Shell (Phase 3 Final)
 *
 * Wires all components together:
 *  - LandMap (GIS viewer) ← voice-agent MAP_ACTION callback
 *  - TrustScoreGauge (XAI)
 *  - RiskWidget (flags)
 *  - TimelineBar (SRO pipeline)
 *  - ParcelInfoCard (owner/soil/price)
 *  - ChatBot (voice agent) ← fires onMapAction + onDocAction
 *  - RTIModal ← triggered by DOC_ACTION from voice or manual button
 *  - NotificationToast ← success/warning/error alerts
 */
import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadParcelData } from '../utils/api';
import { DEMO_PARCELS } from '../config';
import { useToast } from '../components/NotificationToast';
import LandMap         from '../components/LandMap';
import TrustScoreGauge from '../components/TrustScoreGauge';
import RiskWidget      from '../components/RiskWidget';
import TimelineBar     from '../components/TimelineBar';
import ParcelInfoCard  from '../components/ParcelInfoCard';
import ChatBot         from '../components/ChatBot';
import RTIModal        from '../components/RTIModal';
import LanguageModal   from '../components/LanguageModal';

// ── Loading Skeleton ──────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`bg-background-subtle rounded-2xl animate-pulse ${className}`} />;
}

export default function Dashboard() {
  const { currentUser, token, isDemoMode, signOut } = useAuth();
  const { addToast } = useToast();
  const mapRef = useRef(null);

  const [inputCode,  setInputCode]  = useState('');
  const [activeCode, setActiveCode] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [data,       setData]       = useState(null);

  // RTI modal state
  const [rtiOpen,    setRtiOpen]    = useState(false);

  // Language Modal State
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [userLang, setUserLang] = useState('hi');

  React.useEffect(() => {
    const saved = localStorage.getItem('bhoomi_mitra_lang_code');
    if (!saved) {
      setLangModalOpen(true);
    } else {
      setUserLang(saved);
    }
  }, []);

  const handleLanguageSelect = (lang) => {
    localStorage.setItem('bhoomi_mitra_lang_code', lang.code);
    setUserLang(lang.code);
  };

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async (code) => {
    let raw = (code || inputCode || '').trim().replace(/\D/g, '');
    if (!raw) {
      addToast('Please enter a Bhu-Aadhar ID or select a preset below.', 'warning', 3000);
      return;
    }
    let landCode = raw;
    if (landCode.length < 14) {
      landCode = landCode.padEnd(14, '0');
    } else if (landCode.length > 14) {
      landCode = landCode.slice(0, 14);
    }

    setLoading(true);
    setError('');
    setData(null);
    setActiveCode(landCode);
    setInputCode(landCode);

    try {
      const result = await loadParcelData(landCode, token);
      setData(result);
      const risk = result.risk?.risk_matrix?.overall_risk_level ?? 'Low';
      const score = result.risk?.risk_matrix?.trust_score_percentage ?? 0;
      addToast(
        `${result.parcel?.owner_details?.name ?? 'Parcel'} loaded · Trust Score: ${score}%`,
        risk === 'High' ? 'warning' : risk === 'Medium' ? 'warning' : 'success',
        5000,
      );
    } catch (err) {
      setError(err.message || 'Failed to load parcel data.');
      addToast('Parcel not found. Please check the Bhu-Aadhar ID.', 'error');
    } finally {
      setLoading(false);
    }
  }, [inputCode, token, addToast]);

  const handleMapAction = useCallback(({ lat, lng, zoom }) => {
    mapRef.current?.flyTo(lat, lng, zoom ?? 16);
    addToast(`Map panned to ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'info', 3000);
  }, [addToast]);

  const handleDocAction = useCallback(({ type }) => {
    if (type === 'RTI_Draft') setRtiOpen(true);
  }, []);

  const handleSimulateSearch = useCallback((simulatedData) => {
    setActiveCode(simulatedData.parcel.bhu_aadhar_id);
    setInputCode(simulatedData.parcel.bhu_aadhar_id);
    setData(simulatedData);
    addToast(
      `${simulatedData.parcel.owner_details.name} loaded (Generated Profile)`,
      'success',
      5000,
    );
  }, [addToast]);

  // ── Derived values ────────────────────────────────────────────────────────
  const riskLevel  = data?.risk?.risk_matrix?.overall_risk_level ?? 'Low';
  const trustScore = data?.risk?.risk_matrix?.trust_score_percentage ?? 0;
  const xaiWeights = data?.risk?.risk_matrix?.explainable_ai_weights ?? [];
  const riskBreak  = data?.risk?.risk_matrix?.risk_breakdown ?? null;
  const milestones = data?.delay?.timeline_milestones ?? [];
  const totalDays  = data?.delay?.estimated_total_days ?? 0;
  const sroOffice  = data?.delay?.sub_registrar_office ?? '';
  const congestion = data?.delay?.congestion_factor ?? '';
  const lat        = data?.parcel?.coordinates?.latitude  ?? 20.5937;
  const lng        = data?.parcel?.coordinates?.longitude ?? 78.9629;
  const zoom       = data ? 16 : 4;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070D19] via-[#0B132B] to-[#070D19] text-white flex flex-col">

      {/* ── V4 Premium Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-[1100] bg-[#070D19]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <div className="w-full h-full bg-[#070D19] rounded-[10px] flex items-center justify-center">
              <span className="text-xl">🌾</span>
            </div>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg lg:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-emerald-400">
              Bhoomi Mitra
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">AI Land Governance & GIS Portal</p>
          </div>
        </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isDemoMode && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                DEMO MODE
              </span>
            )}
            {data && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                LIVE DATA
              </span>
            )}
            {/* RTI Button when parcel loaded */}
            {data && (
              <button
                onClick={() => setRtiOpen(true)}
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-blue-900/40 text-slate-300 hover:border-accent-blue/50 hover:text-white bg-background-subtle transition-all"
              >
                📜 RTI Draft
              </button>
            )}
            <span className="text-xs text-slate-400 hidden md:block truncate max-w-[180px]">
              {currentUser?.displayName || currentUser?.email}
            </span>
            <button
              onClick={signOut}
              className="text-xs text-slate-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-background-subtle"
            >
              Sign Out
            </button>
          </div>
      </header>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

        {/* ── Search Panel ─────────────────────────────────────────────── */}
        <section className="bm-card p-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">🔷</span>
              <input
                id="bhu-aadhar-search"
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 14))}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Enter 14-digit Bhu-Aadhar ID (ULPIN)..."
                className="bm-input pl-10 font-mono text-base tracking-widest"
                maxLength={14}
                autoComplete="off"
              />
              {inputCode.length > 0 && inputCode.length < 14 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 pointer-events-none">
                  {14 - inputCode.length} more
                </span>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={inputCode.length !== 14 || loading}
              className="bm-btn-primary whitespace-nowrap px-8 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : '🔍'}
              {loading ? 'Searching...' : 'Search Parcel'}
            </button>
          </div>

          {/* Demo preset chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-slate-600 uppercase tracking-widest">Quick demo:</span>
            {DEMO_PARCELS.map(p => (
              <button
                key={p.code}
                onClick={() => { setInputCode(p.code); handleSearch(p.code); }}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium bg-background-subtle border border-blue-900/30 hover:border-accent-blue/50 hover:bg-background-card transition-all duration-200 disabled:opacity-40"
              >
                <span>{p.label}</span>
                <span className="text-slate-500 font-mono">···{p.code.slice(-4)}</span>
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}
        </section>

        {/* ── Main Layout Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

          {/* Left column */}
          <div className="flex flex-col md:space-y-6">

            {/* Map + Risk Widget */}
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] md:gap-6 relative">
              {/* Mobile: Sticky Map at the top 50vh */}
              <div className="sticky top-[68px] z-10 h-[50vh] md:relative md:h-[650px] lg:h-[750px] w-full md:rounded-2xl overflow-hidden shadow-2xl md:shadow-none">
                {loading ? <Skeleton className="h-full" /> : (
                  <LandMap
                    ref={mapRef}
                    latitude={lat}
                    longitude={lng}
                    riskLevel={riskLevel}
                    bhuAadharId={activeCode}
                    ownerName={data?.parcel?.owner_details?.name}
                    targetMouza={data?.delay?.sub_registrar_office || ''}
                    zoom={zoom}
                    onSimulateSearch={handleSimulateSearch}
                  />
                )}
              </div>
              
              {/* Mobile: Draggable Bottom Sheet effect (scrolls naturally below/over map) */}
              <div className="relative z-20 bg-[#070D19]/80 backdrop-blur-xl md:bg-transparent pt-5 pb-6 md:pb-0 md:pt-0 rounded-t-3xl md:rounded-none shadow-[0_-15px_30px_rgba(0,0,0,0.6)] md:shadow-none -mt-6 md:mt-0 px-3 md:px-0 border-t border-slate-700/50 md:border-t-0">
                {/* Mobile drag handle indicator */}
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 md:hidden"></div>
                
                <div className="lg:h-[750px] shrink-0">
                  {loading ? <Skeleton className="h-full" /> : (
                    <RiskWidget riskLevel={riskLevel} riskBreakdown={riskBreak} />
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative z-20 bg-[#070D19]/80 backdrop-blur-xl md:bg-transparent px-3 md:px-0 pb-6 md:pb-0">
              {loading
                ? <Skeleton className="h-52" />
                : <TimelineBar milestones={milestones} estimatedTotalDays={totalDays} sroOffice={sroOffice} congestionFactor={congestion} />
              }
            </div>

            {/* Parcel info + RTI row */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start relative z-20 bg-[#070D19]/80 backdrop-blur-xl md:bg-transparent px-3 md:px-0 pb-24 md:pb-0">
              <div className="flex-1 space-y-4">
                {loading ? <Skeleton className="h-64" /> : <ParcelInfoCard parcel={data?.parcel ?? null} />}
                
                {/* Mobile Google Maps Navigation Button */}
                {data && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-2 transition transform active:scale-95 min-h-[48px] md:hidden"
                  >
                    🚀 Navigate via Google Maps
                  </a>
                )}
              </div>
              {/* Mobile RTI button */}
              {data && (
                <button
                  onClick={() => setRtiOpen(true)}
                  className="sm:hidden bm-btn-outline flex items-center gap-2 text-sm justify-center"
                >
                  📜 Generate RTI
                </button>
              )}
            </div>
          </div>

          {/* Right column – sticky Trust Score */}
          <div className="xl:sticky xl:top-[72px] xl:self-start">
            {loading ? <Skeleton className="h-[540px]" /> : (
              <TrustScoreGauge score={trustScore} riskLevel={riskLevel} xaiWeights={xaiWeights} />
            )}
          </div>
        </div>

        {/* ── Empty State ───────────────────────────────────────────────── */}
        {!data && !loading && !error && (
          <div className="bm-card p-12 text-center animate-fade-in">
            <p className="text-6xl mb-4">🌾</p>
            <h2 className="text-2xl font-black font-display mb-2">Apna Plot Verify Karein</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Enter your 14-digit Bhu-Aadhar ID or click a demo preset.
              Get GIS risk scores, SRO delay predictions, and Explainable AI insights instantly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
              <span>🗺️ Interactive GIS Map</span>
              <span>🛡️ AI Trust Score</span>
              <span>⏳ SRO Delay Predictor</span>
              <span>🎙️ Hinglish Voice Agent</span>
              <span>📜 RTI Generator</span>
            </div>
            <p className="mt-4 text-[11px] text-slate-600">
              Tip: Click the 🎙️ button (bottom-right) to ask by voice!
            </p>
          </div>
        )}
      </main>

      {/* ── Voice Agent FAB ───────────────────────────────────────────────── */}
      <ChatBot
        onMapAction={handleMapAction}
        onDocAction={handleDocAction}
        activePlotCode={activeCode}
        userLang={userLang}
      />

      {/* ── RTI Modal ────────────────────────────────────────────────────── */}
      <RTIModal
        landCode={activeCode}
        isOpen={rtiOpen}
        onClose={() => setRtiOpen(false)}
      />

      {/* ── Language Modal ─────────────────────────────────────────────────── */}
      <LanguageModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
        onSelectLanguage={handleLanguageSelect}
        detectedRegion="West Bengal"
      />
    </div>
  );
}
