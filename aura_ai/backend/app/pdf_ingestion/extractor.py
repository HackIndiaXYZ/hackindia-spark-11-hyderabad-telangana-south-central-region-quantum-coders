from __future__ import annotations

import json
from typing import Dict, Any, Optional

PRODUCTION_EXTRACTION_PROMPT = """# ROLE
You are a Medical Document Extraction Engine.
This is NOT a medical chatbot. Do NOT summarize. Do NOT generate advice. Do NOT hallucinate.
Your ONLY responsibility is to extract structured information exactly as it appears in the uploaded medical document.

------------------------------------------------------------
OBJECTIVE
Extract every possible clinical field from the uploaded prescription or medical document.
If a field is unreadable or not present in the document, return value: null.
Never guess. Never invent values.

------------------------------------------------------------
DOCUMENT TYPE CLASSIFICATION
Classify first.
Possible values:
- Prescription
- Consultation Note
- Laboratory Report
- Blood Test
- Discharge Summary
- Radiology Report
- Medical Certificate
- Unknown

Return classification_confidence (0.00 - 1.00).

------------------------------------------------------------
STRICT EXTRACTION RULES
Only return information visible inside the document.
Never use placeholder values.
NEVER generate:
- "Attending Physician"
- "Prescribed Clinical Medication"
- "As Directed"
- "Daily"
- "7 Days"
- "Follow prescribed treatment"
- "Max Healthcare"
unless those exact words exist inside the document text or image.

------------------------------------------------------------
FOR EVERY EXTRACTED FIELD INCLUDE:
{
  "value": "string or null",
  "confidence": 0.00,
  "reason": "Direct text match or spatial location explanation"
}

If handwriting cannot be read, return "value": null. Do NOT guess.

------------------------------------------------------------
REQUIRED JSON OUTPUT SCHEMA:
{
  "document_type": "Prescription | Consultation Note | Laboratory Report | Blood Test | Discharge Summary | Radiology Report | Medical Certificate | Unknown",
  "classification_confidence": 0.95,
  "hospital": {
    "name": { "value": "string or null", "confidence": 0.00, "reason": "string" },
    "department": { "value": "string or null", "confidence": 0.00, "reason": "string" },
    "address": { "value": "string or null", "confidence": 0.00, "reason": "string" }
  },
  "doctor": {
    "name": { "value": "string or null", "confidence": 0.00, "reason": "string" },
    "qualification": { "value": "string or null", "confidence": 0.00, "reason": "string" },
    "specialization": { "value": "string or null", "confidence": 0.00, "reason": "string" },
    "registration_number": { "value": "string or null", "confidence": 0.00, "reason": "string" }
  },
  "patient": {
    "name": { "value": "string or null", "confidence": 0.00, "reason": "string" },
    "age": { "value": "string or null", "confidence": 0.00, "reason": "string" },
    "gender": { "value": "string or null", "confidence": 0.00, "reason": "string" }
  },
  "visit_date": { "value": "string YYYY-MM-DD or null", "confidence": 0.00, "reason": "string" },
  "diagnosis": { "value": "string or null", "confidence": 0.00, "reason": "string" },
  "chief_complaints": { "value": "string or null", "confidence": 0.00, "reason": "string" },
  "symptoms": { "value": "string or null", "confidence": 0.00, "reason": "string" },
  "clinical_notes": { "value": "string or null", "confidence": 0.00, "reason": "string" },
  "medicines": [
    {
      "name": { "value": "string or null", "confidence": 0.00, "reason": "string" },
      "strength": { "value": "string or null", "confidence": 0.00, "reason": "string" },
      "dosage": { "value": "string or null", "confidence": 0.00, "reason": "string" },
      "frequency": { "value": "string or null", "confidence": 0.00, "reason": "string" },
      "duration": { "value": "string or null", "confidence": 0.00, "reason": "string" },
      "instructions": { "value": "string or null", "confidence": 0.00, "reason": "string" }
    }
  ],
  "investigations": [
    { "value": "string", "confidence": 0.00, "reason": "string" }
  ],
  "advice": { "value": "string or null", "confidence": 0.00, "reason": "string" },
  "follow_up": { "value": "string or null", "confidence": 0.00, "reason": "string" },
  "raw_summary": "Strictly factual summary of extracted items. No advice.",
  "ocr_quality": {
    "overall_confidence": 0.90,
    "image_quality": "Excellent | Good | Fair | Poor",
    "requires_manual_review": false
  }
}

Return ONLY valid JSON. No conversational text.
"""

