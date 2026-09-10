---
title: "Component Spec: TimelineBar (Administrative Delay Progress)"
tags:
  - bhoomi-mitra
  - ui-ux
  - timeline
  - sro
  - components
date: 2026-09-07
---

# ⏳ Component Spec: TimelineBar.jsx

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Component Overview
The `TimelineBar.jsx` component visualizes the 4-stage administrative land mutation and registration lifecycle. Instead of a static "Under Process" status, it computes the estimated days required for each milestone using the backend ML Delay Predictor.

---

## 2. Milestone Pipeline Stages
1. **Stage 1: Documents Verification**: Revenue records, identity, power of attorney.
2. **Stage 2: NOC Approvals**: Forest, irrigation, urban planning clearance.
3. **Stage 3: Sale Deed Registration**: Sub-Registrar Office biometric execution.
4. **Stage 4: Land Mutation (*Dakhil-Kharij*)**: Revenue registry ownership transfer.

---

## 3. Visual States & Color Progression
- **Completed**: Filled Emerald Circle (`bg-emerald-500`) + Checkmark icon.
- **In-Progress**: Animated Amber Pulse (`bg-amber-500 animate-pulse`) + Current processing badge.
- **Pending**: Slate Gray Circle (`bg-slate-700 border border-slate-600`) + Projected duration in days.
- **Connecting Bar**: Linear gradient transitioning from emerald to current state color.

---

## 4. Reference Implementation Snippet

```javascript
import React from 'react';

export default function TimelineBar({ milestones = [], estimatedTotalDays = 12, sroOffice = 'SRO Zone 4' }) {
  return (
    <div className="bg-background-card p-6 rounded-2xl border border-blue-900/30 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-blue-900/20 mb-6 gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Administrative Processing Pipeline</h3>
          <p className="text-xs text-gray-400">Target Office: <span className="text-blue-400 font-medium">{sroOffice}</span></p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg text-right">
          <span className="text-xs text-gray-300">Est. Total Turnaround: </span>
          <strong className="text-emerald-400 text-sm">{estimatedTotalDays} Working Days</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {milestones.map((m, idx) => {
          const isDone = m.status === 'Completed';
          const isCurrent = m.status === 'In-Progress';
          
          return (
            <div key={idx} className="relative flex flex-col p-3 rounded-xl bg-background-subtle border border-blue-900/20">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDone ? 'bg-emerald-500 text-white' : 
                  isCurrent ? 'bg-amber-500 text-black animate-pulse' : 'bg-slate-700 text-gray-300'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  isDone ? 'text-emerald-400 bg-emerald-500/10' :
                  isCurrent ? 'text-amber-400 bg-amber-500/10' : 'text-gray-400 bg-slate-800'
                }`}>
                  {m.status}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-100 line-clamp-1">{m.step}</p>
              <span className="text-xs text-gray-400 mt-2">Duration: <strong>{m.duration_days} days</strong></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 5. Related Notes
- [[Delay-Prediction-Engine|Random Forest Delay Predictor Engine]]
- [[API-Contracts|API Endpoint for /api/v1/predict-delay]]
- [[Citizen-UX-Guidelines|Citizen UX Accessibility Guidelines]]
