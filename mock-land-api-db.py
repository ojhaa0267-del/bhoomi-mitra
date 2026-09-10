# =============================================================================
# BHOOMI MITRA - MOCK LAND DATABASE & FASTAPI RUNTIME ENGINE
# Designed specifically for your Hackathon Demo (Antigravity Python Setup)
# 100% Free, No Credit Cards, Local Database, and Instant Execution!
# =============================================================================

import math
from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
    from firebase_admin import credentials
except ImportError:
    firebase_admin = None

app = FastAPI(
    title="Bhoomi Mitra API Engine",
    description="Mock Land Records & GIS Overlay Analytics Server for Indian Land Portal",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None
)

# Enable CORS for easy connection with your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# 0. FIREBASE AUTHENTICATION SETUP
# =============================================================================
security = HTTPBearer()

try:
    if firebase_admin and not firebase_admin._apps:
        if os.path.exists("firebase-adminsdk.json"):
            cred = credentials.Certificate("firebase-adminsdk.json")
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK Initialized Successfully.")
        else:
            print("⚠️ 'firebase-adminsdk.json' not found. Using DEMO_MODE bypass for backend auth.")
except Exception as e:
    print(f"⚠️ Firebase initialization error: {e}")

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials
    if token == "demo-citizen-token":
        return {"uid": "demo-uid", "email": "demo@bhoomi.in", "role": "demo_user"}
        
    if not firebase_admin:
        raise HTTPException(status_code=500, detail="firebase-admin library not installed.")
        
    try:
        if os.path.exists("firebase-adminsdk.json"):
            decoded_token = firebase_auth.verify_id_token(token)
            return decoded_token
        else:
            raise HTTPException(status_code=500, detail="Backend Firebase Admin SDK config is missing.")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {e}")

