"""
AURA Health — AI Lifestyle Interpreter Layer

Translates deterministic lifestyle engine output and non-PII intake metrics into
structured natural language insights using Llama 80B AI.

STRICT RULES:
1. NEVER recalculate numerical scores (Wellness Score, BMI, BioAge, Risk Tier).
2. Return STRICT JSON output only (No Markdown formatting, no HTML tags).
3. Do NOT transmit PII (Name, email, phone, address, Aadhaar).
4. Provide non-clinical, evidence-aware, supportive guidance.
"""

import os
import json
import re
import logging
from typing import Dict, Any, List
from openai import OpenAI

logger = logging.getLogger(__name__)

LIFESTYLE_AI_SYSTEM_PROMPT = """You are Aura, an evidence-aware AI Lifestyle Coach for the AURA Health platform.
Your task is to interpret structured, non-clinical patient lifestyle data and deterministic wellness assessment results into personalized natural language guidance.

STRICT CONSTRAINTS:
1. You MUST NOT calculate, alter, or generate any numerical scores (Wellness Score, BMI, Risk Tier, Biological Age). All numbers are already computed by a deterministic clinical engine and provided to you.
2. You MUST NOT diagnose medical conditions, predict life expectancy, or contradict the provided health data.
3. You MUST return ONLY a valid, parseable JSON object matching the exact schema below. Do NOT wrap the JSON in Markdown code fences (e.g. do NOT use ```json), do NOT include HTML, and do NOT add conversational text before or after the JSON.
4. Tone: Supportive, empathetic, evidence-aware, professional, and easy for patients to understand.

EXACT JSON RESPONSE SCHEMA REQUIRED:
{
  "summary": "1-2 short paragraphs explaining the patient's lifestyle baseline and habits.",
  "positive_habits": ["List of healthy habits to celebrate and continue"],
  "lifestyle_concerns": ["List of non-alarming, evidence-aware long-term lifestyle focus areas"],
  "recommendations": ["5-7 actionable, personalized habit recommendations"],
  "preventive_screenings": ["Suggested routine health practices or preventive screening discussions"],
  "weekly_action_plan": ["2-3 practical micro-goals for the upcoming week"],
  "motivation": "A short, realistic, encouraging closing message."
}"""

def _extract_json(text: str) -> dict:
    text = text.strip()
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    return json.loads(text)

