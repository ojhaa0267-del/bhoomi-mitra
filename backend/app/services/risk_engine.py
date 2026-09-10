"""
Bhoomi Mitra – Rule-Based GIS Safety Evaluator & Explainable AI Risk Engine

Evaluates a land parcel against:
  1. Active court litigation / stay orders
  2. Forest / protected zone buffer encroachment
  3. National Highway or infrastructure widening buffer overlap
  4. Circle rate vs market price discrepancy (possible fraud indicator)

Returns a 0–100% Explainable Trust Score with SHAP-style factor attribution.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Literal


RiskLevel = Literal["Low", "Medium", "High"]


@dataclass
class XAIFactor:
    factor: str
    weight_contribution: float    # Positive = helps score, Negative = hurts score
    effect: Literal["Positive", "Negative"]


@dataclass
class RiskBreakdown:
    court_litigation: dict
    infrastructure_overlap_gis: dict
    forest_or_protected_zone: dict


@dataclass
class RiskResult:
    overall_risk_level: RiskLevel
    trust_score_percentage: float
    risk_breakdown: RiskBreakdown
    explainable_ai_weights: list[XAIFactor]


# ── Simulated GIS buffer data per parcel ────────────────────────────────────
_GIS_OVERLAPS: dict[str, dict] = {
    "14029857364102": {
        "highway_overlap_pct": 5.0,    # 5% overlap with NH widening zone
        "forest_overlap_pct": 0.0,
    },
    "14029857364199": {
        "highway_overlap_pct": 0.0,
        "forest_overlap_pct": 0.0,
    },
    "14029857364200": {
        "highway_overlap_pct": 0.0,
        "forest_overlap_pct": 15.0,   # 15% encroaches forest reserve
    },
}


def evaluate_risk(land_code: str, disputes: list[dict], price_gap_pct: float) -> RiskResult:
    """
    Core risk scoring engine. Accepts pre-fetched dispute list and price gap.
    """
    factors: list[XAIFactor] = []
    score: float = 100.0

    gis = _GIS_OVERLAPS.get(land_code, {"highway_overlap_pct": 0.0, "forest_overlap_pct": 0.0})

    # ── 1. Positive base contribution – Verified Land Records ──────────────
    factors.append(XAIFactor(
        factor="Verified Land Records & Digitized Survey",
        weight_contribution=60.0,
        effect="Positive",
    ))

    # ── 2. Court Disputes ──────────────────────────────────────────────────
    active_disputes = [d for d in disputes if d.get("case_status") == "Active"]
    if active_disputes:
        score -= 40.0
        factors.append(XAIFactor(
            factor=f"Active Court Case ({active_disputes[0]['case_number']})",
            weight_contribution=-40.0,
            effect="Negative",
        ))
        court_status = {
            "status": "Warning",
            "pending_disputes": len(active_disputes),
            "description": active_disputes[0]["summary"],
        }
    else:
        score += 0.0   # Neutral – already covered by base
        factors.append(XAIFactor(
            factor="No Pending Court Litigation",
            weight_contribution=30.0,
            effect="Positive",
        ))
        court_status = {"status": "Clear", "pending_disputes": 0, "historical_cases": len(disputes)}

    # ── 3. Highway / Infrastructure Buffer ────────────────────────────────
    hw_pct = gis["highway_overlap_pct"]
    if hw_pct > 0:
        deduction = round(hw_pct * 1.5, 2)
        score -= deduction
        factors.append(XAIFactor(
            factor=f"National Highway Widening Buffer ({hw_pct}% parcel overlap)",
            weight_contribution=-deduction,
            effect="Negative",
        ))
        infra_status = {
            "status": "Warning",
            "description": f"{hw_pct}% of boundary overlaps with upcoming NH Widening Zone.",
        }
    else:
        infra_status = {"status": "Clear"}

    # ── 4. Forest / Protected Zone ─────────────────────────────────────────
    fp_pct = gis["forest_or_protected_zone_overlap_pct"] if "forest_or_protected_zone_overlap_pct" in gis else gis.get("forest_overlap_pct", 0.0)
    if fp_pct > 10:
        deduction = round(fp_pct * 1.8, 2)
        score -= deduction
        factors.append(XAIFactor(
            factor=f"Forest Reserve Buffer Encroachment ({fp_pct}% parcel area)",
            weight_contribution=-deduction,
            effect="Negative",
        ))
        forest_status = {
            "status": "Warning",
            "description": f"{fp_pct}% of the parcel encroaches on a notified Forest Preservation buffer.",
        }
    else:
        forest_status = {"status": "Clear"}

    # ── 5. Price Gap Penalty (> 30% likely under-valuation / fraud risk) ──
    if price_gap_pct > 30:
        score -= 12.0
        factors.append(XAIFactor(
            factor=f"Abnormal Circle Rate Price Gap ({price_gap_pct:.1f}%)",
            weight_contribution=-12.0,
            effect="Negative",
        ))

    # ── Clamp & Classify ──────────────────────────────────────────────────
    trust_score = round(max(0.0, min(100.0, score)), 1)
    if trust_score >= 80:
        risk_level: RiskLevel = "Low"
    elif trust_score >= 50:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return RiskResult(
        overall_risk_level=risk_level,
        trust_score_percentage=trust_score,
        risk_breakdown=RiskBreakdown(
            court_litigation=court_status,
            infrastructure_overlap_gis=infra_status,
            forest_or_protected_zone=forest_status,
        ),
        explainable_ai_weights=factors,
    )
