# AURA Health - Technical Architecture and Developer Handbook

> **Version**: 2.0 - Production Documentation
> **Status**: Production Complete
> **Scope**: Full-Stack Read-Only Architecture Reference
> **Purpose**: Allow any developer to understand the entire system without reading the source code.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Folder Structure](#3-folder-structure)
4. [Runtime Lifecycle](#4-runtime-lifecycle)
5. [Feature Inventory](#5-feature-inventory)
6. [Module Documentation](#6-module-documentation)
7. [API Endpoint Reference](#7-api-endpoint-reference)
8. [State Management](#8-state-management)
9. [Pipeline Documentation](#9-pipeline-documentation)
10. [Formula Documentation](#10-formula-documentation)
11. [AI Dependency Matrix](#11-ai-dependency-matrix)
12. [Database Reference](#12-database-reference)
13. [Authentication System](#13-authentication-system)
14. [Deployment Configuration](#14-deployment-configuration)

---

## 1. Project Overview

**AURA Health** is a clinical-grade AI-powered **Digital Twin Health Platform** that creates a living, personalized simulation of a patient organ health in real-time. The platform combines:

- **Deterministic Clinical Algorithms** (evidence-based formulas from AHA, KDIGO, AASLD, ESC) for organ scoring from lab biomarkers.
- **Llama 80B AI** (via OpenRouter) for conversational health guidance, lifestyle interpretation, and emergency care consultation.
- **Gemini Vision AI** for PDF medical report OCR and biomarker extraction.
- **3D Anatomical Model** (human_anatomy.glb) rendered with Three.js for immersive organ visualization.
- **MongoDB** for persistent storage of users, medical records, and health reports.
- **Firebase Auth** for Google OAuth and email/password authentication.

The system is designed around a Single Source of Truth (SSOT) Zustand store that holds all patient state, ensuring consistent data flow from registration through clinical assessment to dashboard rendering.


---

## 2. Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React 18 | UI framework | 18.x |
| TypeScript | Type safety | 5.x |
| Vite | Build tool and dev server | 5.4.19 |
| React Router DOM | Client-side routing | 6.x |
| Zustand | Global state management (SSOT) | 4.x |
| Three.js / React Three Fiber | 3D GLB model rendering | r160 / r8 |
| Framer Motion | UI animations | 10.x |
| Axios | HTTP client | 1.x |
| React i18next | Internationalization (EN/HI/TE) | 13.x |
| Firebase SDK | Authentication (Google OAuth) | 10.x |
| Recharts | Health data charts | 2.x |
| react-icons (Tabler) | Icon library | 5.x |
| Tailwind CSS | Utility styling | 3.x |
| shadcn/ui | Component primitives | latest |
| qrcode.react | QR code generation | 3.x |
| Sonner / Toaster | Toast notification system | latest |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Python | Backend language | 3.12 |
| FastAPI | REST API framework | 0.100+ |
| Pydantic | Data validation and models | 2.x |
| PyMongo | MongoDB driver | 4.x |
| pypdf | PDF text extraction | 3.x |
| OpenCV (cv2) | Document image preprocessing | 4.x |
| google-generativeai | Gemini Vision API (PDF OCR) | 0.5+ |
| openai (SDK) | OpenRouter + Cerebras LLM client | 1.x |
| python-jose | JWT token creation and decoding | 3.x |
| passlib / bcrypt | Password hashing | 1.7.x |
| python-dotenv | Env var loading | 1.x |
| requests | Outbound HTTP (RapidAPI, OSM) | 2.x |
| uvicorn | ASGI application server | 0.x |

### Infrastructure and Deployment

| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Production database |
| Firebase Auth | Google OAuth / Email auth |
| Render.com | Backend deployment (Procfile + render.yaml) |
| Vercel | Frontend deployment (vercel.json) |
| OpenRouter | Llama 3.3 70B/80B inference routing |
| Cerebras | Fallback LLM inference (gpt-oss-120b) |
| Google Gemini | PDF OCR / Medical report extraction |

---

## 3. Folder Structure

`
digital-twin-health-ai/
+-- backend/
|   +-- .env                         # API keys and environment variables
|   +-- requirements.txt             # Python dependencies
|   +-- app/
|       +-- api.py                   # FastAPI application - all routes (576 lines)
|       +-- auth/
|       |   +-- router.py            # Auth endpoints: register, login, Google
|       |   +-- service.py           # JWT, password hashing utilities
|       +-- storage/
|       |   +-- database.py          # MongoDB connection factory
|       |   +-- repositories.py      # UserRepository, ReportRepository, DocumentRepository
|       +-- knowledge_store/
|       |   +-- store.py             # Document knowledge store (vector-like indexing)
|       +-- pdf_ingestion/
|       |   +-- service.py           # PDFIngestionService - master pipeline coordinator
|       |   +-- preprocessing.py     # OpenCV image preprocessing
|       |   +-- layout_segmenter.py  # Document layout region segmentation
|       |   +-- deterministic_classifier.py  # Rule-based document type classifier
|       |   +-- extractor.py         # Gemini Vision structured extraction
|       |   +-- medical_ner_extractor.py     # Local regex NER fallback
|       |   +-- biomarker_mapper.py  # Lab value to biomarker key normalization
|       |   +-- validator.py         # Medical record schema validation
|       |   +-- confidence_engine.py # Extraction confidence scoring
|       |   +-- local_ocr_engine.py  # Local OCR fallback (no API key required)
|       +-- reasoning_engine/
|           +-- engine.py            # generate_health_report() - main simulation engine
|           +-- clinical_scoring.py  # Evidence-based organ scoring (5 formulas)
|           +-- clinical_readiness.py # Biomarker availability checker
|           +-- lifestyle_assessment.py # Wellness score and biological age engine
|           +-- lifestyle_ai_interpreter.py # Llama 80B AI lifestyle narrative
|           +-- care_guidance.py     # Llama 80B clinical chat and emergency guidance
|           +-- gemini_service.py    # Gemini / Cerebras voice consultation service
|           +-- projection.py        # Llama 80B 2-year organ health projection
|           +-- llm_writer.py        # OpenRouter LLM report writer
|           +-- models.py            # Pydantic/dataclass domain models
|           +-- report_schema.py     # Health report output schema and validator
|           +-- feedback_analysis.py # Lifestyle feedback integration engine
|           +-- guideline_rules.py   # Clinical guideline rule registry
|           +-- guideline_registry.py # Guideline context lookup
|           +-- guideline_context.py # Context builder for LLM/report writers
|           +-- service.py           # HealthReportService - orchestrates engine + writer
|           +-- i18n.py              # Multilingual translation engine (EN/HI/TE)
+-- frontend/
|   +-- aura-health/
|       +-- src/
|           +-- App.tsx              # Router - all page routes
|           +-- main.tsx             # React entry point
|           +-- index.css            # Global styles + Tailwind base
|           +-- firebase/
|           |   +-- firebase.ts      # Firebase app + auth initialization
|           +-- services/
|           |   +-- api.ts           # Axios client + fetchHealthReport / fetchWellness
|           +-- store/
|           |   +-- useStore.ts      # Zustand SSOT store - all state + actions (1353 lines)
|           +-- i18n/
|           |   +-- config.ts        # i18next initialization (EN/HI/TE)
|           +-- components/
|           |   +-- DashboardLayout.tsx        # Sidebar + header + Llama Chat Panel
|           |   +-- ProtectedRoute.tsx         # Auth guard component
|           |   +-- ControlPanel.tsx           # Simulation control inputs
|           |   +-- OrganCard.tsx              # Individual organ score display card
|           |   +-- OrganRiskList.tsx          # Ranked organ risk list
|           |   +-- OrganDetailModal.tsx       # Organ detail modal
|           |   +-- ReportAnalyzer.tsx         # PDF upload and OCR analysis UI
|           |   +-- DoctorRecommendations.tsx  # Realtime doctor search component
|           |   +-- CareGuidance.tsx           # Emergency care guidance panel
|           |   +-- CareChat.tsx               # Llama 80B care chat component
|           |   +-- FutureProjection.tsx       # 2-year projection chart component
|           |   +-- ChartPanel.tsx             # Recharts organ score chart
|           |   +-- VoiceInteraction.tsx       # Voice consultation UI
|           |   +-- MedicalRecordViewerModal.tsx  # Medical record detail viewer
|           |   +-- BodySimulator/
|           |       +-- HumanAnatomy.tsx       # Three.js GLB model loader and renderer
|           +-- pages/
|               +-- Landing.tsx               # Public landing page
|               +-- Login.tsx                 # Login (Email/Password + Google)
|               +-- Register.tsx              # Multi-step registration + lifestyle intake
|               +-- HomeDashboard.tsx         # Main dashboard (organ scores + overview)
|               +-- MyHealthPage.tsx          # Full clinical assessment page
|               +-- AdvancedDigitalTwin.tsx   # Clinical engine simulation page
|               +-- BodySimulation.tsx        # 3D anatomy twin page
|               +-- AuraAIPage.tsx            # Llama 80B AI companion page
|               +-- DoctorsPage.tsx           # Doctor recommendations page
|               +-- MedicalReportsPage.tsx    # PDF upload + medical records page
|               +-- HealthHistoryPage.tsx     # Medical history + timeline page
|               +-- HealthOutlookPage.tsx     # Health outlook trends page
|               +-- PassportPage.tsx          # Health passport + QR page
|               +-- ClinicalEnginePage.tsx    # Clinical engine overview page
|               +-- ProfilePage.tsx           # Patient profile settings page
|               +-- SettingsPage.tsx          # App settings page
+-- public/
|   +-- human_anatomy.glb            # 27.8 MB anatomical 3D model asset
+-- AURA_Health_Clinical_Rule_Specification.md  # Clinical formula spec document
+-- Dockerfile                       # Docker container build file
+-- Procfile                         # Render.com production start command
+-- render.yaml                      # Render deployment config
+-- vercel.json                      # Vercel frontend deployment config
+-- pyproject.toml                   # Python project metadata
`


---

## 4. Runtime Lifecycle

`
USER OPENS BROWSER
        |
        v
Landing.tsx (Public)
        |
        v
Login.tsx or Register.tsx
        |
        v
Firebase Auth  <->  Backend JWT (/v1/auth/login or /v1/auth/google)
        |
        v
useStore.initializeAuth() [runs on App.tsx mount]
  - Reads user from localStorage / Firebase
  - Calls /v1/clinical-assessments with saved biomarkers
  - Calls /v1/passport
  - Calls /v1/wellness-assessment
  - Calls /v1/lifestyle-ai-interpretation
  - Sets clinicalAssessmentState, passportData, wellnessData, lifestyleAIInterpretation
        |
        v
HomeDashboard.tsx renders
  - Reads clinicalAssessmentState.organ_insights -> organ score cards
  - Reads wellnessData -> wellness score widget
  - Reads passportData -> passport level badge
        |
        v
USER NAVIGATES TO MY HEALTH PAGE
        |
        v
MyHealthPage.tsx + ControlPanel.tsx
  - User can adjust lifestyle sliders, upload reports
  - Calls runSimulation() -> /v1/health-report -> updates report state
        |
        v
PDF UPLOAD FLOW (MedicalReportsPage.tsx)
  - User uploads PDF -> /v1/ingest-pdf
  - Pipeline: OCR -> Classify -> Extract -> Map Biomarkers -> Clinical Readiness
  - Store: addMedicalRecord + saveBiomarkers + re-runs clinical assessments
        |
        v
DOCTOR RECOMMENDATIONS (DoctorsPage.tsx)
  - DoctorRecommendations.tsx auto-fetches /v1/doctors on mount
  - Maps highest-risk organ -> specialist type
        |
        v
AURA AI COMPANION (AuraAIPage.tsx + DashboardLayout.tsx panel)
  - User types query -> POST /v1/care-chat -> Llama 80B -> displays response
        |
        v
3D TWIN (BodySimulation.tsx)
  - Loads public/human_anatomy.glb via Three.js useGLTF
  - Applies organ hotspot overlays on the 3D model
        |
        v
HEALTH PASSPORT (PassportPage.tsx)
  - Reads clinicalAssessmentState + passportData from store
  - Generates QR code payload JSON
  - User can copy JSON or share passport
`

---

## 5. Feature Inventory

| # | Feature | Purpose | Key Files | AI Dependency |
|---|---------|---------|-----------|--------------|
| 1 | User Registration | Multi-step patient onboarding with lifestyle intake | Register.tsx, /v1/auth/register | None |
| 2 | Email/Password Auth | JWT-based login | Login.tsx, router.py, service.py | None |
| 3 | Google OAuth Auth | Firebase Google SSO + backend JWT sync | Login.tsx, firebase.ts, /v1/auth/google | None |
| 4 | Dashboard Overview | Real-time organ scores, wellness summary, passport level | HomeDashboard.tsx, useStore.ts | None |
| 5 | Lifestyle Simulation | Deterministic organ health simulation from profile | ControlPanel.tsx, /v1/health-report, engine.py | None |
| 6 | Clinical Engine | Evidence-based biomarker organ scoring | clinical_scoring.py, /v1/clinical-assessments | None |
| 7 | Clinical Readiness | Determines which biomarkers are available per organ | clinical_readiness.py | None |
| 8 | PDF Report Upload | Upload and OCR-analyze medical reports | MedicalReportsPage.tsx, ReportAnalyzer.tsx, /v1/ingest-pdf | Gemini Vision |
| 9 | Medical Record Management | Store/view/delete medical records | MedicalReportsPage.tsx, /v1/medical-records, MongoDB | None |
| 10 | Medical Record Viewer | View detailed record contents | MedicalRecordViewerModal.tsx | None |
| 11 | Biomarker Extraction | Extract structured lab values from OCR text | biomarker_mapper.py, extractor.py | Gemini Vision |
| 12 | Wellness Assessment | Lifestyle-based wellness score and biological age | lifestyle_assessment.py, /v1/wellness-assessment | None |
| 13 | AI Lifestyle Interpretation | Llama-generated lifestyle narrative and recommendations | lifestyle_ai_interpreter.py, /v1/lifestyle-ai-interpretation | Llama 80B |
| 14 | Aura AI Companion Chat | Interactive Llama 80B chat for health questions | DashboardLayout.tsx, AuraAIPage.tsx, /v1/care-chat | Llama 80B |
| 15 | Emergency Care Guidance | Protocol-based emergency care recommendations | care_guidance.py, CareGuidance.tsx, /v1/care-guidance | Llama 80B |
| 16 | Voice AI Consultation | Gemini-powered conversational health consultation | gemini_service.py, VoiceInteraction.tsx, /v1/voice-consult | Gemini |
| 17 | 3D Digital Twin Body | Interactive 3D anatomical GLB model rendering | HumanAnatomy.tsx, BodySimulation.tsx, human_anatomy.glb | None |
| 18 | Realtime Doctor Recommendations | Specialist hospital search by city and risk organ | DoctorRecommendations.tsx, /v1/doctors, RapidAPI/OSM | None |
| 19 | Health Passport | Living digital health passport with QR code | PassportPage.tsx, /v1/passport | None |
| 20 | QR Code Generation | Patient health summary QR payload | PassportPage.tsx, qrcode.react | None |
| 21 | Health Projection | 2-year organ risk trajectory | projection.py, FutureProjection.tsx, /v1/health-projection | Llama 80B |
| 22 | Medical Timeline | Chronological record of medical events | HealthHistoryPage.tsx, medicalTimeline store state | None |
| 23 | Health History Page | Historical health metrics and trends | HealthHistoryPage.tsx | None |
| 24 | Health Outlook Page | Future health outlook summary | HealthOutlookPage.tsx | None |
| 25 | Organ Detail Modal | Deep-dive organ data - formula, citation, score | OrganDetailModal.tsx | None |
| 26 | Clinical Engine Page | Full clinical readiness and module status | ClinicalEnginePage.tsx | None |
| 27 | Profile Management | Patient demographics and lifestyle update | ProfilePage.tsx, /v1/auth/me | None |
| 28 | Settings Page | App settings (theme, language, notifications) | SettingsPage.tsx | None |
| 29 | Internationalization | EN / Hindi / Telugu multilingual support | i18n.py, i18n/config.ts, useTranslation() | None |
| 30 | Report Generation | Deterministic full simulation report | engine.py, service.py, /v1/health-report | None |


---

## 6. Module Documentation

---

### 6.1 Authentication Module

**Purpose**: Manages user identity, session tokens, and multi-provider login.

**Entry Points**: backend/app/auth/router.py, frontend/src/firebase/firebase.ts

**External Dependencies**: Firebase Auth SDK, python-jose (JWT), passlib (bcrypt)

**Input**: Email, password, or Firebase UID + Google token
**Processing**: Validates credentials, hashes password, creates JWT (HS256), stores user in MongoDB
**Output**: { access_token, token_type } JWT bearer token

| Method | Route | Purpose |
|--------|-------|---------|
| POST | /v1/auth/register | Email/password registration |
| POST | /v1/auth/login | Email/password login -> JWT |
| POST | /v1/auth/google | Google OAuth -> JWT (upsert user) |
| GET | /v1/auth/me | Fetch current authenticated user profile |
| PUT | /v1/auth/me | Update user profile |

**Database**: users MongoDB collection | **AI Usage**: None

---

### 6.2 Health Report Simulation Engine

**Purpose**: Generates a full organ health simulation report from patient lifestyle data.

**Entry Point**: backend/app/reasoning_engine/engine.py -> generate_health_report()
**Orchestration**: backend/app/reasoning_engine/service.py -> HealthReportService
**Internal Dependencies**: clinical_scoring.py, lifestyle_assessment.py, clinical_readiness.py, feedback_analysis.py, guideline_context.py, i18n.py, llm_writer.py

**Input**: user_profile (age, sex, bmi, sleep_hours, activity_level, diet_type, smoker), lab_biomarkers dict, organ_scores dict

**Processing**: 1) evaluate_lifestyle_assessment(), 2) evaluate_clinical_organ_scores(), 3) evaluate_clinical_readiness(), 4) analyze_feedback(), 5) Computes organ risk bands, 6) Writes narrative

**State Written**: report in Zustand store | **Endpoint**: POST /v1/health-report
**AI Usage**: Deterministic by default; LLM writer mode optional via writer_mode: llm

---

### 6.3 Clinical Organ Scoring Engine

**Purpose**: Applies evidence-based clinical formulas to compute per-organ integrity scores (0-100).

**Entry Point**: backend/app/reasoning_engine/clinical_scoring.py -> evaluate_clinical_organ_scores()
**Dependencies**: Internal only (math library)

**Organ Scoring Requirements**:
- Kidney: CKD-EPI 2021 (requires serum_creatinine)
- Liver: MELD-Na (requires creatinine, bilirubin, inr, sodium) or FIB-4 (requires ast, alt, platelets)
- Lungs: GOLD 2026 (requires fev1_pct_predicted, fev1_fvc_ratio)
- Heart: AHA PREVENT 2023 (requires systolic_bp, total_cholesterol, hdl)
- Brain: CHA2DS2-VASc (requires clinical flags: has_af, has_htn, has_diabetes, has_stroke)

Returns None for any organ whose required biomarkers are not present.

**AI Usage**: None - fully deterministic mathematical formulas

---

### 6.4 Clinical Readiness Checker

**Purpose**: Determines which organ scoring modules can be activated with currently available biomarkers.
**Entry Point**: backend/app/reasoning_engine/clinical_readiness.py -> evaluate_clinical_readiness()
**Input**: Flattened dict of all available lab values + vitals
**Output**: active_modules_count, total_modules_count, organ_readiness dict per organ
**AI Usage**: None

---

### 6.5 Lifestyle Assessment Engine

**Purpose**: Computes preventive wellness score, biological age estimate, and habit-based risk factor analysis from lifestyle data only. Never generates organ clinical scores.

**Entry Point**: backend/app/reasoning_engine/lifestyle_assessment.py -> evaluate_lifestyle_assessment()
**Input**: user_profile (age, sex, BMI, sleep, activity, diet, smoking, alcohol, diseases, family history)

**Penalty Table**:

| Habit Factor | Penalty |
|-------------|---------|
| Smoker | -15 pts |
| Alcohol excessive | -8 pts |
| Sleep under 6h | -10 pts |
| Sedentary | -8 pts |
| BMI Obese (>=30) | -12 pts |
| BMI Overweight (25-29.9) | -5 pts |
| Poor diet | -8 pts |
| Per active disease sector | -3 pts |
| High disease burden | -12 pts |

**Base Score**: 95, clamped between 35-98 | **AI Usage**: None

---

### 6.6 AI Lifestyle Interpreter

**Purpose**: Translates deterministic wellness engine output into personalized natural language lifestyle guidance using Llama 80B AI.
**Entry Point**: backend/app/reasoning_engine/lifestyle_ai_interpreter.py -> generate_lifestyle_ai_interpretation()
**LLM Chain**: 1) OpenRouter Llama 80B, 2) Cerebras gpt-oss-120b, 3) Rule-based fallback
**Input**: Sanitized lifestyle payload (PII stripped)
**AI Usage**: Llama 80B (primary), Cerebras (fallback), rule-based (safety)

---

### 6.7 Care Guidance and Aura Chat Service

**Purpose**: Provides Llama 80B-powered emergency care protocols and interactive clinical chat.
**Entry Point**: backend/app/reasoning_engine/care_guidance.py -> CareGuidanceService
**Methods**: generate(user_profile, organ_scores, symptoms), generate_from_chat(query)
**LLM Chain**: 1) OpenRouter Llama 80B, 2) Cerebras, 3) Rule-based hardcoded response
**Endpoints**: POST /v1/care-guidance, POST /v1/care-chat
**AI Usage**: Llama 80B mandatory