# =============================================================================
# 1. IN-MEMORY MOCK DATABASE (PRE-LOADED WITH 14-DIGIT BHU-AADHAR PLOTS)
# =============================================================================
LAND_DATABASE = {
    "14029857364101": {
        "bhu_aadhar_id": "14029857364101",
        "owner_details": {
            "name": "Ramesh Kumar Singh",
            "email": "ramesh.singh@bhoomi-demo.in",
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
            "latitude": 22.5726,
            "longitude": 88.3639
        },
        "risk_matrix": {
            "overall_risk_level": "Low",
            "trust_score_percentage": 94.0,
            "risk_breakdown": {
                "court_litigation": {
                    "status": "Clear",
                    "description": "No pending or historical court litigation matches found."
                },
                "infrastructure_overlap_gis": {
                    "status": "Clear",
                    "description": "Plot lies 500m away from proposed National Highway expansion zone."
                },
                "forest_or_protected_zone": {
                    "status": "Clear",
                    "description": "Properties do not cross any reserve forest boundaries."
                }
            },
            "explainable_ai_weights": [
                {"factor": "Clear Title Certificate", "weight_contribution": 60.0, "effect": "Positive"},
                {"factor": "No Active Court Cases", "weight_contribution": 30.0, "effect": "Positive"},
                {"factor": "No Infrastructure Overlap", "weight_contribution": 4.0, "effect": "Positive"}
            ]
        },
        "timeline_prediction": {
            "estimated_total_days": 8,
            "timeline_milestones": [
                {"step": "Documents Verification", "duration_days": 1, "status": "Completed"},
                {"step": "NOC Approvals", "duration_days": 2, "status": "Completed"},
                {"step": "Sale Deed Registration", "duration_days": 2, "status": "In-Progress"},
                {"step": "Land Mutation (Dakhil-Kharij)", "duration_days": 3, "status": "Pending"}
            ],
            "sub_registrar_office": "SRO Alipore Office, South Kolkata",
            "congestion_factor": "Low"
        }
    },
    "14029857364102": {
        "bhu_aadhar_id": "14029857364102",
        "owner_details": {
            "name": "Subhash Chandra Bose",
            "email": "subhash.b@bhoomi-demo.in",
            "mobile": "+91 87654 32109"
        },
        "land_profile": {
            "area_acres": 1.85,
            "land_type": "Residential",
            "soil_health": {
                "soil_type": "Clayey Red Soil",
                "suitability_crops": ["None (Residential Zone)"],
                "soil_ph": 5.9
            },
            "survey_status": "Completed & Digitized",
            "last_survey_date": "2024-11-20"
        },
        "market_details": {
            "seller_asking_price_inr": 8500000,
            "local_government_circle_rate_inr": 5500000,
            "price_gap_percentage": 54.55
        },
        "coordinates": {
            "latitude": 22.5850,
            "longitude": 88.3750
        },
        "risk_matrix": {
            "overall_risk_level": "Medium",
            "trust_score_percentage": 74.0,
            "risk_breakdown": {
                "court_litigation": {
                    "status": "Clear",
                    "description": "No active litigation found."
                },
                "infrastructure_overlap_gis": {
                    "status": "Warning",
                    "description": "Eastern border overlaps slightly (5%) with Kolkata Metro expansion corridor buffer."
                },
                "forest_or_protected_zone": {
                    "status": "Clear",
                    "description": "Clear of eco-sensitive boundaries."
                }
            },
            "explainable_ai_weights": [
                {"factor": "Clear Title Certificate", "weight_contribution": 60.0, "effect": "Positive"},
                {"factor": "No Active Court Cases", "weight_contribution": 30.0, "effect": "Positive"},
                {"factor": "Metro Expansion Corridor Overlap", "weight_contribution": -16.0, "effect": "Negative"}
            ]
        },
        "timeline_prediction": {
            "estimated_total_days": 18,
            "timeline_milestones": [
                {"step": "Documents Verification", "duration_days": 3, "status": "Completed"},
                {"step": "NOC Approvals", "duration_days": 6, "status": "In-Progress"},
                {"step": "Sale Deed Registration", "duration_days": 4, "status": "Pending"},
                {"step": "Land Mutation (Dakhil-Kharij)", "duration_days": 5, "status": "Pending"}
            ],
            "sub_registrar_office": "SRO Sealdah Office, Central Kolkata",
            "congestion_factor": "Medium"
        }
    },
    "14029857364103": {
        "bhu_aadhar_id": "14029857364103",
        "owner_details": {
            "name": "Ananya Chatterjee",
            "email": "ananya.c@bhoomi-demo.in",
            "mobile": "+91 76543 21098"
        },
        "land_profile": {
            "area_acres": 8.50,
            "land_type": "Industrial",
            "soil_health": {
                "soil_type": "Sandy Clay",
                "suitability_crops": ["Industrial use only"],
                "soil_ph": 7.2
            },
            "survey_status": "Disputed / Boundary Mismatch",
            "last_survey_date": "2023-01-10"
        },
        "market_details": {
            "seller_asking_price_inr": 12000000,
            "local_government_circle_rate_inr": 9000000,
            "price_gap_percentage": 33.33
        },
        "coordinates": {
            "latitude": 22.5601,
            "longitude": 88.3501
        },
        "risk_matrix": {
            "overall_risk_level": "High",
            "trust_score_percentage": 38.0,
            "risk_breakdown": {
                "court_litigation": {
                    "status": "Warning",
                    "description": "Active Title Suit case registered in Alipore Court (Case Ref: TS/402/2024)."
                },
                "infrastructure_overlap_gis": {
                    "status": "Warning",
                    "description": "Overlaps with 15% of proposed National Highway Widening bypass buffer."
                },
                "forest_or_protected_zone": {
                    "status": "Clear",
                    "description": "Clear of forest preservation zone."
                }
            },
            "explainable_ai_weights": [
                {"factor": "Title Deed Verified", "weight_contribution": 60.0, "effect": "Positive"},
                {"factor": "Active Court Title Suit Case", "weight_contribution": -45, "effect": "Negative"},
                {"factor": "National Highway Widening Overlap", "weight_contribution": -17, "effect": "Negative"}
            ]
        },
        "timeline_prediction": {
            "estimated_total_days": 45,
            "timeline_milestones": [
                {"step": "Documents Verification", "duration_days": 15, "status": "In-Progress"},
                {"step": "NOC Approvals", "duration_days": 10, "status": "Pending"},
                {"step": "Sale Deed Registration", "duration_days": 10, "status": "Pending"},
                {"step": "Land Mutation (Dakhil-Kharij)", "duration_days": 10, "status": "Pending"}
            ],
            "sub_registrar_office": "SRO Howrah HQ Office",
            "congestion_factor": "High"
        }
    },
    "14029857364199": {
        "bhu_aadhar_id": "14029857364199",
        "owner_details": {
            "name": "Rajesh Kumar",
            "email": "rajesh.k@bhoomi-demo.in",
            "mobile": "+91 98765 43210"
        },
        "land_profile": {
            "area_acres": 2.50,
            "land_type": "Agricultural",
            "soil_health": {
                "soil_type": "Alluvial",
                "suitability_crops": ["Wheat", "Rice", "Sugarcane"],
                "soil_ph": 6.8
            },
            "survey_status": "Verified - Green",
            "last_survey_date": "2024-02-15"
        },
        "market_details": {
            "seller_asking_price_inr": 4500000,
            "local_government_circle_rate_inr": 4200000,
            "price_gap_percentage": 7.14
        },
        "coordinates": {
            "latitude": 28.7041,
            "longitude": 77.1025
        },
        "risk_matrix": {
            "overall_risk_level": "Low",
            "trust_score_percentage": 98.5,
            "risk_breakdown": {
                "court_litigation": {
                    "status": "Clear",
                    "description": "No active cases found."
                },
                "infrastructure_overlap_gis": {
                    "status": "Clear",
                    "description": "No overlap with government projects."
                },
                "forest_or_protected_zone": {
                    "status": "Clear",
                    "description": "Clear of forest preservation zone."
                }
            },
            "explainable_ai_weights": [
                {"factor": "Title Deed Verified", "weight_contribution": 60.0, "effect": "Positive"},
                {"factor": "Clear GIS Buffer", "weight_contribution": 20.0, "effect": "Positive"},
                {"factor": "No Litigation", "weight_contribution": 18.5, "effect": "Positive"}
            ]
        },
        "timeline_prediction": {
            "estimated_total_days": 12,
            "timeline_milestones": [
                {"step": "Documents Verification", "duration_days": 2, "status": "Completed"},
                {"step": "NOC Approvals", "duration_days": 3, "status": "In-Progress"},
                {"step": "Sale Deed Registration", "duration_days": 4, "status": "Pending"},
                {"step": "Land Mutation (Dakhil-Kharij)", "duration_days": 3, "status": "Pending"}
            ],
            "sub_registrar_office": "SRO New Delhi West",
            "congestion_factor": "Low"
        }
    },
    "19017001450001": {
        "bhu_aadhar_id": "19017001450001",
        "owner_details": {
            "name": "Animesh Chatterjee",
            "email": "animesh.c@bhoomi-wb.in",
            "mobile": "+91 94331 20491"
        },
        "land_profile": {
            "area_acres": 1.75,
            "land_type": "Rayat Agricultural",
            "mouza": "Dakshin Gobindopur, Rajpur Sonarpur (700145)",
            "soil_health": {
                "soil_type": "Gangetic Alluvial",
                "suitability_crops": ["Paddy", "Mustard", "Vegetables"],
                "soil_ph": 6.9
            },
            "survey_status": "Verified - Banglarbhumi Clear",
            "last_survey_date": "2024-01-18"
        },
        "market_details": {
            "seller_asking_price_inr": 3800000,
            "local_government_circle_rate_inr": 3500000,
            "price_gap_percentage": 8.57
        },
        "coordinates": {
            "latitude": 22.4280,
            "longitude": 88.3980
        },
        "risk_matrix": {
            "overall_risk_level": "Low",
            "trust_score_percentage": 96.0,
            "risk_breakdown": {
                "court_litigation": {
                    "status": "Clear",
                    "description": "No active litigation found in Baruipur Civil Court."
                },
                "infrastructure_overlap_gis": {
                    "status": "Clear",
                    "description": "Clear of EM Bypass extension & canal buffer zones."
                },
                "forest_or_protected_zone": {
                    "status": "Clear",
                    "description": "Clear of Sundarban delta preserved mangrove belt."
                }
            },
            "explainable_ai_weights": [
                {"factor": "Banglarbhumi Khatian Verified", "weight_contribution": 55.0, "effect": "Positive"},
                {"factor": "Zero Litigation History", "weight_contribution": 25.0, "effect": "Positive"},
                {"factor": "Clear Drainage Canal Buffer", "weight_contribution": 16.0, "effect": "Positive"}
            ]
        },
        "timeline_prediction": {
            "estimated_total_days": 14,
            "timeline_milestones": [
                {"step": "RoR (Khatian) Verification", "duration_days": 3, "status": "Completed"},
                {"step": "BL&LRO Clearance", "duration_days": 4, "status": "In-Progress"},
                {"step": "ADSR Sonarpur Registration", "duration_days": 4, "status": "Pending"},
                {"step": "Online Mutation (Dakhil-Kharij)", "duration_days": 3, "status": "Pending"}
            ],
            "sub_registrar_office": "ADSR Rajpur Sonarpur Office",
            "congestion_factor": "Low"
        }
    },
    "19017001450002": {
        "bhu_aadhar_id": "19017001450002",
        "owner_details": {
            "name": "Subhasis Mondal",
            "email": "subhasis.m@bhoomi-wb.in",
            "mobile": "+91 98302 44102"
        },
        "land_profile": {
            "area_acres": 0.85,
            "land_type": "Commercial Bastu",
            "mouza": "Dakshin Gobindopur Station Road (700145)",
            "soil_health": {
                "soil_type": "Clay Loam",
                "suitability_crops": ["Commercial / Bastu Construction"],
                "soil_ph": 7.1
            },
            "survey_status": "Conditional Verification - Buffer Overlap",
            "last_survey_date": "2023-11-20"
        },
        "market_details": {
            "seller_asking_price_inr": 6200000,
            "local_government_circle_rate_inr": 5100000,
            "price_gap_percentage": 21.57
        },
        "coordinates": {
            "latitude": 22.4350,
            "longitude": 88.4020
        },
        "risk_matrix": {
            "overall_risk_level": "Medium",
            "trust_score_percentage": 68.5,
            "risk_breakdown": {
                "court_litigation": {
                    "status": "Clear",
                    "description": "No active title litigation."
                },
                "infrastructure_overlap_gis": {
                    "status": "Warning",
                    "description": "Overlaps with 10% road-widening buffer for Sonarpur Station link road."
                },
                "forest_or_protected_zone": {
                    "status": "Clear",
                    "description": "Not under forest or wetland restriction."
                }
            },
            "explainable_ai_weights": [
                {"factor": "Clear Land Title", "weight_contribution": 60.0, "effect": "Positive"},
                {"factor": "Station Link Road Widening Buffer", "weight_contribution": -22.0, "effect": "Negative"},
                {"factor": "Pending Commercial Conversion NOC", "weight_contribution": -9.5, "effect": "Negative"}
            ]
        },
        "timeline_prediction": {
            "estimated_total_days": 28,
            "timeline_milestones": [
                {"step": "RoR (Khatian) Verification", "duration_days": 5, "status": "Completed"},
                {"step": "PWD Road Buffer NOC", "duration_days": 10, "status": "In-Progress"},
                {"step": "ADSR Sonarpur Registration", "duration_days": 7, "status": "Pending"},
                {"step": "Commercial Mutation", "duration_days": 6, "status": "Pending"}
            ],
            "sub_registrar_office": "ADSR Rajpur Sonarpur Office",
            "congestion_factor": "Medium"
        }
    },
    "19017433370003": {
        "bhu_aadhar_id": "19017433370003",
        "owner_details": {
            "name": "Debabrata Haldar",
            "email": "debabrata.h@bhoomi-wb.in",
            "mobile": "+91 97321 88903"
        },
        "land_profile": {
            "area_acres": 3.20,
            "land_type": "Disputed / Sali Land",
            "mouza": "Jaynagar Majilpur (743337)",
            "soil_health": {
                "soil_type": "Saline Loam",
                "suitability_crops": ["Paddy only"],
                "soil_ph": 7.6
            },
            "survey_status": "Disputed - Court Injunction Flagged",
            "last_survey_date": "2023-04-12"
        },
        "market_details": {
            "seller_asking_price_inr": 7500000,
            "local_government_circle_rate_inr": 4800000,
            "price_gap_percentage": 56.25
        },
        "coordinates": {
            "latitude": 22.1750,
            "longitude": 88.4250
        },
        "risk_matrix": {
            "overall_risk_level": "High",
            "trust_score_percentage": 32.0,
            "risk_breakdown": {
                "court_litigation": {
                    "status": "Warning",
                    "description": "Active Partition Suit in Baruipur Civil Court (Case Ref: OS/118/2023)."
                },
                "infrastructure_overlap_gis": {
                    "status": "Warning",
                    "description": "Overlaps with irrigation canal embankment boundary."
                },
                "forest_or_protected_zone": {
                    "status": "Clear",
                    "description": "Outside protected biosphere zone."
                }
            },
            "explainable_ai_weights": [
                {"factor": "Khatian Recorded", "weight_contribution": 50.0, "effect": "Positive"},
                {"factor": "Baruipur Court Injunction Suit", "weight_contribution": -48.0, "effect": "Negative"},
                {"factor": "Irrigation Embankment Dispute", "weight_contribution": -20.0, "effect": "Negative"}
            ]
        },
        "timeline_prediction": {
            "estimated_total_days": 65,
            "timeline_milestones": [
                {"step": "Court Case Clearance", "duration_days": 35, "status": "In-Progress"},
                {"step": "BL&LRO Physical Hearing", "duration_days": 12, "status": "Pending"},
                {"step": "Deed Registration", "duration_days": 10, "status": "Pending"},
                {"step": "Mutation", "duration_days": 8, "status": "Pending"}
            ],
            "sub_registrar_office": "ADSR Jaynagar Office",
            "congestion_factor": "High"
        }
    }
}

