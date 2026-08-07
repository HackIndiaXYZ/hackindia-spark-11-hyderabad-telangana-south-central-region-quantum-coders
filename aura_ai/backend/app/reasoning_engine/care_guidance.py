import os
import json
import re
from typing import Any
from openai import OpenAI

def _extract_json_dict(text: str) -> dict:
    text = text.strip()
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    return json.loads(text)

def generate_rule_based_care_guidance(query_or_profile: Any = None) -> dict:
    """Provides a safe, rule-based preventive care guidance response when LLM services are unconfigured or over-quota."""
    return {
        "provider": "llama_80b_fallback",
        "status": "success",
        "response_text": "Based on your active digital twin organ parameters, maintain consistent vital tracking, balanced hydration, and consult a physician for tailored clinical advice.",
        "message": "AI services are running in safe guidance mode.",
        "immediate_care_steps": [
            "Rest in a comfortable, well-ventilated space and track your vital signs.",
            "Maintain consistent hydration with small sips of water.",
            "Refrain from taking unprescribed medications or strenuous physical exertion."
        ],
        "dos_and_donts": [
            "Do: Keep a detailed log of your symptoms and baseline measurements.",
            "Do: Contact your primary care physician or specialist for evaluation.",
            "Do not: Ignore sudden severe chest pain, breathlessness, or severe headache.",
            "Do not: Consume alcohol, tobacco, or heavy meals during acute discomfort."
        ],
        "warning_signs": [
            "Persistent severe pain or oppression in chest or upper abdomen",
            "Shortness of breath or difficulty catching breath",
            "Sudden severe dizziness, confusion, or numbness"
        ],
        "supportive_note": "Your digital twin is tracking your biometrics. Please consult a qualified doctor for medical evaluation.",
        "safety_disclaimer": "This guidance is for temporary support only and does not replace professional medical care. Please consult a qualified healthcare provider as soon as possible."
    }

