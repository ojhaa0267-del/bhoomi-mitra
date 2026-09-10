---
title: "API Contracts & Endpoint Specifications"
tags:
  - bhoomi-mitra
  - backend
  - api
  - fastapi
  - schemas
date: 2026-09-07
---

# 🔌 API Contracts & Endpoint Specifications

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Overview
The Bhoomi Mitra FastAPI backend exposes RESTful endpoints versioned under `/api/v1`. Protected routes require a Bearer token (`Authorization: Bearer <JWT>`) issued by Firebase Authentication.

---

## 2. Endpoints Detail

### 📍 Endpoint 1: Search Plot Registry
- **Route**: `GET /api/v1/search`
- **Description**: Returns owner details, land area, soil suitability, circle rate vs market asking price, and GPS coordinates for a 14-digit Bhu-Aadhar ID.
- **Query Parameter**:
  - `land_code` (`str`, required, 14 digits): e.g., `"14029857364102"`
- **Response Schema (200 OK)**:
```json
{
  "bhu_aadhar_id": "14029857364102",
  "owner_details": {
    "name": "Rajesh Kumar",
    "email": "rajesh.k@bhoomi-demo.in",
    "mobile": "+91 98765 43210"
  },
  "land_profile": {
    "area_acres": 4.25,
    "land_type": "Agricultural",
    "soil_health": {
      "soil_type": "Alluvial Loam",
      "suitability_crops": ["Paddy", "Wheat", "Sugarcane"],
      "soil_ph": 6.8
    },
    "survey_status": "Completed & Digitized",
    "last_survey_date": "2025-04-12"
  },
  "market_details": {
    "seller_asking_price_inr": 4500000,
    "local_government_circle_rate_inr": 3800000,
    "price_gap_percentage": 18.42
  },
  "coordinates": {
    "latitude": 28.6139,
    "longitude": 77.2090
  }
}
```

---

### 📍 Endpoint 2: Distance & Spatial Overlay
- **Route**: `POST /api/v1/distance`
- **Description**: Computes straight-line distance, driving distance, and boundary contiguity between two parcel IDs.
- **Request Body**:
```json
{
  "origin_land_code": "14029857364102",
  "destination_land_code": "14029857364199"
}
```
- **Response Schema (200 OK)**:
```json
{
  "origin_land_code": "14029857364102",
  "destination_land_code": "14029857364199",
  "spatial_analytics": {
    "straight_line_distance_km": 1.25,
    "driving_distance_km": 1.82,
    "estimated_travel_time_minutes": 4.5,
    "adjacent_plots_share_boundary": false
  }
}
```

---

### 📍 Endpoint 3: Dynamic ML Delay Predictor
- **Route**: `GET /api/v1/predict-delay`
- **Description**: Uses historical Sub-Registrar Office queue telemetry to forecast processing days for all 4 mutation steps.
- **Query Parameter**:
  - `land_code` (`str`, required): 14-digit ID
- **Response Schema (200 OK)**:
```json
{
  "bhu_aadhar_id": "14029857364102",
  "delay_prediction": {
    "estimated_total_days": 12,
    "timeline_milestones": [
      {"step": "Documents Verification", "duration_days": 2, "status": "Completed"},
      {"step": "NOC Approvals (Court/Irrigation)", "duration_days": 3, "status": "In-Progress"},
      {"step": "Sale Deed Registration", "duration_days": 3, "status": "Pending"},
      {"step": "Land Mutation (Dakhil-Kharij)", "duration_days": 4, "status": "Pending"}
    ],
    "sub_registrar_office": "SRO Zone 4, South Delhi",
    "congestion_factor": "Medium"
  }
}
```

---

### 📍 Endpoint 4: AI Risk Assessment & Explainable Trust Score
- **Route**: `GET /api/v1/risk-assessment`
- **Description**: Evaluates pending court litigation, forest buffer zones, national highway acquisitions, and outputs a 0-100% Trust Score with SHAP explanation weights.
- **Query Parameter**:
  - `land_code` (`str`, required): 14-digit ID
- **Response Schema (200 OK)**:
```json
{
  "bhu_aadhar_id": "14029857364102",
  "risk_matrix": {
    "overall_risk_level": "Medium",
    "trust_score_percentage": 82.0,
    "risk_breakdown": {
      "court_litigation": {
        "status": "Clear",
        "pending_disputes": 0,
        "historical_cases": 0
      },
      "infrastructure_overlap_gis": {
        "status": "Warning",
        "description": "5% of boundary overlaps with upcoming National Highway Widening Zone."
      },
      "forest_or_protected_zone": {
        "status": "Clear"
      }
    },
    "explainable_ai_weights": [
      {"factor": "Clear Title Certificate", "weight_contribution": 60.0, "effect": "Positive"},
      {"factor": "No Court Litigation Case", "weight_contribution": 30.0, "effect": "Positive"},
      {"factor": "Infrastructure Widening Buffer Overlap", "weight_contribution": -8.0, "effect": "Negative"}
    ]
  }
}
```

---

## 3. Related Notes
- [[Firebase-Authentication|Firebase Auth & JWT Verification]]
- [[PostGIS-Database-Schema|Database Tables & Spatial Relationships]]
- [[Delay-Prediction-Engine|Machine Learning Delay Model Pipeline]]
