from __future__ import annotations

import re
from typing import Dict, Any, Tuple

DOCUMENT_TYPE_LABELS = {
    "cardiac_panel": "Cardiac & Lipid Panel Report",
    "renal_panel": "Renal & Kidney Function Test (KFT)",
    "hepatic_panel": "Hepatic & Liver Function Test (LFT)",
    "pulmonary_panel": "Pulmonary Function Test (PFT)",
    "brain_panel": "Neurological & Cardio-Vascular Report",
    "laboratory": "Laboratory & Blood Report",
    "prescription": "Clinical OPD Consultation",
    "discharge": "Discharge Summary",
    "radiology": "Radiology Imaging Report",
    "unknown": "General Medical Document"
}

class DeterministicLayoutClassifier:
    """
    Component 2: Deterministic Document Classifier.
    Classifies documents using header structure, lab parameter detection, typography,
    and medical vocabulary WITHOUT ANY LLM DEPENDENCY.
    """

    @classmethod
    def classify(cls, text: str, header_text: str = "", body_text: str = "") -> Dict[str, Any]:
        if not text or len(text.strip()) < 10:
            return {
                "document_type": "unknown",
                "label": DOCUMENT_TYPE_LABELS["unknown"],
                "confidence_score": 0.0,
                "reasoning": "Text too short for classification",
                "method": "deterministic_rules",
                "target_organ": None
            }

        full_lower = text.lower()

        # 1. Cardiac & Lipid Panel Rules -> Heart Module
        cardiac_keywords = ["lipid profile", "cardiac panel", "total cholesterol", "ldl cholesterol", "hdl cholesterol", "triglycerides", "systolic blood pressure", "diastolic blood pressure", "cholesterol", "lipid", "cardiac"]
        cardiac_score = sum(1 for k in cardiac_keywords if k in full_lower)
        if cardiac_score >= 1 or "lipid" in full_lower or "cholesterol" in full_lower or "cardiac" in full_lower:
            return {
                "document_type": "cardiac_panel",
                "label": DOCUMENT_TYPE_LABELS["cardiac_panel"],
                "confidence_score": min(0.98, 0.85 + (cardiac_score * 0.04)),
                "reasoning": f"Matched {cardiac_score} cardiac & lipid panel markers",
                "method": "deterministic_rules",
                "target_organ": "heart"
            }

        # 2. Renal & Kidney Function Rules -> Kidney Module
        renal_keywords = ["renal panel", "kidney function", "kft", "rft", "serum creatinine", "blood urea nitrogen", "bun", "egfr", "uacr", "blood urea", "creatinine"]
        renal_score = sum(1 for k in renal_keywords if k in full_lower)
        if renal_score >= 1 or "creatinine" in full_lower or "kft" in full_lower or "renal" in full_lower:
            return {
                "document_type": "renal_panel",
                "label": DOCUMENT_TYPE_LABELS["renal_panel"],
                "confidence_score": min(0.98, 0.85 + (renal_score * 0.04)),
                "reasoning": f"Matched {renal_score} renal & KFT markers",
                "method": "deterministic_rules",
                "target_organ": "kidneys"
            }

        # 3. Hepatic & Liver Function Rules -> Liver Module
        hepatic_keywords = ["hepatic panel", "liver function", "lft", "total bilirubin", "sgot", "sgpt", "ast", "alt", "prothrombin time", "inr", "alkaline phosphatase", "bilirubin"]
        hepatic_score = sum(1 for k in hepatic_keywords if k in full_lower)
        if hepatic_score >= 1 or "bilirubin" in full_lower or "lft" in full_lower or "hepatic" in full_lower:
            return {
                "document_type": "hepatic_panel",
                "label": DOCUMENT_TYPE_LABELS["hepatic_panel"],
                "confidence_score": min(0.98, 0.85 + (hepatic_score * 0.04)),
                "reasoning": f"Matched {hepatic_score} hepatic & LFT markers",
                "method": "deterministic_rules",
                "target_organ": "liver"
            }

        # 4. Pulmonary Function Rules -> Lung Module
        pulmonary_keywords = ["pulmonary function", "spirometry", "pft", "fev1", "fev1/fvc", "fvc", "peak flow", "spo2"]
        pulmonary_score = sum(1 for k in pulmonary_keywords if k in full_lower)
        if pulmonary_score >= 1 or "spirometry" in full_lower or "pft" in full_lower:
            return {
                "document_type": "pulmonary_panel",
                "label": DOCUMENT_TYPE_LABELS["pulmonary_panel"],
                "confidence_score": min(0.98, 0.85 + (pulmonary_score * 0.04)),
                "reasoning": f"Matched {pulmonary_score} pulmonary & spirometry markers",
                "method": "deterministic_rules",
                "target_organ": "lungs"
            }

        # 5. Discharge Summary Rules
        discharge_keywords = ["discharge summary", "date of admission", "date of discharge", "course in hospital", "condition at discharge"]
        discharge_score = sum(1 for k in discharge_keywords if k in full_lower)
        if discharge_score >= 2:
            return {
                "document_type": "discharge",
                "label": DOCUMENT_TYPE_LABELS["discharge"],
                "confidence_score": 0.92,
                "reasoning": f"Matched {discharge_score} discharge summary structural headers",
                "method": "deterministic_rules",
                "target_organ": None
            }

        # 6. Radiology Rules
        radiology_keywords = ["x-ray", "mri", "ct scan", "ultrasound", "sonography", "impression:"]
        radiology_score = sum(1 for k in radiology_keywords if k in full_lower)
        if radiology_score >= 2:
            return {
                "document_type": "radiology",
                "label": DOCUMENT_TYPE_LABELS["radiology"],
                "confidence_score": 0.90,
                "reasoning": f"Matched {radiology_score} radiology structural headers",
                "method": "deterministic_rules",
                "target_organ": None
            }

        # 7. General Lab / Blood Test
        if "test name" in full_lower or "result" in full_lower or "ref:" in full_lower or "reference range" in full_lower:
            return {
                "document_type": "laboratory",
                "label": DOCUMENT_TYPE_LABELS["laboratory"],
                "confidence_score": 0.85,
                "reasoning": "Detected general lab reference range formatting",
                "method": "deterministic_rules",
                "target_organ": None
            }

        # 8. True Doctor OPD Prescription (Whole word regex matching to avoid "cap" matching "kapoor")
        rx_med_patterns = [r"\btab\b", r"\bcap\b", r"\bsyrup\b", r"\b1-0-1\b", r"\b0-0-1\b", r"\b1-1-1\b", r"\b1-0-0\b", r"\bonce daily\b", r"\btwice daily\b"]
        if any(re.search(pat, full_lower) for pat in rx_med_patterns):
            return {
                "document_type": "prescription",
                "label": DOCUMENT_TYPE_LABELS["prescription"],
                "confidence_score": 0.85,
                "reasoning": "Matched OPD Rx medication dosing patterns",
                "method": "deterministic_rules",
                "target_organ": None
            }

        return {
            "document_type": "laboratory",
            "label": DOCUMENT_TYPE_LABELS["laboratory"],
            "confidence_score": 0.80,
            "reasoning": "General laboratory medical report",
            "method": "deterministic_rules",
            "target_organ": None
        }