class CareGuidanceService:
    def __init__(self, model: str | None = None, api_key: str | None = None, base_url: str | None = None):
        # 1. Primary: OpenRouter Llama 3.3 70B/80B Instruct (meta-llama/llama-3.3-70b-instruct)
        openrouter_key = api_key or os.getenv("OPENAI_API_KEY")
        cerebras_key = os.getenv("CEREBRAS_API_KEY")
        
        self.clients = []
        
        # Primary OpenRouter Llama 80B Client
        if openrouter_key:
            openrouter_url = base_url or os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
            openrouter_model = model or os.getenv("LLM_MODEL", "meta-llama/llama-3.3-70b-instruct")
            self.clients.append({
                "client": OpenAI(api_key=openrouter_key, base_url=openrouter_url),
                "model": openrouter_model,
                "provider_label": "llama_80b_openrouter"
            })
            
        # Fallback Cerebras Client
        if cerebras_key:
            cerebras_url = os.getenv("CEREBRAS_BASE_URL", "https://api.cerebras.ai/v1")
            self.clients.append({
                "client": OpenAI(api_key=cerebras_key, base_url=cerebras_url),
                "model": "gpt-oss-120b",
                "provider_label": "llama_cerebras"
            })

    def generate(self, user_profile: dict, organ_scores: dict | None, symptoms: list[str] | None) -> dict:
        if not self.clients:
            print("[CareGuidanceService] No Llama 80B client configured. Using rule-based fallback.")
            return generate_rule_based_care_guidance(user_profile)
        
        context = f"User Profile: {json.dumps(user_profile)}\n"
        if organ_scores:
            context += f"Organ Risk Scores: {json.dumps(organ_scores)}\n"
        if symptoms:
            context += f"Symptoms: {json.dumps(symptoms)}\n"

        system_instruction = (
            "You are Aura AI — a clinical digital twin assistant powered by Llama 80B. Your job is to provide safe, temporary, "
            "non-clinical health guidance to help users understand their health twin biometrics.\n\n"
            "STRICT RULES:\n"
            "1. DO NOT diagnose diseases with absolute certainty.\n"
            "2. DO NOT prescribe unverified medicines or dosages.\n"
            "3. DO NOT replace a doctor.\n\n"
            "TONE: Professional, calm, empathetic, analytical.\n\n"
            "Mandatory JSON output schema:\n"
            "{\n"
            '  "response_text": "Clear explanation of user inquiry based on organ scores",\n'
            '  "immediate_care_steps": ["step 1", "step 2", "step 3"],\n'
            '  "dos_and_donts": ["Do: X", "Do not: Y"],\n'
            '  "warning_signs": ["sign 1", "sign 2"],\n'
            '  "supportive_note": "Calm reassurance text",\n'
            '  "safety_disclaimer": "This guidance is for temporary support only and does not replace professional medical care. Please consult a qualified healthcare provider as soon as possible."\n'
            "}"
        )

        user_prompt = f"Given the following digital twin information, generate care guidance:\n{context}"

        for entry in self.clients:
            try:
                client = entry["client"]
                target_model = entry["model"]
                label = entry["provider_label"]

                response = client.chat.completions.create(
                    model=target_model,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": user_prompt},
                    ],
                    max_tokens=600,
                    temperature=0.3
                )
                raw_output = response.choices[0].message.content or ""
                parsed = _extract_json_dict(raw_output)
                
                disclaimer = "This guidance is for temporary support only and does not replace professional medical care. Please consult a qualified healthcare provider as soon as possible."
                if not parsed.get("safety_disclaimer") or parsed["safety_disclaimer"] != disclaimer:
                    parsed["safety_disclaimer"] = disclaimer
                parsed["provider"] = label
                parsed["status"] = "success"
                return parsed
            except Exception as exc:
                print(f"[CareGuidanceService] Client ({entry['provider_label']}) failed: {exc}. Trying next provider...")

        print("[CareGuidanceService] All Llama providers failed. Executing fallback.")
        return generate_rule_based_care_guidance(user_profile)

    def generate_from_chat(self, query: str, organ_scores: dict | None = None) -> dict:
        if not self.clients:
            print("[CareGuidanceService] No Llama 80B client configured. Using rule-based fallback.")
            res = generate_rule_based_care_guidance(query)
            res["response_text"] = f"Regarding '{query}': Maintain regular biometric tracking and consult your healthcare provider."
            return res
        
        system_instruction = (
            "You are Aura AI Companion powered by Llama 80B. You are an expert clinical digital twin conversational assistant.\n"
            "Provide helpful, concise, empathetic, direct responses to user questions about their digital twin, organ health, clinical scores, and lifestyle recommendations.\n\n"
            "STRICT RULES:\n"
            "1. Be direct, conversational, and non-preachy.\n"
            "2. Keep responses structured, practical, and highly relevant to the query.\n"
            "3. Answer the specific question asked by the user directly in 'response_text'.\n\n"
            "Mandatory JSON output schema:\n"
            "{\n"
            '  "response_text": "Direct, thorough, conversational response answering the user question using Llama 80B AI",\n'
            '  "immediate_care_steps": ["Action step 1", "Action step 2"],\n'
            '  "dos_and_donts": ["Do: X", "Do not: Y"],\n'
            '  "warning_signs": ["Warning sign 1"],\n'
            '  "supportive_note": "Reassurance note",\n'
            '  "safety_disclaimer": "This guidance is for temporary support only and does not replace professional medical care. Please consult a qualified healthcare provider as soon as possible."\n'
            "}"
        )

        user_prompt = f"User Question: {query}\n"
        if organ_scores:
            user_prompt += f"Active Digital Twin Organ Scores: {json.dumps(organ_scores)}\n"

        for entry in self.clients:
            try:
                client = entry["client"]
                target_model = entry["model"]
                label = entry["provider_label"]

                response = client.chat.completions.create(
                    model=target_model,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": user_prompt},
                    ],
                    max_tokens=600,
                    temperature=0.3
                )
                raw_output = response.choices[0].message.content or ""
                parsed = _extract_json_dict(raw_output)
                
                disclaimer = "This guidance is for temporary support only and does not replace professional medical care. Please consult a qualified healthcare provider as soon as possible."
                if not parsed.get("safety_disclaimer") or parsed["safety_disclaimer"] != disclaimer:
                    parsed["safety_disclaimer"] = disclaimer
                parsed["provider"] = label
                parsed["status"] = "success"
                return parsed
            except Exception as exc:
                print(f"[CareGuidanceService] Chat call ({entry['provider_label']}) failed: {exc}. Trying next provider...")

        print("[CareGuidanceService] All Llama providers failed for chat. Executing fallback.")
        res = generate_rule_based_care_guidance(query)
        res["response_text"] = f"Regarding '{query}': Maintain regular biometric tracking and consult your physician for clinical advice."
        return res
