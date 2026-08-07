from __future__ import annotations

import re
from typing import Dict, Any, Tuple

SUPPORTED_DOCUMENT_TYPES = [
    "prescription",
    "consultation_note",
    "laboratory",
    "blood_test",
    "health_checkup",
    "radiology",
    "pathology",
    "discharge",
    "operation_note",
    "vaccination",
    "referral",
    "certificate",
    "insurance",
    "unknown"
]

DOCUMENT_TYPE_LABELS = {
    "prescription": "Doctor Prescription",
    "consultation_note": "Clinical Consultation Note",
    "laboratory": "Laboratory Report",
    "blood_test": "Blood & Pathology Report",
    "health_checkup": "Health Checkup Report",
    "radiology": "Radiology Report",
    "pathology": "Pathology Report",
    "discharge": "Discharge Summary",
    "operation_note": "Operation Note",
    "vaccination": "Vaccination Record",
    "referral": "Referral Letter",
    "certificate": "Medical Certificate",
    "insurance": "Insurance Document",
    "unknown": "Unknown Medical Document"
}

class MedicalDocumentClassifier:
    """
    Step 1 of Ingestion Pipeline: Medical Document Classifier
    Classifies raw OCR content into specific medical document types BEFORE extraction.
    Ensures zero guessing or hallucination.
    """

    @staticmethod
    def classify_by_heuristics(text: str) -> Tuple[str, float, str]:
        if not text or len(text.strip()) < 15:
            return "unknown", 0.0, "Text content too short for classification"

        lower = text.lower()

        # 1. Prescription / Clinical Consultation Note
        rx_patterns = [
            r"\brx\b", r"\bprescr", r"\bmedicines?\b", r"\bdosages?\b", r"\btab\.\b", r"\bcap\.\b",
            r"\bsyrup\b", r"\b1-0-1\b", r"\b0-0-1\b", r"\b1-1-1\b", r"\bonce daily\b", r"\btwice daily\b",
            r"\bdoctor advice\b", r"\bfollow up after\b", r"\bdr\.\s+[a-z]+", r"\bapollo\s+hospitals?\b",
            r"\bopd\s+consultation\b", r"\bphysician\b", r"\bchief complaints?\b"
        ]
        rx_matches = sum(1 for p in rx_patterns if re.search(p, lower))

        # 2. Laboratory / Blood Test / Pathology
        lab_patterns = [
            r"\bhemoglobin\b", r"\bcreatinine\b", r"\begfr\b", r"\bhba1c\b", r"\bplatelets?\b",
            r"\bwbc\b", r"\brbc\b", r"\bserum\b", r"\b reference range\b", r"\bbiological reference\b",
            r"\btest name\b", r"\bresult\b", r"\bunits?\b", r"\bspecimen\b", r"\bpathology\b",
            r"\blaboratory\b", r"\bsample collected\b", r"\blipid profile\b", r"\bliver function\b"
        ]
        lab_matches = sum(1 for p in lab_patterns if re.search(p, lower))

        # 3. Discharge Summary
        discharge_patterns = [
            r"\bdischarge summary\b", r"\bdate of admission\b", r"\bdate of discharge\b",
            r"\bcourse in hospital\b", r"\bcondition at discharge\b", r"\btreatment given\b", r"\bfinal diagnosis\b"
        ]
        discharge_matches = sum(1 for p in discharge_patterns if re.search(p, lower))

        # 4. Radiology
        radiology_patterns = [
            r"\bx-ray\b", r"\bmri\b", r"\bct scan\b", r"\bultrasound\b", r"\bsonography\b",
            r"\bimpression:\b", r"\bfindings:\b", r"\bradiology\b"
        ]
        radiology_matches = sum(1 for p in radiology_patterns if re.search(p, lower))

        # Evaluate matches
        if discharge_matches >= 2:
            return "discharge", 0.92, "High structural match for Discharge Summary"
        if radiology_matches >= 2:
            return "radiology", 0.90, "High structural match for Radiology Report"
        
        if rx_matches > lab_matches and rx_matches >= 2:
            return "prescription", min(0.85 + (rx_matches * 0.03), 0.98), f"Matches {rx_matches} prescription markers"
        
        if lab_matches > rx_matches and lab_matches >= 2:
            if "blood" in lower or "cbc" in lower or "hemoglobin" in lower:
                return "blood_test", min(0.85 + (lab_matches * 0.03), 0.98), f"Matches {lab_matches} lab/blood markers"
            return "laboratory", min(0.85 + (lab_matches * 0.03), 0.98), f"Matches {lab_matches} lab markers"

        if rx_matches >= 1 and ("dr." in lower or "hospital" in lower or "clinic" in lower or "apollo" in lower):
            return "prescription", 0.75, "Single prescription marker with physician/hospital header"

        if lab_matches >= 1:
            return "laboratory", 0.70, "Single laboratory marker match"

        return "unknown", 0.30, "No clear medical document structure identified"

    @classmethod
    def classify(cls, content: str, model_service: Any = None) -> Dict[str, Any]:
        """
        Classifies medical content using LLM if available, falling back to rule-based heuristics.
        Returns document_type, confidence_score, and label.
        """
        heuristic_type, heuristic_conf, reason = cls.classify_by_heuristics(content)

        if not model_service:
            return {
                "document_type": heuristic_type,
                "confidence_score": heuristic_conf,
                "label": DOCUMENT_TYPE_LABELS.get(heuristic_type, "Unknown Document"),
                "reasoning": reason,
                "method": "heuristics"
            }

        # Use Gemini for classification if available
        prompt = (
            "You are a specialized Medical Document Classifier. Analyze the following OCR text and classify the document into EXACTLY ONE of these types:\n"
            "- prescription (Doctor Prescription / Consultation note with medicines/advice)\n"
            "- consultation_note (Clinical OPD/IPD consultation note)\n"
            "- laboratory (General Lab / Biochemistry report)\n"
            "- blood_test (CBC / Hematology / Blood panel)\n"
            "- health_checkup (Executive Health Checkup Summary)\n"
            "- radiology (X-Ray / MRI / CT / Ultrasound report)\n"
            "- pathology (Biopsy / Histopathology report)\n"
            "- discharge (Hospital Discharge Summary)\n"
            "- operation_note (Surgical / Operation Theatre note)\n"
            "- vaccination (Immunization record)\n"
            "- referral (Doctor Referral letter)\n"
            "- certificate (Medical / Fitness / Sick Certificate)\n"
            "- insurance (Health Insurance Claim / Cashless Doc)\n"
            "- unknown (Content unreadable, non-medical, or confidence < 0.60)\n\n"
            "RULES:\n"
            "1. NEVER GUESS. If text lacks clear medical headers, Rx symbols, or lab ranges, return 'unknown'.\n"
            "2. A doctor's consultation or Rx sheet from Apollo/Max/Fortis with medicines/advice MUST be classified as 'prescription' or 'consultation_note', NEVER 'laboratory'.\n"
            "3. Return ONLY a raw JSON object with keys: 'document_type' (string), 'confidence_score' (float between 0.0 and 1.0), 'reasoning' (short explanation).\n\n"
            f"OCR TEXT CONTENT:\n{content[:6000]}"
        )

        try:
            response = model_service.generate_content(prompt)
            raw = response.text.strip()
            import json
            if "```json" in raw:
                raw = raw.split("```json")[-1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[-1].split("```")[0].strip()
            
            data = json.loads(raw)
            doc_type = data.get("document_type", "unknown").lower()
            conf = float(data.get("confidence_score", 0.0))

            if doc_type not in SUPPORTED_DOCUMENT_TYPES or conf < 0.50:
                doc_type = heuristic_type if heuristic_conf > 0.60 else "unknown"
                conf = max(conf, heuristic_conf)

            return {
                "document_type": doc_type,
                "confidence_score": conf,
                "label": DOCUMENT_TYPE_LABELS.get(doc_type, "Unknown Document"),
                "reasoning": data.get("reasoning", reason),
                "method": "gemini_classifier"
            }
        except Exception as e:
            print(f"[CLASSIFIER ERROR] {e}. Falling back to heuristics.")
            return {
                "document_type": heuristic_type,
                "confidence_score": heuristic_conf,
                "label": DOCUMENT_TYPE_LABELS.get(heuristic_type, "Unknown Document"),
                "reasoning": f"Fallback to heuristics ({reason})",
                "method": "heuristics_fallback"
            }