# =============================================================================
# 2. NO-CARD HAUSINE MATHEMATICAL DISTANCE FORMULA
# =============================================================================
def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates straight-line earth-curvature distance in kilometers.
    No keys required, 100% mathematically free!
    """
    R = 6371.0  # Radius of Earth in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return round(R * c, 2)

# =============================================================================
# 3. REQUEST/RESPONSE DATA MODELS (PYDANTIC SCHEMAS)
# =============================================================================
class DistanceRequest(BaseModel):
    origin_land_code: str
    destination_land_code: str

# =============================================================================
# 4. FASTAPI EXPOSED ENDPOINTS
# =============================================================================

@app.get("/")
def read_root():
    return {
        "status": "online",
        "portal_name": "Bhoomi Mitra AI API",
        "active_plots_mocked": list(LAND_DATABASE.keys()),
        "instruction": "Search land-code by appending it to the query, e.g., /api/v1/search?land_code=14029857364101"
    }

@app.get("/api/v1/search")
def search_plot(land_code: str = Query(..., min_length=14, max_length=14), current_user: dict = Depends(get_current_user)):
    """
    Returns entire simulated government data, soil records, and owner profile.
    """
    if land_code not in LAND_DATABASE:
        raise HTTPException(
            status_code=404, 
            detail="Bhu-Aadhar ID not found."
        )
    return LAND_DATABASE[land_code]

@app.get("/api/v1/land/{land_code}")
def search_plot_path(land_code: str, current_user: dict = Depends(get_current_user)):
    """
    Alias route for /api/v1/land/{land_code} just in case the frontend uses path params.
    """
    if land_code not in LAND_DATABASE:
        raise HTTPException(
            status_code=404, 
            detail=f"Bhu-Aadhar Code {land_code} not found in database."
        )
    return LAND_DATABASE[land_code]

@app.get("/api/v1/risk-assessment")
def get_risk(land_code: str = Query(...), current_user: dict = Depends(get_current_user)):
    """
    Returns AI analyzed risk status and Explainable AI factor weights (SHAP metrics).
    """
    if land_code not in LAND_DATABASE:
        raise HTTPException(status_code=404, detail="Bhu-Aadhar ID not recognized.")
    return {
        "bhu_aadhar_id": land_code,
        "risk_matrix": LAND_DATABASE[land_code]["risk_matrix"]
    }

@app.get("/api/v1/predict-delay")
def get_timeline(land_code: str = Query(...), current_user: dict = Depends(get_current_user)):
    """
    Predicts transaction time, legal clearances, and mutation backlog timelines.
    """
    if land_code not in LAND_DATABASE:
        raise HTTPException(status_code=404, detail="Bhu-Aadhar ID not recognized.")
    return LAND_DATABASE[land_code]["timeline_prediction"]

@app.post("/api/v1/distance")
def calculate_distance(payload: DistanceRequest, current_user: dict = Depends(get_current_user)):
    """
    Computes straight-line and driving distances between two Bhu-Aadhar plots.
    """
    code1 = payload.origin_land_code
    code2 = payload.destination_land_code
    
    if code1 not in LAND_DATABASE or code2 not in LAND_DATABASE:
        raise HTTPException(
            status_code=404, 
            detail="One or both Land Codes not registered in mock database."
        )
        
    loc1 = LAND_DATABASE[code1]["coordinates"]
    loc2 = LAND_DATABASE[code2]["coordinates"]
    
    straight_line_km = calculate_haversine_distance(
        loc1["latitude"], loc1["longitude"], 
        loc2["latitude"], loc2["longitude"]
    )
    
    # Simulating standard road-deviation factor in urban density
    driving_distance_km = round(straight_line_km * 1.32, 2)
    # Estimate time at 25 km/h average local speed
    travel_time_min = round((driving_distance_km / 25.0) * 60, 1)
    
    return {
        "origin_land_code": code1,
        "destination_land_code": code2,
        "spatial_analytics": {
            "origin_coordinates": loc1,
            "destination_coordinates": loc2,
            "straight_line_distance_km": straight_line_km,
            "driving_distance_km": driving_distance_km,
            "estimated_travel_time_minutes": travel_time_min,
            "adjacent_plots_share_boundary": straight_line_km < 0.15
        }
    }

class VicinityRequest(BaseModel):
    center_lat: float
    center_lng: float
    radius_km: float
    area_sqm: float
    plot_type: str

@app.get("/api/v1/land/{land_code}/adjacent")
def get_adjacent_plots(land_code: str, current_user: dict = Depends(get_current_user)):
    """
    Returns plots that are adjacent/nearby to the given land code.
    """
    if land_code not in LAND_DATABASE:
        raise HTTPException(status_code=404, detail="Bhu-Aadhar Code not found.")
    
    origin = LAND_DATABASE[land_code]
    lat1 = origin["coordinates"]["latitude"]
    lon1 = origin["coordinates"]["longitude"]
    
    adjacent_plots = []
    for code, plot in LAND_DATABASE.items():
        if code == land_code:
            continue
            
        lat2 = plot["coordinates"]["latitude"]
        lon2 = plot["coordinates"]["longitude"]
        dist = calculate_haversine_distance(lat1, lon1, lat2, lon2)
        
        # Consider plots within 5 km as adjacent/nearby for demo purposes
        if dist < 5.0:
            adjacent_plots.append({
                "bhu_aadhar_id": code,
                "latitude": lat2,
                "longitude": lon2,
                "owner": plot["owner_details"]["name"],
                "distance_km": dist
            })
            
    return {
        "adjacent_count": len(adjacent_plots),
        "adjacent_plots": adjacent_plots
    }

@app.post("/api/v1/spatial/vicinity-search")
def vicinity_search(payload: VicinityRequest, current_user: dict = Depends(get_current_user)):
    """
    Returns surrounding area records for a newly marked custom area.
    """
    lat1 = payload.center_lat
    lon1 = payload.center_lng
    
    surrounding = []
    for code, plot in LAND_DATABASE.items():
        lat2 = plot["coordinates"]["latitude"]
        lon2 = plot["coordinates"]["longitude"]
        dist = calculate_haversine_distance(lat1, lon1, lat2, lon2)
        
        # If within the requested radius
        if dist <= payload.radius_km:
            surrounding.append({
                "bhu_aadhar_id": code,
                "owner_name": plot["owner_details"]["name"],
                "risk_level": plot["risk_matrix"]["overall_risk_level"],
                "dag_no": f"Dag-{str(code)[-3:]}",
                "khatian_no": f"KLR-{str(code)[-4:]}",
                "land_type": plot["land_profile"]["land_type"],
                "circle_rate_inr": plot["market_details"]["local_government_circle_rate_inr"],
                "distance_meters": int(dist * 1000)
            })
            
    # Sort by distance
    surrounding.sort(key=lambda x: x["distance_meters"])
    
    return {
        "estimated_mouza": "Dakshin Gobindopur (Predicted)",
        "district": "South 24 Parganas",
        "total_surrounding_plots": len(surrounding),
        "surrounding_plots": surrounding
    }

# =============================================================================
# 5. VOICE AGENT & TEXT-TO-SPEECH ENDPOINTS
# =============================================================================
import urllib.request
import json
import os
import tempfile
from fastapi.responses import FileResponse
from fastapi.background import BackgroundTasks

class ChatRequest(BaseModel):
    query: str = Field(..., max_length=500)
    land_code: Optional[str] = None

class TTSRequest(BaseModel):
    text: str = Field(..., max_length=500)
    voice: str = "hi-IN-SwaraNeural"

@app.post("/api/v1/chat")
async def chat(body: ChatRequest):
    import time
    # You can put your actual Gemini key here if it's not in .env
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    
    # MOCK AI RESPONSE FOR HACKATHON IF KEY IS INVALID (Dummy key doesn't start with AIza)
    if not gemini_key or not gemini_key.startswith("AIza"):
        time.sleep(1.2) # Simulate AI thinking time
        query = body.query.lower()
        if "status" in query or "kya hai" in query or "details" in query:
            return {"response_text": f"Bhaiya, is zameen ka status verified hai. Koi court case ya overlap issue nahi mila hai. Main aapko map par dikhata hoon. [MAP_ACTION: {{\"zoom\": 18}}]"}
        elif "time" in query or "kitna" in query or "mutation" in query:
            return {"response_text": "Dakhil-Kharij (Mutation) aur registry mein lagbhag 14-18 din lag sakte hain SRO office mein. Process smoothly chalega kyunki documents clear hain."}
        elif "court" in query or "case" in query or "litigation" in query:
            return {"response_text": "Maine records check kiye hain. Is plot par koi active court case ya title dispute nahi hai. Trust score bohot accha (94%) hai."}
        elif "map" in query or "dikhao" in query or "zoom" in query:
            return {"response_text": "Zaroor! Main map ko usi zameen par focus kar raha hoon. [MAP_ACTION: {{\"zoom\": 17}}]"}
        elif "rti" in query or "draft" in query:
            return {"response_text": "Ji bilkul, main aapke liye is zameen ke details nikalne ke liye ek RTI draft tayar kar deta hoon. [DOC_ACTION: {{\"type\": \"rti\"}}]"}
        else:
            return {"response_text": "Main Bhoomi Mitra hoon! Main zameen ki jaanch, court case ki details aur RTI tayar karne mein aapki madad kar sakta hoon. Boliye, main kya help karoon?"}
            
    # Real Gemini API Call
    system_prompt = (
        "You are Bhoomi Mitra, a friendly Indian local land advisor. "
        "Speak in natural, polite Hindi / Hinglish. Keep answers short (2-3 sentences). "
        "Use words like 'Bhaiya', 'Dakhil-Kharij', 'Kanooni mamla'."
    )
    context = ""
    if body.land_code and body.land_code in LAND_DATABASE:
        record = LAND_DATABASE[body.land_code]
        context = f"\nPlot Info: Owner is {record['owner_details']['name']}, Area is {record['land_profile']['area_acres']} acres, Type is {record['land_profile']['land_type']}."
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
        payload = {
            "system_instruction": {"parts": [{"text": system_prompt + context}]},
            "contents": [{"parts": [{"text": body.query}]}],
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 300}
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode())
            text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            return {"response_text": text}
    except Exception as e:
        print("Chat API Error:", e)
        return {"response_text": "Kshama karein, main abhi theek se sun nahi paa raha. Kripya thodi der baad try karein."}

try:
    import edge_tts
except ImportError:
    edge_tts = None

@app.post("/api/tts/speak")
async def speak_text(req: TTSRequest, background_tasks: BackgroundTasks):
    if not edge_tts:
        raise HTTPException(status_code=500, detail="edge-tts not installed")
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    temp_file.close()
    try:
        communicate = edge_tts.Communicate(req.text, req.voice)
        await communicate.save(temp_file.name)
        background_tasks.add_task(os.remove, temp_file.name)
        return FileResponse(temp_file.name, media_type="audio/mpeg")
    except Exception as e:
        if os.path.exists(temp_file.name):
            os.remove(temp_file.name)
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# RUNNING INSTRUCTIONS:
# Option 1: python -m uvicorn mock-land-api-db:app --reload --port 8000
# Option 2: python mock-land-api-db.py
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("mock-land-api-db:app", host="127.0.0.1", port=8000, reload=True)

