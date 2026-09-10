---
title: "System Architecture: Bhoomi Mitra Full Stack Topology"
tags:
  - bhoomi-mitra
  - architecture
  - stack
  - fastapi
  - react
date: 2026-09-07
---

# 🏗️ System Architecture & Full Stack Topology

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Client ["Frontend Layer (Next.js / React + Tailwind CSS)"]
        UI_Dash[Dashboard Page]
        UI_Map[LandMap.jsx - Leaflet]
        UI_Risk[RiskWidget & TrustScoreGauge]
        UI_Time[TimelineBar - SRO Tracker]
        UI_Chat[ChatBot.jsx - Voice Widget]
        UI_Auth[Login.jsx - Firebase SDK]
    end

    subgraph Auth ["Authentication Layer"]
        FB_Auth[Firebase Authentication Service]
    end

    subgraph Backend ["FastAPI Python Backend (app/)"]
        API_Main[main.py - CORS & Entrypoint]
        MW_Auth[auth.py - Firebase Admin JWT Verifier]
        R_Search[routes/search.py]
        R_Analytics[routes/analytics.py]
        R_Chat[routes/chat.py]
    end

    subgraph Engine ["Intelligence & Spatial Services (services/)"]
        S_Govt[govt_api_mock.py - DILRMP / e-Courts]
        S_Risk[risk_engine.py - GIS Safety Evaluator]
        S_LLM[chatbot_llm.py - Voice Agent Prompt Router]
        ML_Delay[delay_predictor_model.pkl - Random Forest]
    end

    subgraph Storage ["Data & Storage Layer"]
        DB[(PostgreSQL + PostGIS)]
    end

    %% Connections
    UI_Auth -->|1. Sign in / Get Token| FB_Auth
    FB_Auth -->|2. Return JWT ID Token| UI_Auth
    UI_Dash -->|3. Bearer JWT API Request| API_Main
    API_Main --> MW_Auth
    MW_Auth -->|Verify Token| FB_Auth
    API_Main --> R_Search & R_Analytics & R_Chat
    R_Search --> S_Govt & DB
    R_Analytics --> S_Risk & ML_Delay
    R_Chat --> S_LLM
```

---

## 2. Directory Layout
```text
bhoomi-mitra-portal/
├── backend/                       # Python FastAPI Backend Services
│   ├── app/
│   │   ├── main.py                # Core App Entrypoint & Router
│   │   ├── config.py              # Environment variables & DB settings
│   │   ├── auth.py                # Firebase JWT middleware
│   │   ├── routes/                # Search, Analytics, Chat routes
│   │   ├── services/              # DILRMP mock, risk engine, LLM wrapper
│   │   └── database.py            # PostgreSQL + PostGIS connection
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                      # React / Next.js Web Frontend
│   ├── public/                    # Assets, audio cues, land icons
│   ├── src/
│   │   ├── components/            # LandMap, RiskWidget, TimelineBar, ChatBot
│   │   ├── pages/                 # Login, Dashboard
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── ml_engine/                     # ML Pipelines
    ├── delay_predictor_model.pkl  # Trained delay model
    └── train_delay_model.py       # Scikit-Learn training script
```

---

## 3. Technology Stack Rationale
- **Frontend (React / Next.js + Tailwind CSS)**: Enables rapid prototyping of responsive, dark-mode, high-contrast interfaces with hardware-accelerated animations.
- **GIS Mapping (Leaflet.js / OpenStreetMap)**: Lightweight, zero-cost, open-source tile rendering supporting custom geo-json polygons, dynamic color fills, and coordinate bounding.
- **Backend (FastAPI Python 3.10+)**: Async native, auto-generates OpenAPI docs, seamlessly interfaces with Scikit-Learn `.pkl` models and GIS libraries (`shapely`, `geopandas`).
- **Database (PostgreSQL 15+ with PostGIS 3.3+)**: Industry standard for storing multi-polygon cadastral maps, calculating spatial intersections, and geospatial indexing (`GIST`).
- **Auth (Firebase Authentication)**: Managed security, encrypted session management, phone OTP / email logins, zero credential leak risk.

---

## 4. Related Notes
- [[Design-Tokens-and-Theme|UI/UX Design Tokens & Colors]]
- [[API-Contracts|API Endpoints & JSON Schemas]]
- [[Delay-Prediction-Engine|ML Delay Predictor Logic]]
