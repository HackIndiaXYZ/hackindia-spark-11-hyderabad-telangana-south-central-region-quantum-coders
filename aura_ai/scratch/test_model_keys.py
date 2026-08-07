import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(dotenv_path=r"c:\Users\palar\OneDrive\Desktop\digital-twin-health-ai\backend\.env")

cerebras_key = os.getenv("CEREBRAS_API_KEY")
openrouter_key = os.getenv("OPENAI_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")

print("--- Testing Cerebras API ---")
if cerebras_key:
    client = OpenAI(api_key=cerebras_key, base_url="https://api.cerebras.ai/v1")
    for model_candidate in ["llama-3.3-70b", "llama3.1-70b"]:
        try:
            res = client.chat.completions.create(
                model=model_candidate,
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=20
            )
            print(f"SUCCESS on Cerebras with model '{model_candidate}':", res.choices[0].message.content)
            break
        except Exception as e:
            print(f"FAILED on Cerebras with model '{model_candidate}':", e)

print("\n--- Testing OpenRouter API ---")
if openrouter_key:
    client = OpenAI(api_key=openrouter_key, base_url="https://openrouter.ai/api/v1")
    for model_candidate in ["meta-llama/llama-3.3-70b-instruct", "meta-llama/llama-3.1-70b-instruct", "google/gemini-2.0-flash-lite-001"]:
        try:
            res = client.chat.completions.create(
                model=model_candidate,
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=20
            )
            print(f"SUCCESS on OpenRouter with model '{model_candidate}':", res.choices[0].message.content)
            break
        except Exception as e:
            print(f"FAILED on OpenRouter with model '{model_candidate}':", e)

print("\n--- Testing Gemini API ---")
if gemini_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        res = model.generate_content("Hi")
        print("SUCCESS on Gemini API with 'gemini-2.0-flash':", res.text[:50])
    except Exception as e:
        print("FAILED on Gemini API:", e)
