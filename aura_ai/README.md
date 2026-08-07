# Aura Health: Digital Twin AI

Aura Health is a high-fidelity "Digital Twin" simulator that bridges the gap between raw medical data (PDF reports) and actionable health intelligence. It visualizes a user's internal health state onto a 3D anatomical model and uses clinical-grade reasoning to project future health trends.

---

## 🌟 Features

- **3D Digital Twin Visualization**: Interactive 3D anatomical model with holographic shaders reflecting real-time health risks.
- **AI Bio-Reasoning Pipeline**: Clinical-grade interpretation of medical reports using Cerebras Inference (Llama-3/Claude-3.7).
- **Deterministic Clinical Logic**: Verified medical formulas for calculating organ-specific risk scores.
- **Temporal "What-If" Simulations**: Dynamic habit toggling to see projected health outcomes on the 3D model.
- **Multilingual Support**: High-fidelity intelligence accessible in English, Hindi, and Telugu.
- **Voice Consultation**: Interactive AI-driven health guidance with Gemini-powered voice capabilities.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite) + TypeScript
- **3D Graphics**: Three.js / React Three Fiber
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Styling**: Tailwind CSS + Radix UI

### Backend
- **Framework**: FastAPI (Python)
- **Validation**: Pydantic
- **Database**: MongoDB
- **AI Models**: Cerebras Inference (Llama-3-70B / Claude-3.7), Google Gemini

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB (Local or Atlas)
- API Keys: Cerebras, Gemini, OpenAI (Optional)

### 1. Backend Setup

Navigate to the `backend` directory and set up the environment:

```bash
# Navigate to backend
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from .env.example
cp .env.example .env
# Edit .env with your credentials (MONGO_URI, GEMINI_API_KEY, etc.)

# Start the server

```

The backend will be running at `http://localhost:8000`.

### 2. Frontend Setup

Navigate touvicorn app.api:app --reload the `frontend/aura-health` directory:

```bash
# Navigate to frontend
cd frontend/aura-health

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at `http://localhost:5173`.

---

## 📂 Project Structure

- `frontend/aura-health`: React source code, components, and 3D logic.
- `backend/app`: FastAPI routes, services, and reasoning engine.
  - `pdf_ingestion`: Logic for extracting and analyzing medical PDFs.
  - `reasoning_engine`: Clinical formulas and LLM integration.
  - `storage`: Database schemas and repositories.
- `api/`: Vercel serverless functions entry point.
- `tests/`: Test suites for both frontend and backend.

---

## 🌐 Deployment

The project is configured for deployment on **Vercel** (Frontend & API) and can be Dockerized for other platforms.

- **Frontend**: Automatically deployed via `vercel.json` and the root `api/` entry point.
- **Backend**: Can be hosted on Render, Railway, or any Python-capable cloud provider.

---

## ⚖️ Disclaimer

Aura Health is a digital twin simulation and is **not** a replacement for professional medical diagnosis or treatment. It follows the WHO framework for Integrated People-Centred Health Services but should only be used for informational purposes.

---

**Built with ❤️ for the future of Personalized Medicine.**