---

### 6.8 PDF Ingestion and OCR Pipeline

**Purpose**: Processes uploaded medical PDF reports through a hybrid Gemini Vision + deterministic local OCR pipeline.
**Entry Point**: backend/app/pdf_ingestion/service.py -> PDFIngestionService.ingest_pdf()

| Module | File | Purpose |
|--------|------|---------|
| Image Preprocessor | preprocessing.py | OpenCV denoising, deskewing |
| Layout Segmenter | layout_segmenter.py | Header/body region extraction |
| Document Classifier | deterministic_classifier.py | Rule-based doc type classification |
| Structured Extractor | extractor.py | Gemini Vision or local NER extraction |
| Medical NER Extractor | medical_ner_extractor.py | Regex + Pharmacopoeia NER (no API key) |
| Biomarker Mapper | biomarker_mapper.py | Lab value to biomarker key normalization |
| Record Validator | validator.py | Schema validation of extracted record |
| Confidence Engine | confidence_engine.py | Extraction quality scoring |

**Document Types**: prescription, laboratory, radiology, discharge, vaccination
**AI Usage**: Gemini 2.0 Flash (Vision) when GEMINI_API_KEY available; otherwise local regex NER

---

### 6.9 Voice AI Consultation

**Purpose**: Provides conversational voice health consultation powered by Gemini or Cerebras Llama.
**Entry Point**: backend/app/reasoning_engine/gemini_service.py -> GeminiVoiceService.consult()
**Fallback Chain**: 1) Google Gemini 2.0 Flash, 2) Cerebras gpt-oss-120b, 3) Rule-based templates
**Endpoint**: POST /v1/voice-consult | **AI Usage**: Gemini primary, Cerebras fallback

