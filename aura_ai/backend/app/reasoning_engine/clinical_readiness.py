"""
AURA Health — Clinical Readiness & Activation Criteria Engine

Evaluates whether sufficient clinical evidence (lab tests, report biomarkers) exists 
to activate individual organ modules in the Digital Twin.

Provides educational "Why is it waiting?" rationale for missing parameters.
"""

from typing import Dict, Any, List, Optional

ORGAN_ACTIVATION_SPECS = {
    "heart": {
        "organ_name": "Heart",
        "required_reports": ["Lipid Profile", "Blood Pressure Report"],
        "required_biomarkers": ["systolic_bp", "total_cholesterol", "hdl_cholesterol"],
        "optional_biomarkers": ["ldl_cholesterol", "triglycerides", "hba1c", "ecg_findings"],
        "clinical_standard_name": "American Heart Association (AHA) / American College of Cardiology (ACC)",
        "clinical_formula": "AHA PREVENT™ (2023) / ASCVD Risk Estimator",
        "why_waiting": "Blood Pressure and Cholesterol values (Total Cholesterol & HDL) are required to compute an evidence-based 10-year cardiovascular assessment under AHA PREVENT™ guidelines."
    },
    "kidneys": {
        "organ_name": "Kidney",
        "required_reports": ["Kidney Function Test (KFT / RFT)"],
        "required_biomarkers": ["serum_creatinine"],
        "optional_biomarkers": ["blood_urea_nitrogen", "serum_sodium", "uacr", "urine_protein"],
        "clinical_standard_name": "Kidney Disease: Improving Global Outcomes (KDIGO)",
        "clinical_formula": "CKD-EPI 2021 Race-Free eGFR Equation",
        "why_waiting": "Serum Creatinine is required to estimate kidney filtration rate (eGFR) and determine clinical kidney stage according to KDIGO standards."
    },
    "liver": {
        "organ_name": "Liver",
        "required_reports": ["Liver Function Test (LFT)"],
        "required_biomarkers": ["total_bilirubin", "inr"],
        "optional_biomarkers": ["ast", "alt", "platelets", "serum_albumin", "serum_sodium"],
        "clinical_standard_name": "Organ Procurement and Transplantation Network (OPTN) & AASLD",
        "clinical_formula": "MELD-Na (2016) / FIB-4 Hepatic Fibrosis Index",
        "why_waiting": "Bilirubin and INR reports (or AST, ALT, Platelets) are required to evaluate liver synthetic function and hepatic fibrosis using OPTN/AASLD validated clinical models."
    },
    "lungs": {
        "organ_name": "Lungs",
        "required_reports": ["Pulmonary Function Test (PFT) / Spirometry"],
        "required_biomarkers": ["fev1_pct_predicted", "fev1_fvc_ratio"],
        "optional_biomarkers": ["spo2", "smoking_pack_years"],
        "clinical_standard_name": "Global Initiative for Chronic Obstructive Lung Disease (GOLD)",
        "clinical_formula": "GOLD 2026 Spirometric Severity Classification",
        "why_waiting": "Spirometry measurements (FEV1 % Predicted and FEV1/FVC Ratio) are required to grade airflow limitation and pulmonary health under international GOLD standards."
    },
    "brain": {
        "organ_name": "Brain",
        "required_reports": ["ECG / Neurological Clinical Evaluation"],
        "required_biomarkers": ["has_atrial_fibrillation", "systolic_bp"],
        "optional_biomarkers": ["history_of_stroke", "vascular_disease"],
        "clinical_standard_name": "European Society of Cardiology (ESC) & ACC",
        "clinical_formula": "CHA₂DS₂-VASc Stroke Risk Index",
        "why_waiting": "Cardiovascular rhythm and blood pressure evaluations are required to estimate cerebrovascular stroke risk using the CHA₂DS₂-VASc clinical framework."
    }
}


def evaluate_clinical_readiness(available_biomarkers: Dict[str, Any], uploaded_reports: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Evaluates module readiness for each organ based on available verified lab data.
    """
    available_keys = set(available_biomarkers.keys()) if available_biomarkers else set()
    readiness_result = {}
    total_active = 0
    total_modules = len(ORGAN_ACTIVATION_SPECS)

    for organ_key, spec in ORGAN_ACTIVATION_SPECS.items():
        req_biomarkers = spec["required_biomarkers"]
        present_biomarkers = [b for b in req_biomarkers if b in available_keys and available_biomarkers[b] is not None]
        missing_biomarkers = [b for b in req_biomarkers if b not in present_biomarkers]

        is_ready = len(missing_biomarkers) == 0

        if is_ready:
            status = "Ready"
            total_active += 1
        elif len(present_biomarkers) > 0:
            status = "Partially Ready"
        else:
            status = "Waiting for Reports"

        readiness_result[organ_key] = {
            "organ_name": spec["organ_name"],
            "status": status,
            "is_ready": is_ready,
            "required_reports": spec["required_reports"],
            "required_biomarkers": req_biomarkers,
            "present_biomarkers": present_biomarkers,
            "missing_biomarkers": missing_biomarkers,
            "clinical_standard": spec["clinical_standard_name"],
            "clinical_formula": spec["clinical_formula"],
            "why_waiting": spec["why_waiting"] if not is_ready else f"Clinical biomarkers verified. Assessment active under {spec['clinical_standard_name']}."
        }

    overall_twin_status = "profile_only"
    if total_active == total_modules:
        overall_twin_status = "twin_active"
    elif total_active > 0:
        overall_twin_status = "partial_clinical"

    return {
        "digital_twin_status": overall_twin_status,
        "active_modules_count": total_active,
        "total_modules_count": total_modules,
        "organ_readiness": readiness_result
    }
