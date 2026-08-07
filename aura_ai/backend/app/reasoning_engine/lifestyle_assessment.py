"""
AURA Health — Wellness Layer (Lifestyle Assessment Engine)

Calculates preventive wellness insights, habit analysis, and lifestyle recommendations 
based solely on general patient intake (age, gender, BMI, sleep, exercise, smoking, alcohol, diet, family history, disease burden, and surgical history).

STRICT RULE: This module NEVER generates clinical diagnoses or organ numerical scores.
"""

from typing import Dict, Any, List, Set

# Centralized Scoring Configuration
LIFESTYLE_SCORING_CONFIG = {
    "base_wellness_score": 95,
    "min_wellness_score": 35,
    "max_wellness_score": 98,
    "penalties": {
        "smoker": 15,
        "alcohol_exceeds_limit": 8,
        "sleep_under_6h": 10,
        "sleep_over_9h": 3,
        "activity_sedentary": 8,
        "activity_light": 4,
        "bmi_obese": 12,
        "bmi_overweight": 5,
        "bmi_underweight": 4,
        "diet_poor": 8,
        "diet_average": 2,
        "clinical_sector_per_active": 3,
        "disease_burden_high": 12,
        "disease_burden_moderate": 6,
    },
    "bio_age_deltas": {
        "smoker": 3.5,
        "alcohol": 1.5,
        "bmi_obese": 3.0,
        "bmi_overweight": 1.0,
        "bmi_healthy": -1.0,
        "sleep_under_6h": 2.0,
        "sleep_healthy": -1.0,
        "activity_vigorous": -2.0,
        "activity_sedentary": 2.0,
        "diet_balanced": -1.5,
        "diet_poor": 2.0,
    }
}

# Medical Term Normalization Dictionary
DISEASE_NORMALIZATION_MAP = {
    "htn": "Hypertension (High Blood Pressure)",
    "high bp": "Hypertension (High Blood Pressure)",
    "bp": "Hypertension (High Blood Pressure)",
    "hypertension": "Hypertension (High Blood Pressure)",
    "dm": "Diabetes Mellitus",
    "type 2 diabetes": "Diabetes Mellitus",
    "type 1 diabetes": "Diabetes Mellitus",
    "diabetes": "Diabetes Mellitus",
    "sugar": "Diabetes Mellitus",
    "blood sugar": "Diabetes Mellitus",
    "asthma": "Chronic Respiratory Condition",
    "copd": "Chronic Respiratory Condition",
    "pulmonary": "Chronic Respiratory Condition",
    "fatty liver": "Hepatic / Metabolic Condition",
    "cirrhosis": "Hepatic / Metabolic Condition",
    "liver": "Hepatic / Metabolic Condition",
    "ckd": "Renal Condition",
    "kidney disease": "Renal Condition",
    "renal": "Renal Condition",
    "thyroid": "Thyroid Disorder",
    "cardio": "Cardiovascular Condition",
    "chd": "Cardiovascular Condition",
    "heart attack": "Cardiovascular Condition",
    "heart disease": "Cardiovascular Condition",
}

# Structured Family History Risk Patterns
FAMILY_HISTORY_PATTERNS = {
    "cardiovascular": ["heart", "cardio", "coronary", "attack", "angina", "bp", "hypertension"],
    "metabolic": ["diabetes", "sugar", "thyroid", "obesity"],
    "neurological": ["stroke", "brain", "dementia", "parkinson", "alzheimer"],
    "oncology": ["cancer", "tumor", "malignancy", "carcinoma"]
}

def normalize_disease_terms(raw_text: str) -> List[str]:
    """Normalizes medical terms from raw free-text into canonical health condition categories."""
    if not raw_text or not raw_text.strip():
        return []
    
    normalized: Set[str] = set()
    text_lower = raw_text.lower()
    
    for key, canonical in DISEASE_NORMALIZATION_MAP.items():
        if key in text_lower:
            normalized.add(canonical)
            
    return list(normalized)

def parse_family_history_categories(raw_text: str) -> Dict[str, bool]:
    """Parses free-text family details into structured hereditary risk categories."""
    if not raw_text or not raw_text.strip():
        return {cat: False for cat in FAMILY_HISTORY_PATTERNS}
    
    text_lower = raw_text.lower()
    found: Dict[str, bool] = {}
    
    for category, keywords in FAMILY_HISTORY_PATTERNS.items():
        found[category] = any(kw in text_lower for kw in keywords)
        
    return found