def generate_lifestyle_ai_interpretation(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Generates structured AI lifestyle interpretation using Llama 80B AI with rule-based fallback."""
    # Sanitize payload to ensure NO PII is transmitted
    sanitized_input = {
        "demographics": {
            "age": payload.get("age", 30),
            "sex": payload.get("sex", "male"),
            "bmi": payload.get("bmi", 22.5),
            "height_cm": payload.get("height", 175),
            "weight_kg": payload.get("weight", 72)
        },
        "habits": {
            "sleep_hours": payload.get("sleep", 7),
            "activity_level": payload.get("activity", 3),
            "smoking": payload.get("smoking", False),
            "alcohol": payload.get("alcohol", False),
            "diet": payload.get("diet", "average")
        },
        "medical_background": {
            "normalized_diseases": payload.get("normalized_diseases", []),
            "clinical_sectors": payload.get("sectors", {}),
            "family_history_categories": payload.get("family_history_categories", {}),
            "major_surgeries": payload.get("major_surgeries", "None")
        },
        "deterministic_engine_results": {
            "wellness_score": payload.get("wellness_score", 88),
            "overall_lifestyle_tier": payload.get("overall_lifestyle_tier", "Healthy Baseline"),
            "lifestyle_biological_age_estimate": payload.get("lifestyle_biological_age_estimate", payload.get("age", 30))
        }
    }

    # Prepare Llama 80B Clients (OpenRouter Llama 3.3 70B/80B primary, Cerebras secondary)
    openrouter_key = os.getenv("OPENAI_API_KEY")
    cerebras_key = os.getenv("CEREBRAS_API_KEY")

    clients = []
    if openrouter_key:
        clients.append({
            "client": OpenAI(api_key=openrouter_key, base_url=os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")),
            "model": os.getenv("LLM_MODEL", "meta-llama/llama-3.3-70b-instruct"),
            "label": "llama_80b_openrouter"
        })
    if cerebras_key:
        clients.append({
            "client": OpenAI(api_key=cerebras_key, base_url=os.getenv("CEREBRAS_BASE_URL", "https://api.cerebras.ai/v1")),
            "model": "gpt-oss-120b",
            "label": "llama_cerebras"
        })

    prompt = f"Patient Non-PII Lifestyle Profile:\n{json.dumps(sanitized_input, indent=2)}\n\nGenerate structured JSON interpretation."

    for entry in clients:
        try:
            client = entry["client"]
            target_model = entry["model"]
            label = entry["label"]

            response = client.chat.completions.create(
                model=target_model,
                messages=[
                    {"role": "system", "content": LIFESTYLE_AI_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=1000
            )
            raw_text = response.choices[0].message.content or ""
            parsed_json = _extract_json(raw_text)
            parsed_json["is_ai_generated"] = True
            parsed_json["provider"] = label
            parsed_json["status"] = "success"
            return parsed_json
        except Exception as err:
            logger.warning(f"[Lifestyle AI] Client ({entry['label']}) failed: {err}. Trying next Llama provider...")

    # Rule-Based Fallback Generator
    logger.info("[Lifestyle AI] Executing rule-based fallback generator.")
    fallback_res = generate_rule_based_lifestyle_ai(sanitized_input)
    fallback_res["provider"] = "fallback"
    fallback_res["status"] = "success"
    fallback_res["message"] = "AI services are temporarily running in safe mode."
    return fallback_res


def generate_rule_based_lifestyle_ai(data: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback generator when LLM API key is unconfigured or offline."""
    demo = data["demographics"]
    habits = data["habits"]
    results = data["deterministic_engine_results"]
    med = data["medical_background"]

    score = results.get("wellness_score", 88)
    tier = results.get("overall_lifestyle_tier", "Healthy Baseline")
    bio_age = results.get("lifestyle_biological_age_estimate", demo["age"])

    pos_habits: List[str] = []
    concerns: List[str] = []
    recs: List[str] = []
    screenings: List[str] = []
    weekly: List[str] = []

    if habits["sleep_hours"] >= 7:
        pos_habits.append("Adequate sleep duration (7+ hours nightly) supporting autonomic recovery.")
    else:
        concerns.append("Restricted nightly sleep duration (<6 hours) impacting neuro-endocrine recovery.")

    if not habits["smoking"]:
        pos_habits.append("Non-smoker status preserving endothelial function and lung stamina.")
    else:
        concerns.append("Active tobacco exposure elevating vascular oxidative strain.")

    if habits["activity_level"] >= 3:
        pos_habits.append("Consistent weekly physical exercise optimizing muscle glucose uptake.")
    else:
        concerns.append("Sedentary or low activity patterns reducing cardiovascular elasticity.")

    if demo["bmi"] >= 18.5 and demo["bmi"] < 25.0:
        pos_habits.append("Healthy Body Mass Index (18.5 - 24.9 kg/m²) reducing metabolic load.")
    elif demo["bmi"] >= 25.0:
        concerns.append("Elevated Body Mass Index (≥25.0 kg/m²) adding glycemic and arterial load.")

    if not pos_habits:
        pos_habits.append("Initiating proactive health digital twin tracking and biometric self-awareness.")

    recs.append("Target 7–8 hours of uninterrupted sleep nightly to support systemic restorative processes.")
    recs.append("Incorporate at least 150 minutes of moderate aerobic exercise (brisk walking, cycling) weekly.")
    recs.append("Prioritize unprocessed whole foods, lean proteins, and complex carbohydrates in daily meal planning.")
    recs.append("Schedule annual wellness blood screening including lipid panel, HbA1c, and renal baseline.")
    recs.append("Maintain optimal daily hydration (2.5–3.0 L water) to support kidney filtration.")

    screenings.append("Annual resting blood pressure and fasting lipid panel check.")
    screenings.append("Baseline HbA1c blood glucose screening with primary physician.")

    weekly.append("Walk 20 minutes daily after main meals.")
    weekly.append("Establish a consistent sleep schedule (in bed by 10:30 PM).")

    summary_text = (
        f"Your general lifestyle assessment reflects an overall status of '{tier}' with a Wellness Score of {score}/100. "
        f"Based on your self-reported habits (sleep: {habits['sleep_hours']}h/night, BMI: {demo['bmi']}, smoking: {habits['smoking']}), "
        f"your estimated biological age baseline is approximately {bio_age} years. "
        "Maintaining regular activity, restorative sleep, and balanced nutrition will help preserve long-term vascular and metabolic vitality."
    )

    return {
        "summary": summary_text,
        "positive_habits": pos_habits,
        "lifestyle_concerns": concerns,
        "recommendations": recs,
        "preventive_screenings": screenings,
        "weekly_action_plan": weekly,
        "motivation": "Small, consistent daily habit improvements compound into remarkable long-term health vitality.",
        "is_ai_generated": False
    }
