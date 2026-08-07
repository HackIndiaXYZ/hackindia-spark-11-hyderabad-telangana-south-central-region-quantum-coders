import os
import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path=r"c:\Users\palar\OneDrive\Desktop\digital-twin-health-ai\backend\.env")
cerebras_key = os.getenv("CEREBRAS_API_KEY")

if cerebras_key:
    headers = {"Authorization": f"Bearer {cerebras_key}"}
    try:
        r = requests.get("https://api.cerebras.ai/v1/models", headers=headers)
        print("Cerebras models response status:", r.status_code)
        print("Cerebras models:", r.json())
    except Exception as e:
        print("Cerebras models error:", e)