def evaluate_lifestyle_assessment(profile: Dict[str, Any]) -> Dict[str, Any]:
    age_val = profile.get("age")
    age = float(age_val) if age_val is not None else 30.0
    sex = str(profile.get("sex", profile.get("gender", "male")) or "male").lower()
    
    bmi_val = profile.get("bmi")
    bmi = float(bmi_val) if bmi_val is not None else 22.0
    
    sleep_val = profile.get("sleep_hours") if profile.get("sleep_hours") is not None else profile.get("sleep")
    sleep_hours = float(sleep_val) if sleep_val is not None else 7.0
    
    activity_level = str(profile.get("activity_level", profile.get("activity", "3")) or "3").lower()
    smoker = Boolean(profile.get("smoker", profile.get("smoking", False)))
    
    alcohol_val = profile.get("alcohol_units_per_week")
    if alcohol_val is not None:
        alcohol_units = float(alcohol_val)
    else:
        alcohol_units = 10.0 if profile.get("alcohol") else 0.0
        
    diet_type = str(profile.get("diet_type", profile.get("diet", "average")) or "average").lower()
    family_history_raw = str(profile.get("family_history", profile.get("familyDetails", "")) or "")
    primary_disease_raw = str(profile.get("primary_disease", profile.get("primaryDisease", "")) or "")
    major_surgeries = str(profile.get("major_surgeries", profile.get("majorSurgeries", "")) or "")
    minor_surgeries = str(profile.get("minor_surgeries", profile.get("minorSurgeries", "")) or "")
    sectors = profile.get("sectors", {})

    cfg = LIFESTYLE_SCORING_CONFIG
    penalties = cfg["penalties"]
    bio_deltas = cfg["bio_age_deltas"]

    score = cfg["base_wellness_score"]
    bio_age_delta = 0.0

    risk_factors: List[Dict[str, str]] = []
    preventive_insights: List[str] = []
    wellness_recommendations: List[str] = []

    # 1. Sleep Assessment
    if sleep_hours < 6.0:
        score -= penalties["sleep_under_6h"]
        bio_age_delta += bio_deltas["sleep_under_6h"]
        risk_factors.append({
            "category": "Sleep Recovery",
            "severity": "Moderate",
            "title": "Short Sleep Duration (<6 hrs)",
            "description": "Getting fewer than 6 hours of sleep regularly impacts autonomic recovery and stress regulation."
        })
        preventive_insights.append("Restricted sleep elevates long-term cardiovascular and autonomic nervous strain.")
        wellness_recommendations.append("Target 7–8 hours of quality sleep nightly to optimize neuro-endocrine recovery.")
    elif sleep_hours > 9.0:
        score -= penalties["sleep_over_9h"]
        preventive_insights.append("Prolonged sleep duration (>9 hrs) may reflect low physical activity or fatigue.")
    else:
        bio_age_delta += bio_deltas["sleep_healthy"]

    # 2. Smoking Assessment
    if smoker:
        score -= penalties["smoker"]
        bio_age_delta += bio_deltas["smoker"]
        risk_factors.append({
            "category": "Tobacco Exposure",
            "severity": "High",
            "title": "Active Tobacco Use",
            "description": "Tobacco use is a primary driver of respiratory and arterial oxidative strain."
        })
        preventive_insights.append("Active tobacco use increases long-term respiratory and arterial disease risk.")
        wellness_recommendations.append("Consider structured tobacco cessation guidance to reduce overall vascular strain.")

    # 3. Alcohol Assessment
    weekly_limit = 7.0 if sex in ("female", "f") else 14.0
    if alcohol_units > weekly_limit:
        score -= penalties["alcohol_exceeds_limit"]
        bio_age_delta += bio_deltas["alcohol"]
        risk_factors.append({
            "category": "Alcohol Intake",
            "severity": "Moderate",
            "title": "Alcohol Intake Exceeds Limits",
            "description": f"Consuming >{weekly_limit:.0f} units/week increases metabolic and hepatic strain."
        })
        preventive_insights.append("Frequent alcohol intake elevates resting blood pressure and metabolic load.")
        wellness_recommendations.append(f"Moderate weekly alcohol consumption to below {weekly_limit:.0f} units.")

    # 4. BMI Assessment
    if bmi >= 30.0:
        score -= penalties["bmi_obese"]
        bio_age_delta += bio_deltas["bmi_obese"]
        risk_factors.append({
            "category": "Metabolic",
            "severity": "High",
            "title": "Elevated Body Mass Index (BMI ≥ 30)",
            "description": "Higher adiposity increases long-term metabolic, glycemic, and vascular strain."
        })
        preventive_insights.append("Elevated body mass places progressive load on cardiovascular and renal systems.")
        wellness_recommendations.append("Incorporate daily low-impact aerobic exercise and nutritional portion control.")
    elif bmi >= 25.0:
        score -= penalties["bmi_overweight"]
        bio_age_delta += bio_deltas["bmi_overweight"]
        risk_factors.append({
            "category": "Metabolic",
            "severity": "Moderate",
            "title": "Overweight BMI (25.0 - 29.9)",
            "description": "Mildly elevated body weight relative to height."
        })
        preventive_insights.append("Maintaining a balanced weight supports long-term metabolic and vascular health.")
    elif bmi < 18.5:
        score -= penalties["bmi_underweight"]
        preventive_insights.append("Underweight BMI (<18.5) may require dietary evaluation to support muscle mass.")
    else:
        bio_age_delta += bio_deltas["bmi_healthy"]

    # 5. Physical Activity Assessment
    act_val = 2
    try:
        act_val = int(activity_level)
    except ValueError:
        if "sedentary" in activity_level or "low" in activity_level: act_val = 0
        elif "vigorous" in activity_level or "high" in activity_level: act_val = 4

    if act_val <= 1:
        score -= penalties["activity_sedentary"]
        bio_age_delta += bio_deltas["activity_sedentary"]
        risk_factors.append({
            "category": "Physical Activity",
            "severity": "Moderate",
            "title": "Sedentary Lifestyle",
            "description": "Low physical activity reduces cardiorespiratory fitness and muscle glucose uptake."
        })
        preventive_insights.append("Sedentary habits correlate with reduced vascular elasticity and stamina over time.")
        wellness_recommendations.append("Aim for at least 150 minutes of moderate activity (e.g. brisk walking) weekly.")
    elif act_val >= 3:
        bio_age_delta += bio_deltas["activity_vigorous"]

    # 6. Diet Quality Assessment
    if diet_type in ("poor", "unhealthy", "junk", "processed"):
        score -= penalties["diet_poor"]
        bio_age_delta += bio_deltas["diet_poor"]
        preventive_insights.append("High intake of processed foods increases systemic inflammatory and glycemic load.")
        wellness_recommendations.append("Increase whole grains, fresh vegetables, and lean proteins in daily diet.")
    elif diet_type in ("balanced", "mediterranean", "healthy"):
        bio_age_delta += bio_deltas["diet_balanced"]
    else:
        score -= penalties["diet_average"]

    # 7. Disease Burden Term Normalization (Refinement #3)
    normalized_diseases = normalize_disease_terms(primary_disease_raw)
    if normalized_diseases:
        score -= penalties["disease_burden_moderate"] * len(normalized_diseases)
        disease_str = ", ".join(normalized_diseases)
        preventive_insights.append(f"Documented health condition(s): {disease_str}.")
        wellness_recommendations.append(f"Maintain routine clinical follow-up and monitoring for {disease_str}.")

    # 8. Clinical Focus Sectors
    if isinstance(sectors, dict):
        active_sectors_count = sum(1 for v in sectors.values() if Boolean(v))
        if active_sectors_count > 0:
            score -= penalties["clinical_sector_per_active"] * active_sectors_count

    # 9. Structured Family History Categories (Refinement #4)
    family_categories = parse_family_history_categories(family_history_raw)
    if family_categories["cardiovascular"]:
        preventive_insights.append("Hereditary cardiovascular risk detected from family history.")
        wellness_recommendations.append("Schedule annual lipid profile and resting blood pressure monitoring.")
    if family_categories["metabolic"]:
        preventive_insights.append("Hereditary metabolic/diabetes risk detected from family history.")
        wellness_recommendations.append("Schedule routine annual HbA1c blood sugar screening.")
    if family_categories["oncology"]:
        preventive_insights.append("Hereditary oncology history documented.")
        wellness_recommendations.append("Discuss age-appropriate routine cancer screening with your primary care provider.")

    # 10. Surgical History Guidance (Refinement #5: Follow-up focused, no automatic BioAge penalty)
    if major_surgeries and len(major_surgeries.strip()) > 3:
        wellness_recommendations.append(f"Maintain annual specialist follow-up for major surgical history ({major_surgeries.strip()}).")

    if not preventive_insights:
        preventive_insights.append("Your general intake indicates strong foundational wellness habits. Keep maintaining regular activity and sleep.")
        wellness_recommendations.append("Continue regular wellness checkups and maintain balanced nutrition.")

    final_score = max(cfg["min_wellness_score"], min(cfg["max_wellness_score"], round(score)))

    # Lifestyle-Based Biological Age Estimate (Refinement #1)
    lifestyle_bio_age_estimate = max(18, round(age + bio_age_delta))

    overall_lifestyle_tier = "Healthy Baseline"
    if any(r["severity"] == "High" for r in risk_factors) or final_score < 65:
        overall_lifestyle_tier = "Elevated Lifestyle Risk"
    elif len(risk_factors) >= 2 or final_score < 82:
        overall_lifestyle_tier = "Moderate Lifestyle Risk"

    return {
        "assessment_type": "wellness_layer",
        "overall_lifestyle_tier": overall_lifestyle_tier,
        "wellness_score": final_score,
        "lifestyle_biological_age_estimate": lifestyle_bio_age_estimate,
        "risk_factors": risk_factors,
        "preventive_insights": preventive_insights,
        "wellness_recommendations": list(set(wellness_recommendations)),
        "normalized_diseases": normalized_diseases,
        "family_history_categories": family_categories,
        "disclaimer": "These lifestyle-derived insights are based on non-clinical patient intake demographics and habits, not report-derived organ scores."
    }

def Boolean(val: Any) -> bool:
    if isinstance(val, bool): return val
    if isinstance(val, (int, float)): return val != 0
    if isinstance(val, str): return val.lower() in ("true", "1", "yes")
    return bool(val)
