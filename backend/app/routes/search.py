"""
Bhoomi Mitra – Search & Plot Registry Routes
GET /api/v1/search?land_code=<14-digit-Bhu-Aadhar-ID>
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.auth import get_current_user
from app.services.govt_api_mock import fetch_land_record

router = APIRouter(prefix="/api/v1", tags=["Search"])


@router.get("/search", summary="Search land parcel by Bhu-Aadhar ID")
def search_plot(
    land_code: str = Query(..., min_length=14, max_length=14, description="14-digit ULPIN Bhu-Aadhar ID"),
    _user: dict = Depends(get_current_user),
):
    """
    Returns full land parcel data: owner details, soil profile, circle rate,
    market price gap, survey status, and GPS coordinates.
    """
    record = fetch_land_record(land_code)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Land parcel '{land_code}' not found in DILRMP registry.",
        )
    # Strip internal fields before returning
    public_record = {k: v for k, v in record.items() if not k.startswith("_")}
    return public_record
