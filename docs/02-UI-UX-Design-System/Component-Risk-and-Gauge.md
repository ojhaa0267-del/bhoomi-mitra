---
title: "Component Spec: RiskWidget & TrustScoreGauge (Explainable AI)"
tags:
  - bhoomi-mitra
  - ui-ux
  - xai
  - charts
  - components
date: 2026-09-07
---

# 🛡️ Component Spec: RiskWidget.jsx & TrustScoreGauge.jsx

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Overview & Psychological Purpose
Citizens evaluating land deals are frequently paralyzed by the fear of hidden litigation or government acquisition. 
The **TrustScoreGauge** and **RiskWidget** implement Explainable AI (XAI) principles:
- Never show a "black box" score without immediately showing **why**.
- Use color and animated geometry to communicate safety instantly.
- Dissect the total score into positive factors (Verified survey, zero disputes) and negative deductions (Highway buffer encroachment, court stay orders).

---

## 2. TrustScoreGauge Visual Design
- **Format**: Circular SVG Donut Gauge (0% to 100%).
- **Color Thresholds**:
  - `80% - 100%`: **High Trust / Safe** (Emerald `#10B981`)
  - `50% - 79%`: **Moderate Trust / Due Diligence Needed** (Amber `#F59E0B`)
  - `< 50%`: **High Risk / Potential Dispute** (Crimson `#EF4444`)
- **Center Label**: Displays numerical score with an animated counter and confidence badge (*e.g., "82% - Verified Clear"*).

---

## 3. Explainable AI (XAI) SHAP Weight Breakdown Card
Directly beneath or adjacent to the gauge, render a breakdown list of the top positive and negative contributing factors:

```text
[ +60.0% ] 🟢 Clean Title Certificate & Digitized Survey
[ +30.0% ] 🟢 Zero Pending Civil Court Disputes
[ -8.0%  ] 🔴 Infrastructure Widening Buffer Overlap (5% Parcel Area)
-------------------------------------------------------------
NET TRUST SCORE: 82.0% (Medium-High Safety)
```

---

## 4. Reference Implementation (`TrustScoreGauge.jsx`)

```javascript
import React from 'react';

export default function TrustScoreGauge({ score = 82, riskLevel = 'Low', xaiWeights = [] }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const strokeColor = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="bg-background-card p-6 rounded-2xl border border-blue-900/30 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
        <span>Explainable Trust Score</span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
          score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 
          score >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {riskLevel} Risk
        </span>
      </h3>

      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80" cy="80" r={radius}
              stroke="#1F2937" strokeWidth="14" fill="transparent"
            />
            <circle
              cx="80" cy="80" r={radius}
              stroke={strokeColor} strokeWidth="14" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-3xl font-extrabold text-white">{score}%</span>
            <span className="block text-xs text-gray-400">Confidence</span>
          </div>
        </div>
      </div>

      {/* XAI Factors Breakdown */}
      <div className="mt-6 space-y-2">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400">Key Contributing Factors</h4>
        {xaiWeights.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background-subtle text-xs">
            <span className="text-gray-200">{item.factor}</span>
            <span className={`font-mono font-bold ${item.effect === 'Positive' ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.weight_contribution > 0 ? `+${item.weight_contribution}%` : `${item.weight_contribution}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Related Notes
- [[GIS-Risk-Assessment|GIS Risk Assessment & Decision Logic]]
- [[API-Contracts|API Endpoint for /api/v1/risk-assessment]]
- [[Design-Tokens-and-Theme|Color Palette & Token Definitions]]
