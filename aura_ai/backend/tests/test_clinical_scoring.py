"""
Unit Tests for Deterministic Clinical Scoring Engine
"""

from app.reasoning_engine.clinical_scoring import (
    compute_egfr_ckdepi2021,
    compute_meld_na,
    compute_fib4,
    compute_gold_lungs,
    compute_prevent_heart,
    compute_cha2ds2_vasc_brain,
    evaluate_clinical_organ_scores,
)


def test_ckd_epi_2021():
    # Healthy 40yo male with Creatinine 0.9 mg/dL
    res = compute_egfr_ckdepi2021(0.9, 40, False)
    assert res["formula_name"] == "CKD-EPI 2021"
    assert res["egfr_value"] > 90.0
    assert res["risk_band"] == "low"


def test_meld_na():
    # Elevated creatinine and bilirubin
    res = compute_meld_na(creatinine_mg_dl=1.8, bilirubin_mg_dl=2.5, inr=1.4, sodium_meq_l=130.0)
    assert res["formula_name"] == "MELD-Na"
    assert res["meld_na_score"] >= 15
    assert res["risk_band"] in ("moderate", "high")


def test_fib4():
    # Age 50, AST 40, ALT 30, Platelets 200 -> FIB-4 approx 1.83
    res = compute_fib4(50, 40.0, 30.0, 200.0)
    assert res["formula_name"] == "FIB-4 Index"
    assert res["fib4_index"] > 1.3
    assert res["risk_band"] == "moderate"


def test_gold_lungs():
    # Obstruction case FEV1/FVC < 0.70 and FEV1 predicted 65% (GOLD 2)
    res = compute_gold_lungs(fev1_pct_predicted=65.0, fev1_fvc_ratio=0.62)
    assert res["formula_name"] == "GOLD 2026 Spirometric Classification"
    assert res["gold_grade"] == "GOLD 2 (Moderate)"
    assert res["risk_band"] == "moderate"


def test_prevent_heart():
    res = compute_prevent_heart(age_years=50, systolic_bp=135.0, total_cholesterol_mg_dl=220.0, hdl_cholesterol_mg_dl=45.0)
    assert res["formula_name"] == "AHA PREVENT™ / ASCVD Model"
    assert res["risk_band"] in ("moderate", "high")


def test_cha2ds2_vasc_brain():
    res = compute_cha2ds2_vasc_brain(has_af=True, age_years=70, has_htn=True)
    assert res["formula_name"] == "CHA₂DS₂-VASc Stroke Risk"
    assert res["cha2ds2_vasc_score"] >= 2


def test_master_evaluator():
    profile = {"age": 45, "sex": "male"}
    labs = {"serum_creatinine": 1.0, "alt": 25, "ast": 28, "platelets": 250}
    vitals = {"systolic_bp": 120, "spo2": 98}

    scores = evaluate_clinical_organ_scores(profile, labs, vitals)
    assert "kidneys" in scores
    assert "liver" in scores
    assert "lungs" in scores
    assert "heart" in scores
    assert "brain" in scores
