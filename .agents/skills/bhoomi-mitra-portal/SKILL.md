---
name: bhoomi-mitra-portal
description: Official architectural standards, UI/UX design tokens, API specifications, ML delay prediction pipelines, and multilingual Hinglish voice agent guidelines for the Bhoomi Mitra / Pratyaksh AI citizen land portal.
---

# 🌾 Bhoomi Mitra / Pratyaksh AI Development Skill

This skill governs the development, extension, and maintenance of the **Bhoomi Mitra (Pratyaksh AI)** Citizen Land Portal. Every agent working in this workspace must adhere to the design tokens, API contracts, ML pipelines, and accessibility rules specified below.

---

## 🎨 UI/UX Design System Standards

### 1. Color Palette (Cyber-Civic Dark Mode)
- **`background.deep`**: `#070F1E` (Global canvas)
- **`background.card`**: `#111E36` (Container panels, chat, search bar)
- **`background.subtle`**: `#0F1A30` (Nested inputs, table alternating rows)
- **`accent.emerald`**: `#10B981` (Safe / Clear Title / Verified Survey)
- **`accent.amber`**: `#F59E0B` (Caution / Pending NOC / Circle rate price gap)
- **`accent.crimson`**: `#EF4444` (High Risk / Court Dispute / Forest Buffer Encroachment)
- **`accent.blue`**: `#3B82F6` (Primary CTAs / Bhu-Aadhar verified badge / Mic glow)

### 2. Mandatory Component Conventions
- **`LandMap.jsx`**: Leaflet.js map. High-risk plots must feature a red border and pulse animation (`animate-pulse-slow border-accent-crimson`). Must expose a `MapController` that accepts dynamic center/zoom updates triggered by the voice agent.
- **`TrustScoreGauge.jsx`**: SVG circular donut chart displaying 0-100% confidence with color matching the risk tier (Emerald $\ge$ 80%, Amber 50-79%, Crimson < 50%). Must always display the Explainable AI (XAI) SHAP weight breakdown card.
- **`TimelineBar.jsx`**: Visualizes the 4 administrative milestones (Verification $\rightarrow$ NOC $\rightarrow$ Registration $\rightarrow$ Mutation) with status badges and estimated turnaround days.
- **`ChatBot.jsx`**: Always-accessible floating microphone widget (`shadow-[0_0_15px_rgba(59,130,246,0.5)]`). Must intercept `[MAP_ACTION: {...}]` tags to pan/zoom maps without showing raw tags to the user.

---

## ⚡ Backend API Contracts (`FastAPI`)

All routes must be prefixed with `/api/v1` and validate Firebase ID tokens:
- `GET /api/v1/search?land_code=<14_digits>`: Returns ownership, soil suitability, market vs circle rate, and GPS lat/long.
- `POST /api/v1/distance`: Computes straight-line & driving distance between two Bhu-Aadhar codes.
- `GET /api/v1/predict-delay?land_code=<14_digits>`: Outputs turnaround prediction using the trained Random Forest model.
- `GET /api/v1/risk-assessment?land_code=<14_digits>`: Evaluates court cases, forest buffers, and highway overlaps to generate the Explainable Trust Score.

---

## 🧠 ML & Voice Agent Rules

### 1. Delay Prediction Engine
- Handled by `ml_engine/delay_predictor_model.pkl` (Random Forest Regressor).
- Key telemetry inputs: SRO pending queue count, dispute flag, price-gap ratio, tract area, month of year.

### 2. Hinglish Voice LLM Guidelines
- Assistant Name: **Bhoomi Mitra AI**.
- Tone: Warm, patient, accessible, bilingual (conversational Hinglish or clear English).
- Translates legal jargon automatically (*"Dakhil-Kharij"* = Mutation, *"Litigation"* = Court Case).
- Embeds function calling action tags:
  - `[MAP_ACTION: {"lat": <lat>, "lng": <lng>, "zoom": 16}]`
  - `[CALCULATE_ACTION: {"plots": [...]}]`
  - `[DOC_ACTION: {"type": "RTI_Draft", "land_code": "..."}]`

---

## 📁 Knowledge Base Reference
For full Obsidian documentation and schemas, consult:
- `00-Bhoomi-Mitra-MOC.md`: Master Map of Content
- `docs/01-Project-Overview/`
- `docs/02-UI-UX-Design-System/`
- `docs/03-Backend-and-APIs/`
- `docs/04-AI-and-ML-Engines/`
- `docs/05-Execution-Roadmap/`
