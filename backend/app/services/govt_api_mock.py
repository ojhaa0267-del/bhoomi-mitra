"""
Bhoomi Mitra – Government API Mock Service
Simulates DILRMP (Digital India Land Records Modernisation Programme),
Bhoomi Rashi, and e-Courts data in the absence of live API access.

Replace each function body with a real HTTP client call when production
credentials are available.
"""
from __future__ import annotations
import random
from typing import Optional


# ── Static mock dataset ────────────────────────────────────────────────────
_PARCELS: dict[str, dict] = {
    "14029857364102": {
        "bhu_aadhar_id": "14029857364102",
        "owner_details": {
            "name": "Rajesh Kumar",
            "email": "rajesh.k@bhoomi-demo.in",
            "mobile": "+91 98765 43210",
        },
        "land_profile": {
            "area_acres": 4.25,
            "land_type": "Agricultural",
            "soil_health": {
                "soil_type": "Alluvial Loam",
                "suitability_crops": ["Paddy", "Wheat", "Sugarcane"],
                "soil_ph": 6.8,
            },
            "survey_status": "Completed & Digitized",
            "last_survey_date": "2025-04-12",
        },
        "market_details": {
            "seller_asking_price_inr": 4_500_000,
            "local_government_circle_rate_inr": 3_800_000,
            "price_gap_percentage": 18.42,
        },
        "coordinates": {"latitude": 28.6139, "longitude": 77.2090},
        "_risk_profile": "medium",   # internal flag for risk_engine.py
    },
    "14029857364199": {
        "bhu_aadhar_id": "14029857364199",
        "owner_details": {
            "name": "Priya Devi Singh",
            "email": "priya.devi@bhoomi-demo.in",
            "mobile": "+91 91234 56789",
        },
        "land_profile": {
            "area_acres": 2.10,
            "land_type": "Residential",
            "soil_health": {
                "soil_type": "Sandy Loam",
                "suitability_crops": ["N/A - Residential Plot"],
                "soil_ph": 7.1,
            },
            "survey_status": "Completed & Verified",
            "last_survey_date": "2024-11-03",
        },
        "market_details": {
            "seller_asking_price_inr": 6_800_000,
            "local_government_circle_rate_inr": 6_200_000,
            "price_gap_percentage": 9.68,
        },
        "coordinates": {"latitude": 28.6200, "longitude": 77.2150},
        "_risk_profile": "low",
    },
    "14029857364200": {
        "bhu_aadhar_id": "14029857364200",
        "owner_details": {
            "name": "Mukhtar Ahmed Khan",
            "email": "mukhtar.a@bhoomi-demo.in",
            "mobile": "+91 97654 32109",
        },
        "land_profile": {
            "area_acres": 8.70,
            "land_type": "Agricultural",
            "soil_health": {
                "soil_type": "Clayey Soil",
                "suitability_crops": ["Rice", "Jute", "Mustard"],
                "soil_ph": 6.2,
            },
            "survey_status": "Partially Digitized – Resurvey Pending",
            "last_survey_date": "2022-08-17",
        },
        "market_details": {
            "seller_asking_price_inr": 2_800_000,
            "local_government_circle_rate_inr": 2_500_000,
            "price_gap_percentage": 12.0,
        },
        "coordinates": {"latitude": 22.5726, "longitude": 88.3639},
        "_risk_profile": "high",
    },
}


def fetch_land_record(land_code: str) -> Optional[dict]:
    """
    Retrieve full land parcel data by 14-digit Bhu-Aadhar ID.
    Returns None if the ID is not found in the mock registry.
    """
    return _PARCELS.get(land_code)


def fetch_sro_queue_telemetry(land_code: str) -> dict:
    """
    Returns simulated Sub-Registrar Office (SRO) queue metrics for a parcel's district.
    In production, this would call the DILRMP SRO API.
    """
    random.seed(int(land_code[-4:]))  # deterministic per land_code for demo reproducibility
    return {
        "sro_zone_id": f"SRO_ZONE_{random.randint(1, 8)}",
        "sro_name": random.choice([
            "SRO Zone 4, South Delhi",
            "SRO North Kolkata",
            "SRO Patna East",
            "SRO Lucknow Central",
        ]),
        "pending_queue_count": random.randint(80, 450),
        "congestion_factor": random.choice(["Low", "Medium", "High"]),
        "month_of_year": 9,  # September (fiscal push period)
    }


def fetch_court_disputes(land_code: str) -> list[dict]:
    """
    Returns any active or historical court disputes for the given parcel.
    """
    if land_code == "14029857364200":
        return [
            {
                "case_number": "CS-2024-0874",
                "court_name": "Sub-Divisional Court, Kolkata South",
                "filing_year": 2024,
                "case_status": "Active",
                "summary": "Boundary encroachment dispute filed by adjacent plot owner.",
            }
        ]
    return []
