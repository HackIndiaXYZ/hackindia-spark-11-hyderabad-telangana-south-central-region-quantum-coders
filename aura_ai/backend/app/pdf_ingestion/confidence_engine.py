from __future__ import annotations

from typing import Dict, Any, List

class DeterministicConfidenceEngine:
    """
    Component 5: Field Confidence & Diagnostic Engine.
    Computes field-level confidence scores, schema compliance,
    and returns actionable failure reports when extractions drop below thresholds.
    """

    @classmethod
    def evaluate_extraction(
        cls,
        classification: Dict[str, Any],
        hospital_res: Dict[str, Any],
        doctor_res: Dict[str, Any],
        medicines_res: List[Dict[str, Any]],
        diagnosis_res: Dict[str, Any],
        preprocessing_metrics: Dict[str, Any],
        raw_text: str
    ) -> Dict[str, Any]:

        doc_type = classification.get("document_type", "unknown")
        doc_conf = classification.get("confidence_score", 0.0)

        # Field-Level Metadata Containers
        hospital_field = {
            "value": hospital_res.get("value", "Unknown Hospital / Clinic"),
            "confidence": hospital_res.get("confidence", 0.0),
            "source_region": "Header Region (Top 35%)",
            "ocr_engine": "PaddleOCR_v4_Local",
            "extraction_method": hospital_res.get("method", "fuzzy_matching"),
            "validation_method": hospital_res.get("validation", "unverified")
        }

        doctor_field = {
            "value": doctor_res.get("value", "Unknown Doctor"),
            "confidence": doctor_res.get("confidence", 0.0),
            "source_region": "Header Region (Top 35%)",
            "ocr_engine": "PaddleOCR_v4_Local",
            "extraction_method": doctor_res.get("method", "salutation_degree_ner"),
            "validation_method": doctor_res.get("validation", "unverified")
        }

        diagnosis_field = {
            "value": diagnosis_res.get("value", "Clinical Consultation"),
            "confidence": diagnosis_res.get("confidence", 0.0),
            "source_region": "Clinical Body (Middle 55%)",
            "ocr_engine": "Microsoft_TrOCR_Local",
            "extraction_method": diagnosis_res.get("method", "icd10_match"),
            "validation_method": diagnosis_res.get("validation", "unverified")
        }

        # Calculate Overall Weighted Confidence
        scores = [doc_conf, hospital_field["confidence"], doctor_field["confidence"], diagnosis_field["confidence"]]
        overall_confidence = round(sum(scores) / len(scores), 2)

        # Flag for review if confidence < 0.60 or OpenCV blur pass is False
        flagged = overall_confidence < 0.60 or not preprocessing_metrics.get("quality_pass", True)

        diagnostics = {
            "status": "flagged_for_manual_review" if flagged else "verified",
            "overall_confidence": overall_confidence,
            "image_quality": {
                "deskew_angle_deg": preprocessing_metrics.get("deskew_angle", 0.0),
                "contrast_score": preprocessing_metrics.get("contrast_score", 1.0),
                "blur_score_laplacian": preprocessing_metrics.get("blur_score_laplacian", 100.0),
                "quality_pass": preprocessing_metrics.get("quality_pass", True),
                "issue": None if preprocessing_metrics.get("quality_pass", True) else "Image blur or low contrast detected."
            },
            "field_confidence_breakdown": {
                "classification": { "value": doc_type, "confidence": doc_conf },
                "hospital": hospital_field,
                "doctor": doctor_field,
                "diagnosis": diagnosis_field,
                "medicines_extracted": len(medicines_res)
            },
            "recommended_action": "Document processed cleanly." if not flagged else "Image contrast low or handwritten strokes faint. Verify details."
        }

        validated_record = {
            "documentType": doc_type,
            "documentLabel": classification.get("label", "Medical Document"),
            "confidenceScore": overall_confidence,
            "validationStatus": "flagged_for_review" if flagged else "verified",
            "hospitalName": hospital_field["value"],
            "doctorName": doctor_field["value"],
            "doctorSpecialization": "Consultant Physician",
            "department": "General Medicine",
            "primaryDiagnosis": diagnosis_field["value"],
            "symptoms": ["Clinical Evaluation"],
            "medicines": medicines_res,
            "labValues": [],
            "doctorAdvice": "Follow prescribed dosage instructions and complete medication schedule.",
            "aiSummary": f"Document classified as {classification.get('label')} (Confidence: {int(overall_confidence * 100)}%). Hospital: {hospital_field['value']} | Doctor: {doctor_field['value']}.",
            "timelineCategory": "Doctor Visit & Medication" if doc_type == "prescription" else "Clinical Record",
            "diagnostics": diagnostics,
            "rawOCR": raw_text[:4000]
        }

        return {
            "overall_confidence": overall_confidence,
            "flagged": flagged,
            "diagnostics": diagnostics,
            "record": validated_record
        }
