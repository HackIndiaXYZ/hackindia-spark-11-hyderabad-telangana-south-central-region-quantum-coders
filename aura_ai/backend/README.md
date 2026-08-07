# Aura Health: Backend API

High-performance FastAPI backend for the Aura Health Digital Twin platform.

## 🚀 Features

- **Clinical Reasoning Engine**: Implements deterministic medical formulas for organ risk scoring.
- **AI-Powered PDF Ingestion**: Extracts and analyzes health markers from medical reports.
- **RAG & Knowledge Store**: Context-aware health insights using vector storage.
- **Voice Consultation**: Gemini-powered conversational AI for health guidance.
- **Secure Authentication**: JWT-based user management.

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **Validation**: Pydantic v2
- **Database**: MongoDB (Motor / PyMongo)
- **AI Integration**: Cerebras (LLM), Google Generative AI (Gemini)
- **PDF Processing**: PyPDF

## 📦 Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure Environment Variables:
   - Create a `.env` file based on `.env.example`.
   - Ensure `MONGO_URI` and `GEMINI_API_KEY` are set.

4. Run the API:
   ```bash
   uvicorn app.api:app --reload
   ```

## 📂 Structure

- `app/api.py`: Main FastAPI entry point and route definitions.
- `app/reasoning_engine`: Logic for health scoring and LLM orchestration.
- `app/pdf_ingestion`: PDF extraction and biological analysis pipeline.
- `app/storage`: Database models and repository patterns.
- `app/auth`: Authentication and user session management.
- `data/`: Local storage for uploaded files and processing caches.
