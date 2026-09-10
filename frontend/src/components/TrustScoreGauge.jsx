/**
 * TrustScoreGauge.jsx – Explainable AI (XAI) Trust Score Visualisation
 *
 * Features:
 *  - Animated SVG circular donut gauge (0–100%)
 *  - Colour-shifts: Emerald ≥80%, Amber 50–79%, Crimson <50%
 *  - Tick marks around the ring at 20% intervals
 *  - Count-up animation on first render
 *  - Waterfall XAI factor breakdown (positive / negative SHAP weights)
 *  - Risk level badge with contextual icon
 */
import React, { useEffect, useRef, useState } from 'react';

// ── Colour thresholds ─────────────────────────────────────────────────────
function getScoreColor(score) {
  if (score >= 80) return { stroke: '#10B981', text: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' };
  if (score >= 50) return { stroke: '#F59E0B', text: 'text-amber-400',   bg: 'bg-amber-500/15 border-amber-500/25 text-amber-400' };
  return            { stroke: '#EF4444', text: 'text-red-400',     bg: 'bg-red-500/15 border-red-500/25 text-red-400' };
}

function riskIcon(level) {
  if (level === 'High')   return '🔴';
  if (level === 'Medium') return '🟡';
  return '🟢';
}

// ── Animated count-up hook ────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const frame = useRef(null);
  useEffect(() => {
    let start = null;
    const from = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return val;
}

export default function TrustScoreGauge({ score = 0, riskLevel = 'Low', xaiWeights = [] }) {
  const displayScore = useCountUp(score);
  const colors = getScoreColor(score);

  // SVG donut geometry
  const R = 68;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * R;
  const arcLength = circumference * (displayScore / 100);

  return (
    <div className={`bm-card p-6 flex flex-col h-full ${
      score >= 80 ? 'shadow-glow-emerald border-emerald-500/40' :
      score >= 50 ? 'shadow-glow-amber border-amber-500/40' :
      'shadow-glow-crimson border-red-500/40'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="bm-section-heading">Explainable Trust Score</h3>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colors.bg}`}>
          {riskIcon(riskLevel)} {riskLevel} Risk
        </span>
      </div>

      {/* Donut + centre label */}
      <div className="flex items-center justify-center mb-5">
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Track ring */}
            <circle
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke="#1E3A5F"
              strokeWidth="14"
            />
            {/* Score arc */}
            <circle
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference - arcLength}`}
              strokeDashoffset={circumference / 4}   /* start at top */
              style={{ transition: 'stroke-dasharray 0.05s linear' }}
            />
            {/* Tick marks at 20% intervals */}
            {[0, 20, 40, 60, 80].map((pct) => {
              const angle = (pct / 100) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const x1 = cx + (R - 9) * Math.cos(rad);
              const y1 = cy + (R - 9) * Math.sin(rad);
              const x2 = cx + (R + 2) * Math.cos(rad);
              const y2 = cy + (R + 2) * Math.sin(rad);
              return (
                <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#1E3A5F" strokeWidth="2" />
              );
            })}
          </svg>

          {/* Centre text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black tabular-nums ${colors.text}`}>
              {displayScore}
            </span>
            <span className="text-slate-400 text-[11px] font-medium tracking-wide">
              / 100
            </span>
            <span className="text-slate-500 text-[10px] mt-0.5">Confidence</span>
          </div>
        </div>
      </div>

      {/* XAI Factor Breakdown */}
      <div className="flex-1 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
          Key Contributing Factors
        </p>
        {xaiWeights.length === 0 && (
          <p className="text-slate-600 text-xs text-center py-4">
            Search a parcel to see risk factors
          </p>
        )}
        {xaiWeights.map((item, idx) => {
          const isPos = item.effect === 'Positive';
          const barPct = Math.min(Math.abs(item.weight_contribution), 60);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 truncate pr-2 flex-1">{item.factor}</span>
                <span className={`font-mono font-bold flex-shrink-0 ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPos ? '+' : ''}{item.weight_contribution.toFixed(1)}%
                </span>
              </div>
              {/* Mini bar */}
              <div className="h-1 bg-background-subtle rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isPos ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${barPct * 1.66}%`, transitionDelay: `${idx * 80}ms` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
