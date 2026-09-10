# 🌾 Bhoomi Mitra — Pratyaksh AI Citizen Land Portal

> **AI-powered land parcel verification, GIS risk scoring, SRO delay prediction, and Hinglish voice agent for Indian citizens.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React+Vite-61DAFB?style=flat-square)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-38BDF8?style=flat-square)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet.js-199900?style=flat-square)](https://leafletjs.com/)
[![ML](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=flat-square)](https://scikit-learn.org/)

---

## 🚀 Quick Start (Demo Mode — No Keys Required)

```bash
# 1. Install backend
cd h_project/backend
pip install -r requirements.txt

# 2. Train the delay predictor (one-time, ~30 sec)
cd ..
python ml_engine/train_delay_model.py

# 3. Start backend (demo mode, no Firebase/DB needed)
cd backend
uvicorn app.main:app --reload --port 8000
# → Interactive API docs: http://localhost:8000/docs

# 4. Install and start frontend
cd ../frontend
npm install
npm run dev
# → App: http://localhost:5173
# → Click "Try Demo" on the landing page
```

---

## 🏗️ Architecture

```
h_project/
├── backend/                  FastAPI application
│   ├── app/
│   │   ├── main.py           Entrypoint, CORS, router mounting
│   │   ├── config.py         Pydantic-settings from .env
│   │   ├── auth.py           Firebase JWT + demo bypass
│   │   ├── database.py       PostgreSQL/PostGIS (optional)
│   │   ├── routes/
│   │   │   ├── search.py     GET  /api/v1/search
│   │   │   ├── analytics.py  GET  /api/v1/predict-delay
│   │   │   │                 GET  /api/v1/risk-assessment
│   │   │   │                 POST /api/v1/distance
│   │   │   ├── chat.py       POST /api/v1/chat
│   │   │   └── documents.py  POST /api/v1/documents/rti-draft
│   │   │                     POST /api/v1/documents/sale-checklist
│   │   └── services/
│   │       ├── govt_api_mock.py  DILRMP mock — 3 demo parcels
│   │       ├── risk_engine.py    GIS risk scoring + XAI weights
│   │       └── chatbot_llm.py    Groq → Ollama → demo fallback
│   ├── .env                  ← Copy from .env.example
│   └── Dockerfile
│
├── frontend/                 Vite + React + Tailwind
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx   Public hero page
│       │   ├── Login.jsx     Firebase auth + demo bypass
│       │   └── Dashboard.jsx Full analytics shell
│       ├── components/
│       │   ├── LandMap.jsx           Leaflet GIS viewer
│       │   ├── TrustScoreGauge.jsx   SVG donut XAI gauge
│       │   ├── RiskWidget.jsx        Safety assessment flags
│       │   ├── TimelineBar.jsx       SRO pipeline tracker
│       │   ├── ParcelInfoCard.jsx    Owner + soil + price
│       │   ├── ChatBot.jsx           Voice agent FAB
│       │   ├── RTIModal.jsx          RTI document generator
│       │   └── NotificationToast.jsx Alert toast stack
│       ├── context/AuthContext.jsx   Firebase auth + demo token
│       └── utils/api.js              Authenticated API client
│
└── ml_engine/
    └── train_delay_model.py  Random Forest delay predictor
```

---

## 🎯 Demo Parcels

| Preset | Bhu-Aadhar ID | Risk | Scenario |
|:---|:---|:---|:---|
| ✅ Safe | `14029857364199` | Low (92%) | Verified residential plot, clear title |
| ⚠️ Caution | `14029857364102` | Medium (87%) | Agricultural plot, 5% NH widening overlap |
| 🔴 High Risk | `14029857364200` | High (38%) | Active court case + 15% forest buffer |

---

## 🎙️ Voice Agent Commands (Hinglish)

Speak any of these after clicking the 🎙️ FAB:

| Say | Action |
|:---|:---|
| *"Map mein dikhao"* | Flies map to the current parcel |
| *"Mutation mein kitna time lagega?"* | Explains SRO delay |
| *"Koi court case toh nahi?"* | Reads out litigation status |
| *"RTI draft banao"* | Opens RTI generator modal |
| *"Is plot ka trust score batao"* | Explains the XAI trust score |

---

## 🔑 Environment Variables

| Variable | Default | Description |
|:---|:---|:---|
| `DEMO_BYPASS_AUTH` | `true` | Skip Firebase validation (demo mode) |
| `FIREBASE_CREDENTIALS_PATH` | — | Firebase Admin SDK JSON path |
| `POSTGRES_URI` | — | PostgreSQL connection string |
| `GEMINI_API_KEY` | — | Gemini LLM API key |
| `DELAY_MODEL_PATH` | `../ml_engine/delay_predictor_model.pkl` | Trained RF model |

---

## 🧱 Tech Stack

| Layer | Technology |
|:---|:---|
| Backend API | FastAPI + Uvicorn |
| Authentication | Firebase Admin SDK (JWT verification) |
| Database | PostgreSQL + PostGIS (optional in demo mode) |
| ML Model | Scikit-Learn RandomForestRegressor |
| LLM | Google Gemini / Demo static |
| Frontend | React 18 + Vite 5 |
| UI Styling | Tailwind CSS v3 |
| GIS Maps | Leaflet.js + React-Leaflet |
| Voice STT | Web Speech API (browser native) |
| Voice TTS | edge-tts (Python Backend) |
| Routing | React Router v6 |
| Auth | Firebase Web SDK v10 |

---

## 📄 License

MIT — Built for civic technology research and hackathon demonstration.
