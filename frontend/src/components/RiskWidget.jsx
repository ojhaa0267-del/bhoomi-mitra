/**
 * RiskWidget.jsx – Compact Risk Status Hero Card
 *
 * A punchline summary card displayed above the map that shows:
 *  - Sonar-pulse risk level badge (High / Medium / Low)
 *  - Top-3 risk flags (litigation, GIS overlap, forest)
 *  - Animated entrance
 */
import React from 'react';

const RISK_CONFIG = {
  High: {
    label:      'High Risk',
    icon:       '⚠️',
    bgGradient: 'from-red-950/80 to-transparent',
    border:     'border-red-500/50',
    badge:      'bg-red-500/20 text-red-400 border-red-500/40',
    sonar:      'bg-red-500',
    pulse:      true,
  },
  Medium: {
    label:      'Medium Risk',
    icon:       '🔔',
    bgGradient: 'from-amber-950/70 to-transparent',
    border:     'border-amber-500/40',
    badge:      'bg-amber-500/20 text-amber-400 border-amber-500/40',
    sonar:      'bg-amber-500',
    pulse:      false,
  },
  Low: {
    label:      'Low Risk — Verified',
    icon:       '✅',
    bgGradient: 'from-emerald-950/60 to-transparent',
    border:     'border-emerald-500/40',
    badge:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    sonar:      'bg-emerald-500',
    pulse:      false,
  },
};

function StatusFlag({ status, label, description }) {
  const isWarn = status === 'Warning';
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${
      isWarn
        ? 'bg-red-500/8 border-red-500/20'
        : 'bg-emerald-500/8 border-emerald-500/20'
    }`}>
      <span className="text-base flex-shrink-0 mt-0.5">{isWarn ? '🔴' : '🟢'}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-200">{label}</p>
        {description && (
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <span className={`ml-auto flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${
        isWarn
          ? 'bg-red-500/20 border-red-500/30 text-red-400'
          : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
      }`}>
        {status}
      </span>
    </div>
  );
}

export default function RiskWidget({ riskLevel = 'Low', riskBreakdown = null }) {
  const cfg = RISK_CONFIG[riskLevel] ?? RISK_CONFIG.Low;

  return (
    <div className={`bm-card bg-gradient-to-br ${cfg.bgGradient} border ${cfg.border} p-5 animate-slide-up`}>
      {/* Header Row */}
      <div className="flex items-center gap-3 mb-4">
        {/* Sonar badge */}
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-full ${cfg.sonar} flex items-center justify-center text-white font-black text-sm`}>
            {cfg.icon}
          </div>
          {cfg.pulse && (
            <div className={`absolute inset-0 rounded-full ${cfg.sonar} animate-sonar opacity-70`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="bm-section-heading truncate">Safety Assessment</h3>
          <p className="text-xs text-slate-400 mt-0.5">GIS & Legal Risk Analysis</p>
        </div>

        <span className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {/* Risk flags */}
      {riskBreakdown ? (
        <div className="space-y-2">
          {riskBreakdown.court_litigation && (
            <StatusFlag
              status={riskBreakdown.court_litigation.status}
              label="Court Litigation"
              description={riskBreakdown.court_litigation.description}
            />
          )}
          {riskBreakdown.infrastructure_overlap_gis && (
            <StatusFlag
              status={riskBreakdown.infrastructure_overlap_gis.status}
              label="Infrastructure / GIS Overlap"
              description={riskBreakdown.infrastructure_overlap_gis.description}
            />
          )}
          {riskBreakdown.forest_or_protected_zone && (
            <StatusFlag
              status={riskBreakdown.forest_or_protected_zone.status}
              label="Forest / Protected Zone"
              description={riskBreakdown.forest_or_protected_zone.description}
            />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-20 text-slate-600 text-xs">
          Search a parcel to load risk flags
        </div>
      )}
    </div>
  );
}
