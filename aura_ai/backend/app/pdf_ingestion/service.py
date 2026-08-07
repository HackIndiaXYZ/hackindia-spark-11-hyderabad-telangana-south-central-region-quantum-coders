from __future__ import annotations

from pathlib import Path
from pypdf import PdfReader
from ..knowledge_store.store import KnowledgeStore
from ..reasoning_engine.llm_writer import LLMWriterConfig

from .preprocessing import OpenCVDocumentPreprocessor
from .layout_segmenter import LayoutRegionSegmenter
from .deterministic_classifier import DeterministicLayoutClassifier
from .extractor import StructuredMedicalExtractor
from .validator import MedicalRecordValidator
from .local_ocr_engine import LocalOCREngineManager
from .medical_ner_extractor import LocalMedicalNERExtractor
from .confidence_engine import DeterministicConfidenceEngine

import google.generativeai as genai
import json
import os


class PDFIngestionService:
    def __init__(self, knowledge_store: KnowledgeStore, config: LLMWriterConfig | None = None) -> None:
        self.knowledge_store = knowledge_store
        self.config = config or LLMWriterConfig()
        self._model = None
        print(f"[BOOT] PDFIngestionService initialized with Hybrid Gemini Vision & Deterministic Pipeline.")

    @property
    def model(self):
        if self._model is not None:
            return self._model
        api_key = os.getenv("GEMINI_API_KEY_2") or os.getenv("GEMINI_API_KEY_1") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        try:
            genai.configure(api_key=api_key)
            self._model = genai.GenerativeModel("gemini-2.0-flash")
            print(f"[AI VISION] Gemini Model initialized with API Key: {self._model.model_name}")
            return self._model
        except Exception as e:
            print(f"[AI VISION ERROR] Could not initialize Gemini Vision: {e}")
            return None

    def ingest_pdf(self, pdf_path: str, title: str | None = None) -> dict[str, object]:
        """
        Hybrid Medical Ingestion Pipeline:
        Gemini Vision OCR + Deterministic Layout Classifier + Medical Schema Validation
        """
        path = Path(pdf_path)
        reader = PdfReader(str(path))
        pages: list[str] = []
        for page in reader.pages:
            pages.append(page.extract_text() or "")
        content = "\n\n".join(pages).strip()
        resolved_title = title or path.stem

        # STEP 1: OpenCV PREPROCESSING & SEGMENTATION
        raw_bytes = path.read_bytes() if path.exists() and path.is_file() else b""
        processed_bytes, prep_metrics = OpenCVDocumentPreprocessor.preprocess_image(raw_bytes)
        segmented_regions = LayoutRegionSegmenter.segment_text_blocks(content)

        # STEP 2: DETERMINISTIC DOCUMENT CLASSIFICATION
        classification = DeterministicLayoutClassifier.classify(content, segmented_regions["header"], segmented_regions["body"])
        doc_type = classification["document_type"]
        print(f"[PIPELINE CLASSIFIER] Classified '{path.name}' as: '{doc_type}' ({classification['label']}, Conf: {classification['confidence_score']:.2f})")

        # STEP 3: STRUCTURED EXTRACTION (GEMINI VISION MULTIMODAL BYTES IF KEY LOADED)
        extracted_data = {}
        mime_type = "application/pdf"
        if path.suffix.lower() == ".png":
            mime_type = "image/png"
        elif path.suffix.lower() in [".jpg", ".jpeg"]:
            mime_type = "image/jpeg"

        if self.model:
            print(f"[AI VISION] Running Gemini Vision Extraction on '{path.name}' ({len(raw_bytes)} bytes, {mime_type})...")
            extracted_data = StructuredMedicalExtractor.extract(content, doc_type, self.model, file_bytes=raw_bytes, mime_type=mime_type)
        else:
            print(f"[LOCAL NER] Gemini offline. Running Local RegEx & Pharmacopoeia NER...")
            hosp = LocalMedicalNERExtractor.extract_hospital(content)
            doc = LocalMedicalNERExtractor.extract_doctor(content)
            meds = LocalMedicalNERExtractor.extract_medicines(content)
            diag = LocalMedicalNERExtractor.extract_diagnosis(content)
            extracted_data = {
                "hospital_name": hosp["value"],
                "doctor_name": doc["value"],
                "primary_diagnosis": diag["value"],
                "medicines": meds,
                "ai_summary": f"Document classified as {classification['label']}. Extracted via Local NER."
            }

        # STEP 4: SCHEMA VALIDATION & ZERO HALLUCINATION CLEANUP
        validation = MedicalRecordValidator.validate(classification, extracted_data, content)
        validated_record = validation["record"]

        # Store in KnowledgeStore
        document_id = self.knowledge_store.ingest_text_document(
            source_type="pdf",
            title=resolved_title,
            source_ref=str(path.resolve()),
            content=content,
            metadata={"pages": len(reader.pages), "document_type": doc_type, "confidence": classification["confidence_score"]},
        )

        print("\n=======================================================")
        print("--- STAGE 4: VALUES WRITTEN TO DATABASE / KNOWLEDGE STORE ---")
        print(f"Document ID: {document_id}")
        print("Validated Record:")
        print(json.dumps(validated_record, indent=2))
        print("=======================================================\n")

        return {
            "document_id": document_id,
            "title": resolved_title,
            "pages": len(reader.pages),
            "characters": len(content),
            "classification": classification,
            "record": validated_record,
            "extracted_data": extracted_data,
            "content": content,
        }

    def analyze_pdf(self, content: str, language: str) -> dict[str, object]:
        """Runs hybrid extraction on raw content."""
        classification = DeterministicLayoutClassifier.classify(content)
        doc_type = classification["document_type"]

        extracted = {}
        if self.model:
            extracted = StructuredMedicalExtractor.extract(content, doc_type, self.model)
        else:
            hosp = LocalMedicalNERExtractor.extract_hospital(content)
            doc = LocalMedicalNERExtractor.extract_doctor(content)
            meds = LocalMedicalNERExtractor.extract_medicines(content)
            diag = LocalMedicalNERExtractor.extract_diagnosis(content)
            extracted = {
                "hospital_name": hosp["value"],
                "doctor_name": doc["value"],
                "primary_diagnosis": diag["value"],
                "medicines": meds,
                "ai_summary": f"Document classified as {classification['label']}."
            }

        validation = MedicalRecordValidator.validate(classification, extracted, content)
        rec = validation["record"]

        return {
            "summary": rec["aiSummary"],
            "document_type": doc_type,
            "document_label": classification["label"],
            "confidence_score": classification["confidence_score"],
            "validation_status": rec["validationStatus"],
            "hospital_name": rec["hospitalName"],
            "doctor_name": rec["doctorName"],
            "doctor_specialization": rec["doctorSpecialization"],
            "primary_diagnosis": rec["primaryDiagnosis"],
            "symptoms": rec["symptoms"],
            "medicines": rec["medicines"],
            "lab_values": rec["labValues"],
            "doctor_advice": rec["doctorAdvice"],
            "timeline_category": rec["timelineCategory"],
            "key_findings": [f"Document Type: {classification['label']} (Confidence: {int(classification['confidence_score'] * 100)}%)"],
            "organ_impacts": {},
            "recommendations": [rec["doctorAdvice"]],
            "language": language
        }
