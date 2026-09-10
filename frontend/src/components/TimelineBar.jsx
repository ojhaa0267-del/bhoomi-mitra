/**
 * TimelineBar.jsx – SRO Administrative Delay Pipeline Tracker
 *
 * Visualises the 4-stage mutation lifecycle:
 *   Documents Verification → NOC Approvals → Sale Deed Registration → Land Mutation
 *
 * Features:
 *  - Horizontal step-tracker on desktop, vertical on mobile
 *  - Emerald (Completed) → Amber pulse (In-Progress) → Slate (Pending)
 *  - Animated connecting rail that fills to the current step
 *  - Duration badge per step
 *  - SRO office name + total days summary header
 */
import React from 'react';

const STEP_ICONS = ['📄', '📋', '✍️', '🏛️'];

function stepStyle(status) {
  switch (status) {
    case 'Completed':
      return {
        circle: 'bg-emerald-500 border-emerald-400 text-white shadow-glow-emerald',
        label:  'text-emerald-400',
        badge:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      };
    case 'In-Progress':
      return {
        circle: 'bg-amber-500 border-amber-400 text-black animate-pulse shadow-glow-amber',
        label:  'text-amber-400',
        badge:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
      };
    default: // Pending
      return {
        circle: 'bg-background-subtle border-blue-900/60 text-slate-500',
        label:  'text-slate-500',
        badge:  'bg-background-subtle text-slate-500 border-blue-900/30',
      };
  }
}

function completedCount(milestones) {
  return milestones.filter(m => m.status === 'Completed').length;
}

export default function TimelineBar({ milestones = [], estimatedTotalDays = 0, sroOffice = '', congestionFactor = 'Medium' }) {
  const done  = completedCount(milestones);
  const total = milestones.length || 4;
  const railPct = total > 1 ? (done / (total - 1)) * 100 : 0;

  const congestionColor = {
    High:   'text-red-400 bg-red-500/10 border-red-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  }[congestionFactor] || 'text-slate-400 bg-background-subtle border-blue-900/20';

  return (
    <div className="bm-card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h3 className="bm-section-heading">Administrative Processing Pipeline</h3>
          {sroOffice && (
            <p className="text-xs text-slate-400 mt-1">
              📍 {sroOffice}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {estimatedTotalDays > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-slate-500">Est. Turnaround</p>
              <p className="text-xl font-black text-white tabular-nums">
                {estimatedTotalDays}
                <span className="text-sm font-medium text-slate-400 ml-1">days</span>
              </p>
            </div>
          )}
          {congestionFactor && (
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${congestionColor}`}>
              {congestionFactor} Load
            </span>
          )}
        </div>
      </div>

      {/* Stepper */}
      {milestones.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-slate-600 text-xs">
          Search a parcel to load the delay pipeline
        </div>
      ) : (
        <div className="relative">
          {/* Connecting rail (desktop) */}
          <div className="hidden md:block absolute top-5 left-5 right-5 h-0.5 bg-blue-900/40 z-0">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${railPct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-3 relative z-10">
            {milestones.map((m, idx) => {
              const s = stepStyle(m.status);
              return (
                <div key={idx} className="flex flex-col items-center text-center gap-2">
                  {/* Step circle */}
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-base font-bold transition-all duration-500 ${s.circle}`}>
                    {m.status === 'Completed' ? '✓' : STEP_ICONS[idx] ?? idx + 1}
                  </div>

                  {/* Step info */}
                  <div className="space-y-1 max-w-[120px]">
                    <p className={`text-xs font-semibold leading-tight ${s.label}`}>
                      {m.step}
                    </p>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded border ${s.badge}`}>
                      {m.status}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {m.duration_days} day{m.duration_days !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress bar summary */}
      {milestones.length > 0 && (
        <div className="mt-6 pt-4 border-t border-blue-900/20">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
            <span>Progress: {done}/{total} stages complete</span>
            <span>{Math.round(railPct)}%</span>
          </div>
          <div className="h-1.5 bg-background-subtle rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-slate-600 transition-all duration-1000"
              style={{ width: `${railPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