class StructuredMedicalExtractor:
    """
    Production Zero-Hallucination Medical Document Extraction Engine.
    Strictly extracts visible text with confidence scoring and null defaults.
    Includes stage-level debugging loggers for full end-to-end tracing.
    """

    @classmethod
    def extract(
        cls,
        content: str,
        doc_type: str,
        model_service: Any = None,
        file_bytes: Optional[bytes] = None,
        mime_type: str = "application/pdf"
    ) -> Dict[str, Any]:
        if not model_service:
            return cls._heuristic_extraction(content, doc_type)

        prompt = f"{PRODUCTION_EXTRACTION_PROMPT}\n\nRAW EXTRACTED TEXT:\n{content[:6000]}"
        return cls._call_gemini(prompt, model_service, doc_type, file_bytes, mime_type)

    @classmethod
    def _call_gemini(
        cls,
        prompt: str,
        model_service: Any,
        doc_type: str,
        file_bytes: Optional[bytes] = None,
        mime_type: str = "application/pdf"
    ) -> Dict[str, Any]:
        try:
            content_input: list[Any] = [prompt]
            has_bytes = bool(file_bytes and len(file_bytes) > 0)
            if has_bytes:
                content_input.append({"mime_type": mime_type, "data": file_bytes})

            print("\n=======================================================")
            print("--- STAGE 1: INPUT SENT TO GEMINI VISION ---")
            print(f"Doc Type: {doc_type}")
            print(f"MIME Type: {mime_type}")
            print(f"Has Bytes Transmitted: {has_bytes} ({len(file_bytes) if file_bytes else 0} bytes)")
            print(f"Prompt Length: {len(prompt)} chars")
            print("=======================================================\n")

            response = model_service.generate_content(content_input)
            raw_text = response.text.strip()

            print("\n=======================================================")
            print("--- STAGE 2: COMPLETE RAW GEMINI RESPONSE ---")
            print(raw_text)
            print("=======================================================\n")

            json_str = raw_text
            if "```json" in json_str:
                json_str = json_str.split("```json")[-1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[-1].split("```")[0].strip()

            res = json.loads(json_str)

            print("\n=======================================================")
            print("--- STAGE 3: PARSED JSON OBJECT ---")
            print(json.dumps(res, indent=2))
            print("=======================================================\n")

            return res
        except Exception as e:
            print(f"[GEMINI VISION EXTRACTION ERROR] {e}")
            return cls._heuristic_extraction(prompt, doc_type)

    @classmethod
    def _heuristic_extraction(cls, content: str, doc_type: str) -> Dict[str, Any]:
        """Strict non-hallucinating heuristic fallback returning NULL containers."""
        return {
            "document_type": "Unknown",
            "classification_confidence": 0.0,
            "hospital": {
                "name": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
                "department": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
                "address": {"value": None, "confidence": 0.0, "reason": "Unreadable"}
            },
            "doctor": {
                "name": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
                "qualification": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
                "specialization": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
                "registration_number": {"value": None, "confidence": 0.0, "reason": "Unreadable"}
            },
            "patient": {
                "name": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
                "age": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
                "gender": {"value": None, "confidence": 0.0, "reason": "Unreadable"}
            },
            "visit_date": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
            "diagnosis": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
            "chief_complaints": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
            "symptoms": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
            "clinical_notes": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
            "medicines": [],
            "investigations": [],
            "advice": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
            "follow_up": {"value": None, "confidence": 0.0, "reason": "Unreadable"},
            "raw_summary": "Document unreadable or extraction offline.",
            "ocr_quality": {
                "overall_confidence": 0.0,
                "image_quality": "Poor",
                "requires_manual_review": True
            }
        }