---

### 6.10 Health Projection Service

**Purpose**: Generates a 2-year forward organ health trajectory using Llama 80B reasoning.
**Entry Point**: backend/app/reasoning_engine/projection.py -> HealthProjectionService.generate()
**Input**: user_profile, organ_scores (current state)
**Output**: { projection: { heart: [now, 6m, 1y, 2y], ... }, note: string }
**AI Usage**: Llama 80B via OpenRouter

---

### 6.11 3D Anatomical Digital Twin

**Purpose**: Renders an interactive 3D anatomical GLB model with organ visualization and risk-overlay hotspots.
**Entry Point**: frontend/src/components/BodySimulator/HumanAnatomy.tsx
**Asset**: public/human_anatomy.glb (27.8 MB)
**Libraries**: @react-three/fiber, @react-three/drei, Three.js r160
**Render Modes**: Full Color, X-Ray, Cyber Hologram
**State Read**: clinicalAssessmentState.organ_insights | **AI Usage**: None

---

### 6.12 Doctor Recommendations

**Purpose**: Surfaces localized specialist hospital recommendations based on the patient highest-risk organ.
**Entry Point**: frontend/src/components/DoctorRecommendations.tsx
**Endpoint**: GET /v1/doctors?specialist={}&location={}&risk_level={}

