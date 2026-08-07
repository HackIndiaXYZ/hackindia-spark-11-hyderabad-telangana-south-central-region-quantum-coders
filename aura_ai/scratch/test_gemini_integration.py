import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv("backend/.env")

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("[ERROR] GEMINI_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)
model_name = "gemini-2.5-flash-lite"

def test_voice():
    print(f"\n[TEST] Voice AI (Model: {model_name})")
    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction="You are Aura, an AI health consultant. Keep it short."
        )
        response = model.generate_content("Hello Aura, how is my liver health doing?")
        print(f"[SUCCESS] Voice AI Response: {response.text.strip()}")
    except Exception as e:
        print(f"[FAILURE] Voice AI Error: {e}")

def test_report_analyzer():
    print(f"\n[TEST] Report Analyzer (Model: {model_name})")
    try:
        model = genai.GenerativeModel(model_name=model_name)
        prompt = (
            "You are a medical lab report parser. Extract values into JSON.\n\n"
            "TEXT: Patient age 45, BMI 28.5, HbA1c 6.2%.\n\n"
            "Return JSON only."
        )
        response = model.generate_content(prompt)
        print(f"[SUCCESS] Report Analyzer Response: {response.text.strip()}")
    except Exception as e:
        print(f"[FAILURE] Report Analyzer Error: {e}")

if __name__ == "__main__":
    test_voice()
    test_report_analyzer()
