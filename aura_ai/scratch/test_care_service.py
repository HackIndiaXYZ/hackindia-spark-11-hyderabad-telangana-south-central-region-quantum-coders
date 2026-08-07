from dotenv import load_dotenv
load_dotenv(dotenv_path=r"c:\Users\palar\OneDrive\Desktop\digital-twin-health-ai\backend\.env")

from app.reasoning_engine.care_guidance import CareGuidanceService

svc = CareGuidanceService()
print("Client count:", len(svc.clients))
res = svc.generate_from_chat("What is my organ health status?")
print("\n--- Llama 80B Response ---")
print("Provider:", res.get("provider"))
print("Response Text:", res.get("response_text"))
print("Care Steps:", res.get("immediate_care_steps"))