| Organ | Specialist |
|-------|-----------|
| Heart | Cardiologist |
| Lungs | Pulmonologist |
| Liver | Gastroenterologist |
| Kidneys | Nephrologist |
| Brain | Neurologist |

**Data Sources**: 1) RapidAPI Google Places, 2) OpenStreetMap Nominatim, 3) Static city directory
**Cities**: Hyderabad, Mumbai, Bangalore, Delhi, Chennai | **AI Usage**: None

---

### 6.13 Health Passport and QR System

**Purpose**: Generates a tiered digital health passport with a QR-scannable JSON payload.
**Entry Point**: frontend/src/pages/PassportPage.tsx | **Endpoint**: POST /v1/passport

| Level | Title | Condition |
|-------|-------|-----------|
| 1 | Emergency Health Passport | No lab biomarkers available |
| 2 | Clinical Health Passport | 1+ medical report uploaded |
| 3 | Living Digital Twin Passport | 1+ active organ clinical assessment |

**State Read**: clinicalAssessmentState, passportData, medicalRecords, user, lifestyleData
**AI Usage**: None

---

### 6.14 Medical Records Management

**Purpose**: Manages the complete lifecycle of uploaded medical reports - storage, classification, retrieval, deletion, and biomarker integration.
**Entry Points**: MedicalReportsPage.tsx (upload/search/filter/delete), MedicalRecordViewerModal.tsx (detail view)
**DB**: MongoDB medical_records collection
**Endpoints**: GET /v1/medical-records, POST /v1/medical-records, DELETE /v1/medical-records/{id}
**State Written**: medicalRecords (Zustand + localStorage)


