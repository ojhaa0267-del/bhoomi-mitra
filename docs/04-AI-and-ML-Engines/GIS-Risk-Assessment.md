---
title: "AI Engine: Rule-Based GIS Safety & Explainable Risk Scoring"
tags:
  - bhoomi-mitra
  - gis
  - xai
  - risk-engine
  - shap
date: 2026-09-07
---

# 🛰️ AI Engine: Rule-Based GIS Safety & Explainable Risk Scoring

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Engine Purpose
The **GIS Risk Engine** (`backend/app/services/risk_engine.py`) provides citizens with a mathematically grounded, explainable safety evaluation for any parcel. It protects citizens against:
1. Purchasing land subjected to stay orders or active boundary litigation.
2. Acquiring plots encroaching into planned National Highway expansion buffers or railway corridors.
3. Violations of eco-sensitive forest preservation acts.

---

## 2. Risk Calculation Algorithm

```text
Base Score = 100.0%

Deductions:
- Active Court Litigation / Stay Order:           - 40.0%
- Forest / Environmental Buffer Overlap (> 10%):  - 30.0%
- Highway / Infrastructure Buffer Overlap:        - (Overlap % * 1.5)%
- Circle Rate Price Gap > 30% (Under-valuation):  - 12.0%
- Historical Land Disputes (Disposed):            - 8.0%

Additions (Reassurance weights):
- Digitized DILRMP Survey Completed:             + 20.0% (Confidence boost)
- Single Ownership (No fragmented claimants):    + 10.0%

Final Trust Score = Clamp(Calculated Score, 0.0, 100.0)
```

---

## 3. Risk Level Categorization Matrix

| Final Trust Score | Overall Risk Level | Frontend Color Badge | Warning Notification |
| :--- | :--- | :--- | :--- |
| **80% - 100%** | `Low Risk` | Emerald (`#10B981`) | Verified Clean Parcel |
| **50% - 79%** | `Medium Risk` | Amber (`#F59E0B`) | Attention: Minor buffer overlap or price discrepancy |
| **< 50%** | `High Risk` | Crimson (`#EF4444`) | Critical Alert: Active litigation or major encroachment |

---

## 4. Explainable AI (XAI) SHAP Weights Transformation
To ensure complete transparency, the backend transforms the rule evaluations into an array of explainability objects:

```json
[
  { "factor": "Verified Land Records", "weight_contribution": 60.0, "effect": "Positive" },
  { "factor": "Active Court Disputes", "weight_contribution": -40.0, "effect": "Negative" },
  { "factor": "Forest Zone Encroachment", "weight_contribution": -18.0, "effect": "Negative" }
]
```

These weights directly populate the **TrustScoreGauge** waterfall breakdown in the frontend.

---

## 5. Related Notes
- [[Component-Risk-and-Gauge|TrustScoreGauge & RiskWidget UI]]
- [[PostGIS-Database-Schema|Spatial Intersection Queries in PostGIS]]
- [[Component-LandMap|LandMap Danger Polygon Highlighting]]
