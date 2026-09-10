"""
Bhoomi Mitra – Analytics Routes
  GET  /api/v1/predict-delay?land_code=<id>
  GET  /api/v1/risk-assessment?land_code=<id>
  POST /api/v1/distance
"""
from __future__ import annotations
import os
import math
try:
    import joblib
    import numpy as np
    HAS_ML = True
except ImportError:
    HAS_ML = False
from dataclasses import asdict
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from app.auth import get_current_user
from app.services.govt_api_mock import fetch_land_record, fetch_sro_queue_telemetry, fetch_court_disputes
from app.services.risk_engine import evaluate_risk
from app.config import get_settings

router = APIRouter(prefix="/api/v1", tags=["Analytics"])
settings = get_settings()

# ── Lazy-load ML model ─────────────────────────────────────────────────────
_delay_model = None

def _get_delay_model():
    global _delay_model
    if _delay_model is None and HAS_ML:
        model_path = settings.delay_model_path
        if os.path.exists(model_path):
            _delay_model = joblib.load(model_path)
    return _delay_model


# ── Helpers ────────────────────────────────────────────────────────────────
def _predict_total_days(sro_load: int, dispute: int, price_gap: float, area: float, month: int) -> int:
    """Uses trained Random Forest model or a fallback heuristic."""
    if HAS_ML:
        model = _get_delay_model()
        if model:
            X = np.array([[sro_load, dispute, price_gap, area, month]])
            return max(3, int(round(model.predict(X)[0])))
    
    # Heuristic fallback when model .pkl not yet trained or ML missing
    base = 7
    base += sro_load / 50
    base += dispute * 8
    base += max(0, (price_gap - 1.2) * 4)
    return max(3, min(60, int(round(base))))


def _build_milestones(total_days: int, congestion: str) -> list[dict]:
    """Allocates total days proportionally to the 4 SRO pipeline stages."""
    portions = [0.20, 0.25, 0.25, 0.30]
    stages = [
        ("Documents Verification", "Completed"),
        ("NOC Approvals (Court/Irrigation)", "In-Progress"),
        ("Sale Deed Registration", "Pending"),
        ("Land Mutation (Dakhil-Kharij)", "Pending"),
    ]
    milestones = []
    for (step, status_label), portion in zip(stages, portions):
        milestones.append({
            "step": step,
            "duration_days": max(1, round(total_days * portion)),
            "status": status_label,
        })
    return milestones


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Straight-line distance between two GPS coordinates (Haversine formula)."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return round(R * 2 * math.asin(math.sqrt(a)), 3)


# ── Routes ─────────────────────────────────────────────────────────────────
@router.get("/predict-delay", summary="Predict SRO administrative delay for a parcel")
def predict_delay(
    land_code: str = Query(..., min_length=14, max_length=14),
    _user: dict = Depends(get_current_user),
):
    record = fetch_land_record(land_code)
    if not record:
        raise HTTPException(status_code=404, detail=f"Parcel '{land_code}' not found.")

    telemetry = fetch_sro_queue_telemetry(land_code)
    disputes = fetch_court_disputes(land_code)
    dispute_flag = 1 if disputes else 0
    price_gap_ratio = record["market_details"]["seller_asking_price_inr"] / record["market_details"]["local_government_circle_rate_inr"]
    area = record["land_profile"]["area_acres"]

    total_days = _predict_total_days(
        sro_load=telemetry["pending_queue_count"],
        dispute=dispute_flag,
        price_gap=price_gap_ratio,
        area=area,
        month=telemetry["month_of_year"],
    )

    return {
        "bhu_aadhar_id": land_code,
        "delay_prediction": {
            "estimated_total_days": total_days,
            "timeline_milestones": _build_milestones(total_days, telemetry["congestion_factor"]),
            "sub_registrar_office": telemetry["sro_name"],
            "congestion_factor": telemetry["congestion_factor"],
        },
    }


@router.get("/risk-assessment", summary="AI risk assessment & Explainable Trust Score")
def risk_assessment(
    land_code: str = Query(..., min_length=14, max_length=14),
    _user: dict = Depends(get_current_user),
):
    record = fetch_land_record(land_code)
    if not record:
        raise HTTPException(status_code=404, detail=f"Parcel '{land_code}' not found.")

    disputes = fetch_court_disputes(land_code)
    price_gap_pct = record["market_details"]["price_gap_percentage"]

    result = evaluate_risk(land_code, disputes, price_gap_pct)

    return {
        "bhu_aadhar_id": land_code,
        "risk_matrix": {
            "overall_risk_level": result.overall_risk_level,
            "trust_score_percentage": result.trust_score_percentage,
            "risk_breakdown": asdict(result.risk_breakdown),
            "explainable_ai_weights": [asdict(f) for f in result.explainable_ai_weights],
        },
    }


class DistanceRequest(BaseModel):
    origin_land_code: str
    destination_land_code: str


@router.post("/distance", summary="Compute spatial distance between two parcels")
def compute_distance(
    body: DistanceRequest,
    _user: dict = Depends(get_current_user),
):
    origin = fetch_land_record(body.origin_land_code)
    dest = fetch_land_record(body.destination_land_code)

    if not origin:
        raise HTTPException(status_code=404, detail=f"Origin parcel '{body.origin_land_code}' not found.")
    if not dest:
        raise HTTPException(status_code=404, detail=f"Destination parcel '{body.destination_land_code}' not found.")

    straight_km = _haversine_km(
        origin["coordinates"]["latitude"], origin["coordinates"]["longitude"],
        dest["coordinates"]["latitude"], dest["coordinates"]["longitude"],
    )
    driving_km = round(straight_km * 1.42, 3)   # Approximate road factor
    travel_min = round(driving_km / 30 * 60, 1)  # 30 km/h avg urban speed

    return {
        "origin_land_code": body.origin_land_code,
        "destination_land_code": body.destination_land_code,
        "spatial_analytics": {
            "straight_line_distance_km": straight_km,
            "driving_distance_km": driving_km,
            "estimated_travel_time_minutes": travel_min,
            "adjacent_plots_share_boundary": straight_km < 0.05,
        },
    }