---

## 7. API Endpoint Reference

| Method | Route | Purpose | AI |
|--------|-------|---------|-----|
| GET | /health | Health check | None |
| POST | /v1/auth/register | Register user | None |
| POST | /v1/auth/login | Email/password login -> JWT | None |
| POST | /v1/auth/google | Google OAuth login -> JWT | None |
| GET | /v1/auth/me | Get current user | None |
| PUT | /v1/auth/me | Update user profile | None |
| POST | /v1/health-report | Full simulation report | Optional LLM |
| GET | /v1/reports | List saved reports | None |
| POST | /v1/wellness-assessment | Lifestyle wellness score | None |
| POST | /v1/lifestyle-ai-interpretation | AI lifestyle narrative | Llama 80B |
| POST | /v1/health-readiness | Clinical readiness check | None |
| POST | /v1/clinical-assessments | Full clinical organ assessment | None |
| POST | /v1/passport | Health passport data | None |
| POST | /v1/ingest-pdf | PDF OCR and biomarker extraction | Gemini Vision |
| GET | /v1/medical-records | Get all medical records | None |
| POST | /v1/medical-records | Save medical record | None |
| DELETE | /v1/medical-records/{id} | Delete medical record | None |
| GET | /v1/doctors | Search specialist hospitals | None |
| POST | /v1/care-guidance | Emergency care protocol | Llama 80B |
| POST | /v1/care-chat | Aura AI chat message | Llama 80B |
| POST | /v1/health-projection | 2-year organ projection | Llama 80B |
| POST | /v1/voice-consult | Voice health consultation | Gemini |
| GET | /v1/debug-ai | AI config debug info | None |

---

## 8. State Management

All application state is managed through a single Zustand SSOT store in frontend/src/store/useStore.ts (1353 lines).

### Core State Slices

| State Key | Type | Description |
|-----------|------|-------------|
| user | any or null | Authenticated user profile from Firebase/backend |
| lifestyleData | LifestyleData | Patient lifestyle inputs (age, BMI, sleep, etc.) |
| report | HealthReport or null | Current simulation report (organ insights, risk level) |
| wellnessData | WellnessAssessment or null | Lifestyle wellness score and biological age |
| clinicalReadiness | Record or null | Which organs have sufficient biomarkers |
| clinicalAssessmentState | MasterClinicalAssessmentState or null | Master SSOT |
| passportData | PassportData or null | Health passport level, title, active assessments |
| medicalRecords | MedicalRecord[] | All uploaded medical records |
| medicalTimeline | MedicalRecord[] | Chronological medical event list |
| extractedBiomarkers | Record | Latest biomarkers extracted from PDFs |
| lifestyleAIInterpretation | LifestyleAIInterpretation or null | Llama-generated lifestyle narrative |
| reportAnalysisData | ReportAnalysis or null | Analysis result from PDF OCR pipeline |
| recommendedDoctors | Doctor[] | Fetched specialist hospital list |
| careGuidanceData | CareGuidanceData or null | Emergency care guidance response |
| projectionData | HealthProjectionResponse or null | 2-year organ health projection |
| voiceMessages | Array of role/content objects | Voice consultation chat history |

### MasterClinicalAssessmentState (Primary SSOT for UI)

- overall_clinical_status: string (e.g. "2 of 5 Organ Modules Active")
- passport_level: number (1, 2, or 3)
- passport_title: string
- uploaded_reports_count: number
- organ_insights: OrganInsights (heart, lungs, liver, kidneys, brain scores)
- wellness_assessment: WellnessAssessment or null
- module_readiness: Record of organ readiness objects
- active_clinical_assessments: Array with organ, formula, citation, confidence, date
- medical_timeline: MedicalRecord[]

