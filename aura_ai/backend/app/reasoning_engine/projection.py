import os
import json
from openai import OpenAI

class HealthProjectionService:
    def __init__(self, model: str | None = None, api_key_env: str = "OPENAI_API_KEY", base_url: str | None = None):
        self.model = model or os.getenv("LLM_MODEL", "meta-llama/llama-3.3-70b-instruct")
        self.base_url = base_url or os.getenv("OPENAI_BASE_URL")
        
        api_key = os.getenv(api_key_env)
        if not api_key:
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key, base_url=self.base_url)

    def generate(self, user_profile: dict, organ_scores: dict) -> dict:
        if not self.client:
            raise RuntimeError("LLM reasoning client is not configured correctly.")
        
        system_instruction = (
            "You are an AI data scientist calculating organ health projections. "
            "You MUST simulate how organ health may change over the next 2 years (4 intervals: Now, 6M, 1Y, 2Y) based on lifestyle.\n\n"
            "LOGIC RULES:\n"
            "future_score = current_score + lifestyle_impact\n"
            "- If smoker -> lungs score increases further out in time.\n"
            "- If high alcohol -> liver score increases further out in time.\n"
            "- If high BMI (>25) -> heart and kidneys score increases.\n"
            "- If low sleep (<6 hrs) -> brain score increases.\n"
            "- ALL scores across the 4 arrays MUST be strictly clamped between 0 and 100.\n\n"
            "MANDATORY JSON OUTPUT FORMAT:\n"
            "{\n"
            '  "projection": {\n'
            '    "heart": [60, 65, 70, 75],\n'
            '    "lungs": [40, 45, 50, 55],\n'
            '    "liver": [50, 50, 50, 50],\n'
            '    "kidneys": [30, 32, 35, 40],\n'
            '    "brain": [20, 20, 20, 20]\n'
            '  },\n'
            '  "note": "A thoughtful 1-sentence analytical string summarizing the dominant projection driver, without diagnosing."\n'
            "}"
        )

        user_prompt = f"User Profile: {json.dumps(user_profile)}\nCurrent Base Organ Risk Scores (Now): {json.dumps(organ_scores)}"

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=400,
                temperature=0.1
            )
            raw_output = response.choices[0].message.content or ""
            
            cleaned = raw_output.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            return json.loads(cleaned)
        except Exception as exc:
            raise RuntimeError(f"Projection generation failed: {exc}") from exc
