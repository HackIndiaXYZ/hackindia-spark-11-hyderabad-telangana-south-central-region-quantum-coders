"""
AURA Health — Biomarker Mapping & Extraction Normalizer

Maps extracted laboratory parameters from OCR / Gemini Vision into standardized clinical biomarker keys.
"""

from typing import Dict, Any

PARAM_KEY_MAP = {
    # Kidney
    "serum creatinine": "serum_creatinine",
    "s. creatinine": "serum_creatinine",
    "creatinine": "serum_creatinine",
    "blood urea nitrogen": "blood_urea_nitrogen",
    "bun": "blood_urea_nitrogen",
    "serum sodium": "serum_sodium",
    "sodium": "serum_sodium",
    "uacr": "uacr",
    "urine albumin creatinine ratio": "uacr",

    # Liver
    "total bilirubin": "total_bilirubin",
    "t. bilirubin": "total_bilirubin",
    "bilirubin": "total_bilirubin",
    "inr": "inr",
    "prothrombin time inr": "inr",
    "ast": "ast",
    "sgot": "ast",
    "alt": "alt",
    "sgpt": "alt",
    "platelet count": "platelets",
    "platelets": "platelets",

    # Heart
    "systolic bp": "systolic_bp",
    "systolic blood pressure": "systolic_bp",
    "blood pressure": "systolic_bp",
    "bp": "systolic_bp",
    "total cholesterol": "total_cholesterol",
    "cholesterol": "total_cholesterol",
    "hdl cholesterol": "hdl_cholesterol",
    "hdl": "hdl_cholesterol",
    "ldl cholesterol": "ldl_cholesterol",
    "ldl": "ldl_cholesterol",
    "triglycerides": "triglycerides",
    "hba1c": "hba1c",

    # Lungs
    "fev1": "fev1_pct_predicted",
    "fev1 % predicted": "fev1_pct_predicted",
    "fev1/fvc": "fev1_fvc_ratio",
    "fev1/fvc ratio": "fev1_fvc_ratio",
    "spo2": "spo2"
}

def map_lab_values_to_biomarkers(lab_values: list) -> Dict[str, Any]:
    """
    Transforms extracted lab values list into normalized biomarker dict.
    Example lab_value item: {"parameter": "Serum Creatinine", "value": "1.2", "unit": "mg/dL"}
    """
    extracted_biomarkers: Dict[str, Any] = {}
    if not lab_values:
        return extracted_biomarkers

    for item in lab_values:
        param_raw = str(item.get("parameter", "")).strip().lower()
        val_raw = item.get("value")
        if not param_raw or val_raw is None:
            continue

        std_key = PARAM_KEY_MAP.get(param_raw)
        if not std_key:
            # Substring fallback matching
            for alias, target in PARAM_KEY_MAP.items():
                if alias in param_raw:
                    std_key = target
                    break

        if std_key:
            try:
                # Special handling for blood pressure e.g. "120/80" -> systolic=120
                if std_key == "systolic_bp" and isinstance(val_raw, str) and "/" in val_raw:
                    sys_val = float(val_raw.split("/")[0].strip())
                    extracted_biomarkers[std_key] = sys_val
                else:
                    clean_num = float(str(val_raw).replace("<", "").replace(">", "").strip())
                    extracted_biomarkers[std_key] = clean_num
            except ValueError:
                pass

    return extracted_biomarkers