### Key Store Actions

| Action | Purpose |
|--------|---------|
| runSimulation() | Calls /v1/health-report, updates report |
| analyzeReport(file, language) | Calls /v1/ingest-pdf, extracts biomarkers, runs clinical assessment |
| fetchDoctors(specialist, city, risk) | Calls /v1/doctors, updates recommendedDoctors |
| fetchGuidance() | Calls /v1/care-guidance |
| sendCareChatMessage(query) | Calls /v1/care-chat |
| fetchLifestyleAIInterpretation() | Calls /v1/lifestyle-ai-interpretation |
| fetchHealthProjection() | Calls /v1/health-projection |
| sendVoiceConsult(message, isVoice) | Calls /v1/voice-consult |
| initializeAuth() | Restores session, calls clinical/wellness/passport endpoints |
| addMedicalRecord(record) | Adds to medicalRecords + pushes to clinicalAssessmentState.medical_timeline |
| saveBiomarkers(biomarkers) | Updates extractedBiomarkers + re-runs clinical assessments |

---

## 9. Pipeline Documentation

### Pipeline 1 - Patient Registration and Initialization

```
User fills multi-step Register.tsx form
        |
        v
Firebase Auth creates user (email/password)
        |
        v
POST /v1/auth/register -> MongoDB users collection
        |
        v
useStore.initializeAuth() fires
        |
        v
POST /v1/wellness-assessment (lifestyle data)
  -> wellnessData set in store
        |
        v
POST /v1/clinical-assessments (biomarkers empty initially)
  -> clinicalAssessmentState set (all organs: Waiting for Reports)
        |
        v
POST /v1/passport
  -> passportData set (Level 1 - Emergency Health Passport)
        |
        v
POST /v1/lifestyle-ai-interpretation
  -> lifestyleAIInterpretation set
        |
        v
HomeDashboard.tsx renders with initial state
```

---

### Pipeline 2 - PDF Medical Report Upload and Biomarker Integration

```
User selects PDF in MedicalReportsPage.tsx / ReportAnalyzer.tsx
        |
        v
POST /v1/ingest-pdf (multipart file upload)
        |
  [STEP 1] pypdf extracts text from PDF pages
        |
  [STEP 2] OpenCV denoises and preprocesses document image
        |
  [STEP 3] DeterministicLayoutClassifier classifies document type
           (prescription / laboratory / radiology / discharge / vaccination)
        |
  [STEP 4] If GEMINI_API_KEY available:
             StructuredMedicalExtractor (Gemini Vision) extracts structured fields
           Else:
             LocalMedicalNERExtractor (regex + pharmacopoeia) extracts fields
        |
  [STEP 5] biomarker_mapper maps lab values to normalized biomarker keys
           (e.g. "S. Creatinine" -> serum_creatinine)
        |
  [STEP 6] evaluate_clinical_readiness() determines organ readiness
        |
  [STEP 7] Record saved to MongoDB medical_records collection
        |
        v
API response: { record, extracted_biomarkers, clinical_readiness, classification }
        |
        v
Frontend: useStore.analyzeReport() receives response
  - addMedicalRecord(record) -> medicalRecords
  - saveBiomarkers(biomarkers) -> triggers re-evaluation
  - Re-calls POST /v1/clinical-assessments with new biomarkers
  - Updates clinicalAssessmentState.organ_insights
  - Updates passportData (level may upgrade to 2 or 3)
        |
        v
Dashboard rerenders with new organ scores
```

---

### Pipeline 3 - Clinical Organ Assessment

```
Biomarkers available (from PDF upload or manual entry)
        |
        v
POST /v1/clinical-assessments
        |
        v
evaluate_clinical_readiness(combined_data)
-> Checks which organs have required biomarkers
        |
        v
evaluate_clinical_organ_scores(user_profile, lab_data, vitals)
        |
  If serum_creatinine:   compute_egfr_ckdepi2021()   -> Kidneys score
  If bilirubin+inr+Na:   compute_meld_na()             -> Liver score
  If ast+alt+platelets:  compute_fib4()                -> Liver (alt)
  If fev1_pct+fev1_fvc:  compute_gold_lungs()          -> Lungs score
  If SBP+TC+HDL:         compute_prevent_heart()       -> Heart score
  If AF/HTN flags:       compute_cha2ds2_vasc_brain()  -> Brain score
        |
        v
Returns organ_assessments + readiness_state + overall_clinical_status
        |
        v
clinicalAssessmentState.organ_insights updated
Dashboard OrganCard components rerender with scores
```

---

### Pipeline 4 - Aura AI Chat Consultation

```
User types message in DashboardLayout or AuraAIPage.tsx
        |
        v
POST /v1/care-chat { query }
        |
        v
CareGuidanceService.generate_from_chat(query)
        |
  [Try 1] OpenRouter (meta-llama/llama-3.3-70b-instruct)
  [Try 2] Cerebras API (gpt-oss-120b)
  [Safety] generate_rule_based_care_guidance()
        |
        v
Frontend displays Llama 80B response in chat bubble
```

---

### Pipeline 5 - Doctor Recommendations

```
DoctorRecommendations.tsx useEffect fires on mount
        |
        v
getActiveContext() determines highest-risk organ
Maps organ -> specialist type (cardiologist, pulmonologist, etc.)
        |
        v
fetchDoctors(specialist, userCity, risk_level) called
        |
        v
GET /v1/doctors?specialist=pulmonologist&location=Hyderabad&risk_level=moderate
        |
  [Try 1] RapidAPI Google Places search (if RAPID_API_KEY set)
  [Fallback] Static city hospital directory
        |
        v
recommendedDoctors updated in store
Hospital cards rendered with Maps links, phone, tier, rating
```

---

### Pipeline 6 - Health Projection

```
FutureProjection.tsx component mounts
        |
        v
fetchHealthProjection() called
        |
        v
POST /v1/health-projection { user_profile, organ_scores }
        |
        v
HealthProjectionService.generate()
Llama 80B reasons about 2-year organ trajectory
Returns { projection: { heart: [71,68,66,63], ... }, note: string }
        |
        v
projectionData set in store
Recharts line chart renders 4-interval trajectory per organ
```

