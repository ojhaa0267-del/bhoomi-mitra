---
title: "Execution Roadmap: Phase 2 - Core Intelligence & GIS Features"
tags:
  - bhoomi-mitra
  - roadmap
  - phase2
  - gis
  - ml
date: 2026-09-07
---

# 🚀 Execution Roadmap: Phase 2 — Core Intelligence & GIS Features

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Phase Objective
Build out the core business logic, geospatial mapping, and machine learning scoring features:
- Bhu-Aadhar ID plot registry search.
- Leaflet.js interactive GIS viewer with dynamic polygon hazard highlighting.
- Scikit-Learn SRO Delay Predictor model training and inference.
- Rule-based GIS Risk Assessment with Explainable AI (XAI) trust scores.

---

## 2. Work Breakdown Structure (WBS)

### Backend Tasks (`backend/` & `ml_engine/`)
- [ ] Implement `backend/app/services/govt_api_mock.py` simulating DILRMP land data, circle rates, and e-Courts case registries.
- [ ] Implement `backend/app/routes/search.py` (`GET /api/v1/search`).
- [ ] Implement `backend/app/routes/analytics.py` for `/api/v1/predict-delay`, `/api/v1/risk-assessment`, and `/api/v1/distance`.
- [ ] Implement `ml_engine/train_delay_model.py` and serialize `delay_predictor_model.pkl`.
- [ ] Implement `backend/app/services/risk_engine.py` calculating SHAP-like XAI factor contributions.

### Frontend Tasks (`frontend/`)
- [ ] Implement `frontend/src/pages/Dashboard.jsx` multi-panel layout with search bar, metrics grid, and side-by-side analytics.
- [ ] Implement `frontend/src/components/LandMap.jsx` using `react-leaflet` with smooth pan/zoom and dynamic risk color fills.
- [ ] Implement `frontend/src/components/RiskWidget.jsx` and `TrustScoreGauge.jsx` with SVG donut chart and factor list.
- [ ] Implement `frontend/src/components/TimelineBar.jsx` rendering the 4-milestone SRO progress bar.

---

## 3. Verification Criteria
1. Searching `14029857364102` loads land record data and centers the Leaflet map at `(28.6139, 77.2090)`.
2. High-risk plot simulation triggers the crimson border pulse and displays active litigation warnings.
3. Timeline bar accurately calculates milestone durations based on the ML delay prediction payload.

---

## 4. Related Notes
- [[API-Contracts|API Contracts & Payload Schemas]]
- [[Component-LandMap|LandMap GIS Viewer Spec]]
- [[Component-Risk-and-Gauge|Risk Widget & Trust Score Spec]]
- [[Phase-3-Voice-and-Demo|Next: Phase 3 - Voice & Demo]]