---

### Pipeline 7 - Voice AI Consultation

```
User speaks or types in VoiceInteraction.tsx
        |
        v
POST /v1/voice-consult { message, health_context, chat_history, language }
        |
        v
GeminiVoiceService.consult()
  [Try 1] Google Gemini 2.0 Flash
  [Try 2] Cerebras gpt-oss-120b
  [Safety] generate_rule_based_voice_consult()
        |
        v
voiceMessages updated in store
Chat bubble rendered in VoiceInteraction component
```

---

## 10. Formula Documentation

### Formula 1 - CKD-EPI 2021 (Kidney Function)

**Purpose**: Estimates Glomerular Filtration Rate to assess kidney health.
**Source**: Inker LA et al. NEJM 2021;385:1737-1749. Endorsed by KDIGO 2024.
**File**: clinical_scoring.py -> compute_egfr_ckdepi2021()

Formula:
  eGFR = 142 x min(Scr/kappa, 1)^alpha x max(Scr/kappa, 1)^-1.200 x 0.9938^Age x (1.012 if female)
  kappa = 0.7 (female), 0.9 (male)
  alpha = -0.241 (female), -0.302 (male)

**Inputs**: serum_creatinine (mg/dL), age (years), is_female (bool)
**Output**: eGFR (mL/min/1.73m2) -> Integrity Score 0-100
**Risk Bands**: >=90 = low, 60-89 = moderate, 30-59 = high, <30 = critical

---

### Formula 2 - MELD-Na (Liver Function)

**Purpose**: Model for End-Stage Liver Disease with Sodium correction.
**Source**: OPTN Policy 2016; Kim WR et al. NEJM 2008.
**File**: clinical_scoring.py -> compute_meld_na()

Formula:
  MELD(i) = 0.957 x ln(Cr) + 0.378 x ln(Bili) + 1.120 x ln(INR) + 0.643
  MELD-Na = MELD(i) + 1.32 x (137-Na) - (0.033 x MELD(i) x (137-Na)) [if MELD(i) > 11]

**Inputs**: creatinine (mg/dL), bilirubin (mg/dL), inr, sodium (mEq/L)
**Risk Bands**: MELD<10 = low, 10-17 = moderate, 18-24 = high, >24 = critical

---

### Formula 3 - FIB-4 Index (Liver Fibrosis)

**Purpose**: Non-invasive liver fibrosis staging.
**Source**: Sterling RK et al. Hepatology 2006;43:1317-1325. AASLD Guidelines.
**File**: clinical_scoring.py -> compute_fib4()

Formula: FIB-4 = (Age x AST) / (Platelets x sqrt(ALT))

**Inputs**: age (years), ast (U/L), alt (U/L), platelets (10^9/L)
**Cutoffs**: FIB-4 < 1.3 = low (< 2.0 if age > 65), 1.3-2.67 = moderate, > 2.67 = high

---

### Formula 4 - GOLD 2026 (Lung Function)

**Purpose**: Spirometric severity classification of airflow limitation.
**Source**: Global Initiative for COPD - GOLD 2026 Report.
**File**: clinical_scoring.py -> compute_gold_lungs()

Classification:
  FEV1/FVC < 0.70 -> Airflow obstruction confirmed
    GOLD 1 (Mild):        FEV1% >= 80%   -> Integrity 85
    GOLD 2 (Moderate):    FEV1% 50-79%   -> Integrity 70
    GOLD 3 (Severe):      FEV1% 30-49%   -> Integrity 45
    GOLD 4 (Very Severe): FEV1% < 30%    -> Integrity 25
  No obstruction: score derived from SpO2 and pack-years

**Inputs**: fev1_pct_predicted, fev1_fvc_ratio, spo2_pct, pack_years

---

### Formula 5 - AHA PREVENT / ASCVD (Heart Risk)

**Purpose**: 10-Year cardiovascular disease risk estimation.
**Source**: Khan SS et al. Circulation 2024; AHA PREVENT 2023 Guidelines.
**File**: clinical_scoring.py -> compute_prevent_heart()

Formula (clinically-calibrated approximation):
  base_risk = 1.2
    + (age - 40) x 0.25           [if age > 40]
    + (systolic_bp - 120) x 0.15  [if SBP > 120]
    + (total_cholesterol - 200) x 0.05 [if TC > 200]
    + (40 - HDL) x 0.2            [if HDL < 40]
    + 3.5 [if smoker]
    + 3.0 [if diabetic]
    + (60 - eGFR) x 0.1           [if eGFR < 60]
  Integrity Score = 100 - (10yr_risk% x 3.2)

**Inputs**: systolic_bp, total_cholesterol, hdl, is_smoker, is_diabetic, egfr, age
**Risk Bands**: <5% = low, 5-7.5% = moderate, 7.5-20% = high, >=20% = critical

---

### Formula 6 - CHA2DS2-VASc (Brain Stroke Risk)

**Purpose**: Stroke risk stratification in atrial fibrillation patients.
**Source**: ESC/ACC Guidelines for Management of Atrial Fibrillation.
**File**: clinical_scoring.py -> compute_cha2ds2_vasc_brain()

Scoring:
  +2: Age >= 75 or Prior Stroke/TIA
  +1: CHF, Hypertension, Age 65-74, Diabetes, Vascular Disease
  +1: Female sex
  Score 0 (or 1 female) = Low    -> Integrity 95
  Score 1-2 = Moderate           -> Integrity 75
  Score 3-4 = High               -> Integrity 55
  Score >=5 = Critical           -> Integrity 35

---

### Formula 7 - Lifestyle Wellness Score

**Purpose**: Preventive wellness score from habits only (no clinical data required).
**File**: lifestyle_assessment.py

Formula: base_score = 95, subtract penalties, clamp between 35-98

| Factor | Penalty |
|--------|---------|
| Smoker | -15 pts |
| Excessive alcohol | -8 pts |
| Sleep under 6h | -10 pts |
| Sedentary activity | -8 pts |
| BMI Obese (>=30) | -12 pts |
| BMI Overweight (25-29.9) | -5 pts |
| Poor diet | -8 pts |
| Per active disease sector | -3 pts |
| High disease burden | -12 pts |

---

### Formula 8 - Health Passport Level

**Purpose**: Tiered system representing clinical completeness of the digital twin.
**File**: api.py -> /v1/passport endpoint

| Level | Condition |
|-------|-----------|
| Level 1 - Emergency Health Passport | No active assessments, no reports |
| Level 2 - Clinical Health Passport | >=1 uploaded medical report |
| Level 3 - Living Digital Twin Passport | >=1 active organ clinical assessment score |

---

## 11. AI Dependency Matrix

| Feature | Provider | Model | Mandatory | Fallback |
|---------|---------|-------|-----------|---------|
| Aura AI Companion Chat | Llama 80B (OpenRouter) | meta-llama/llama-3.3-70b-instruct | Yes | Cerebras -> Rule-based |
| Emergency Care Guidance | Llama 80B (OpenRouter) | meta-llama/llama-3.3-70b-instruct | Yes | Cerebras -> Rule-based |
| AI Lifestyle Interpretation | Llama 80B (OpenRouter) | meta-llama/llama-3.3-70b-instruct | No | Cerebras -> Rule-based |
| 2-Year Health Projection | Llama 80B (OpenRouter) | meta-llama/llama-3.3-70b-instruct | Yes | Error (no fallback) |
| Voice AI Consultation | Gemini 2.0 Flash (Google) | gemini-2.0-flash | No | Cerebras -> Rule-based |
| PDF OCR Biomarker Extraction | Gemini 2.0 Flash (Google) | gemini-2.0-flash | No | Local regex NER |
| Clinical Organ Scoring | None | N/A | N/A | N/A |
| Lifestyle Wellness Scoring | None | N/A | N/A | N/A |
| Health Simulation Report | None (Deterministic) | N/A | N/A | N/A |
| Doctor Recommendations | None | N/A | N/A | Static directory |
| Dashboard Rendering | None | N/A | N/A | N/A |
| Authentication | None | N/A | N/A | N/A |
| QR Passport | None | N/A | N/A | N/A |
| 3D Model Rendering | None | N/A | N/A | N/A |

### LLM Provider Summary

| Provider | API Key Env Var | Base URL Env Var | Models Used |
|---------|----------------|-----------------|------------|
| OpenRouter | OPENAI_API_KEY | OPENAI_BASE_URL | meta-llama/llama-3.3-70b-instruct |
| Cerebras | CEREBRAS_API_KEY | CEREBRAS_BASE_URL | gpt-oss-120b |
| Google Gemini | GEMINI_API_KEY | N/A (native SDK) | gemini-2.0-flash |

---

## 12. Database Reference

**Database Engine**: MongoDB
**Database Name**: digital_twin_health (default)
**Connection**: MONGO_URI env var (defaults to mongodb://localhost:27017)

### Collections

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| users | Registered patient accounts | _id, email, password_hash, full_name, lifestyle_data, created_at |
| medical_records | Uploaded and extracted medical documents | id, documentType, fileName, uploadDate, visitDate, hospitalName, labValues, ocrText, organImpacts |
| reports | Saved health simulation reports | _id, created_at, requested_mode, used_mode, model, payload, report |
| documents | Knowledge store documents | title, content (text indexed) |

### Repositories (Python)

| Repository | File | Operations |
|-----------|------|-----------|
| UserRepository | repositories.py | create(), find_by_email(), find_by_id(), update() |
| ReportRepository | repositories.py | save(), find_all() |
| DocumentRepository | repositories.py | save(), find_by_title() |

---

## 13. Authentication System

### Multi-Provider Auth Flow

**Email/Password**:
1. User -> POST /v1/auth/register -> bcrypt hash -> MongoDB users
2. User -> POST /v1/auth/login -> verify hash -> create JWT (HS256, 7-day TTL) -> return token

**Google OAuth**:
1. User clicks "Sign in with Google" -> Firebase Google popup
2. Firebase UID + email + name -> POST /v1/auth/google -> upsert MongoDB user -> create JWT

**Session Persistence**:
- JWT stored in localStorage
- initializeAuth() on app load reads localStorage JWT
- Decodes JWT -> sets user in Zustand store

### JWT Schema

```json
{
  "sub": "user_mongo_id",
  "email": "user@email.com",
  "exp": 1234567890
}
```

### Environment Variables (Backend .env)

| Variable | Purpose |
|---------|---------|
| MONGO_URI | MongoDB connection string |
| MONGO_DB_NAME | Database name (default: digital_twin_health) |
| SECRET_KEY | JWT signing secret |
| GEMINI_API_KEY | Google Gemini API key (PDF OCR + Voice) |
| GEMINI_API_KEY_1 | Backup Gemini key |
| OPENAI_API_KEY | OpenRouter API key (Llama 80B) |
| OPENAI_BASE_URL | OpenRouter base URL (https://openrouter.ai/api/v1) |
| LLM_MODEL | Model name (default: meta-llama/llama-3.3-70b-instruct) |
| CEREBRAS_API_KEY | Cerebras API key (fallback LLM) |
| RAPID_API_KEY | RapidAPI Google Maps key (doctor search) |

---

## 14. Deployment Configuration

### Backend (Render.com)

**Procfile**:
```
web: uvicorn backend.app.api:app --host 0.0.0.0 --port $PORT
```

**render.yaml**: Configures environment variables, build command, health check route.

### Frontend (Vercel)

**vercel.json**: Configures SPA rewrites so all routes fallback to index.html.

### Development Servers

| Server | Command | URL |
|--------|---------|-----|
| Frontend | npm run dev (in frontend/aura-health/) | http://localhost:8080 |
| Backend | uvicorn backend.app.api:app --reload | http://localhost:8000 |

### CORS Configuration

Backend allows all origins matching https?://.* plus explicit localhost development ports: 8080, 8081, 5173, 3000.

---

*End of AURA Health Technical Architecture Document*
*Generated: Production Complete - Version 2.0*
