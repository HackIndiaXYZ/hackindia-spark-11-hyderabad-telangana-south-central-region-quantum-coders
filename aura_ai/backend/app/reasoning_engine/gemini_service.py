from __future__ import annotations
import os
import logging
from typing import Any

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover - optional install
    genai = None  # type: ignore[misc, assignment]


SYSTEM_PROMPT = """You are Aura, an empathetic AI health consultant powered by the Digital Twin Health platform.
You have access to the user's current health simulation data which is provided in the context.
Your role is to:
1. Answer health questions clearly and compassionately
2. Reference the user's specific organ scores when relevant
3. Explain what their risk scores mean in simple terms
4. Suggest lifestyle improvements based on their data
5. Always remind users you are an AI and not a replacement for a doctor

Keep responses concise (3-5 sentences max) and conversational — this is a voice interface.
NEVER make up diagnoses. Always ground advice in the provided health data.
Respond in the SAME LANGUAGE the user used to ask the question."""


def generate_rule_based_voice_consult(user_message: str, health_context: dict | None = None) -> str:
    """Synthesizes an empathetic, evidence-based voice consultation response when Gemini is offline/over-quota."""
    msg = user_message.lower()
    
    organ_alerts = []
    if health_context and isinstance(health_context.get("organ_insights"), dict):
        for organ, data in health_context["organ_insights"].items():
            if isinstance(data, dict) and data.get("numerical_score", 0) > 40:
                organ_alerts.append(f"{organ.title()} ({data.get('risk_label', 'moderate risk')})")

    context_note = f" Based on your Digital Twin simulation, we are monitoring {', '.join(organ_alerts)}." if organ_alerts else ""

    if "heart" in msg or "cardio" in msg or "blood pressure" in msg or "chest" in msg:
        reply = f"AI services are temporarily unavailable. Showing rule-based guidance.{context_note} For cardiovascular wellness, prioritize steady aerobic exercise, maintain sodium under 2,300mg daily, and track your blood pressure resting baseline. Please consult a cardiologist for clinical evaluation."
    elif "kidney" in msg or "creatinine" in msg or "egfr" in msg:
        reply = f"AI services are temporarily unavailable. Showing rule-based guidance.{context_note} To support renal function, stay well-hydrated with 2.5–3 liters of fluid daily and avoid over-the-counter NSAID pain relievers. Schedule routine kidney function lab monitoring."
    elif "liver" in msg or "alt" in msg or "ast" in msg:
        reply = f"AI services are temporarily unavailable. Showing rule-based guidance.{context_note} Hepatic health improves significantly with alcohol restriction, balanced dietary fats, and daily physical movement. Follow up with your doctor for periodic liver enzyme panels."
    elif "lung" in msg or "breath" in msg or "oxygen" in msg:
        reply = f"AI services are temporarily unavailable. Showing rule-based guidance.{context_note} Respiratory capacity is supported by avoiding smoke exposure, practicing deep diaphragmatic breathing, and staying active. Seek medical evaluation if you experience persistent breathlessness."
    elif "brain" in msg or "sleep" in msg or "headache" in msg or "stress" in msg:
        reply = f"AI services are temporarily unavailable. Showing rule-based guidance.{context_note} Neuro-cognitive recovery relies on 7 to 8 hours of consistent nightly sleep, stress reduction, and mental stimulation. Consult a neurologist or specialist if symptoms persist."
    else:
        reply = f"AI services are temporarily unavailable. Showing rule-based guidance.{context_note} To maintain optimal baseline health, balance structured daily activity, balanced nutrition, and regular preventive check-ups with your healthcare provider."

    return reply


try:
    from openai import OpenAI
except ImportError:
    OpenAI = None  # type: ignore[misc, assignment]


class GeminiVoiceService:
    def __init__(self) -> None:
        self._model = None

    def _get_cerebras_reply(
        self,
        user_message: str,
        health_context: dict | None = None,
        chat_history: list[dict] | None = None,
    ) -> str | None:
        """Attempts Cerebras platform Llama 70B execution for ultra-fast chat responses."""
        if OpenAI is None:
            return None
        api_key = os.getenv("CEREBRAS_API_KEY", "csk-58p2969k8cvwjy9rxfdw24yk2tmv4edrm83v49ed52yxjpe9")
        base_url = os.getenv("CEREBRAS_BASE_URL", "https://api.cerebras.ai/v1")
        if not api_key:
            return None

        try:
            client = OpenAI(api_key=api_key, base_url=base_url)
            messages: list[Any] = [{"role": "system", "content": SYSTEM_PROMPT}]

            # Context parts
            if health_context and isinstance(health_context.get("organ_insights"), dict):
                ctx_parts = []
                for organ, data in health_context["organ_insights"].items():
                    score = data.get("numerical_score", "N/A")
                    label = data.get("risk_label", "N/A")
                    ctx_parts.append(f"{organ.title()}: {score}/100 ({label})")
                messages.append({
                    "role": "system",
                    "content": f"[Digital Twin Real-Time Organ Metrics: {', '.join(ctx_parts)}]"
                })

            if chat_history:
                for msg in chat_history[-6:]:
                    role = "user" if msg["role"] == "user" else "assistant"
                    messages.append({"role": role, "content": msg["content"]})

            messages.append({"role": "user", "content": user_message})

            response = client.chat.completions.create(
                model="llama-3.3-70b",
                messages=messages,
                temperature=0.3,
                max_tokens=450,
            )
            text = response.choices[0].message.content or ""
            return text.strip() if text else None
        except Exception as err:
            logger.warning(f"[Cerebras Voice Engine] Call notice ({err}). Proceeding to secondary Gemini pipeline.")
            return None

    def _get_model(self):
        if genai is None:
            raise ValueError(
                "google-generativeai is not installed. Run: pip install google-generativeai"
            )
        # GEMINI_API_KEY is primary key as requested
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY_1") or os.getenv("GEMINI_API_KEY_2")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        genai.configure(api_key=api_key)
        return genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
        )

    def _get_gemini_reply(
        self,
        user_message: str,
        health_context: dict | None = None,
        chat_history: list[dict] | None = None,
    ) -> str:
        """Executes Gemini 2.0 Flash AI generation."""
        model = self._get_model()

        # Build health context string
        context_parts = []
        if health_context:
            organ_insights = health_context.get("organ_insights", {})
            risk_level = health_context.get("risk_level", "unknown")
            summary = health_context.get("summary", "")
            context_parts.append(f"CURRENT HEALTH DATA:\n- Overall Risk Level: {risk_level}")
            if summary:
                context_parts.append(f"- Summary: {summary}")
            if organ_insights:
                context_parts.append("- Organ Scores:")
                for organ, data in organ_insights.items():
                    score = data.get("numerical_score", "N/A")
                    label = data.get("risk_label", "N/A")
                    context_parts.append(f"  • {organ.title()}: {score}/100 ({label})")

        # Compose Gemini chat history
        history = []
        if chat_history:
            for msg in chat_history[-6:]:  # Last 3 exchanges
                role = "user" if msg["role"] == "user" else "model"
                history.append({"role": role, "parts": [msg["content"]]})

        chat = model.start_chat(history=history)

        # Prepend health context to the first message
        full_message = user_message
        if context_parts:
            ctx_string = "\n".join(context_parts)
            full_message = f"[Health Context]\n{ctx_string}\n\n[User Question]\n{user_message}"

        response = chat.send_message(full_message)
        text = getattr(response, "text", None)
        if not text:
            parts = getattr(response, "parts", None) or []
            text = "".join(getattr(p, "text", "") for p in parts)
        return (text or "I couldn’t generate a reply. Please try again.").strip()

    def consult(
        self,
        user_message: str,
        health_context: dict | None = None,
        chat_history: list[dict] | None = None,
        is_voice: bool = False,
    ) -> str:
        """
        Routes user query based on mode:
        - Voice/Spoken input (is_voice=True): Gemini 2.0 Flash is Primary.
        - Typed Chat Console Messaging (is_voice=False): Cerebras Llama 70B is Primary.
        """
        if is_voice:
            # Voice Mode: Gemini 2.0 Flash Primary
            try:
                return self._get_gemini_reply(user_message, health_context, chat_history)
            except Exception as err:
                logger.warning(f"[Gemini Voice] Primary call failed ({err}). Trying Cerebras fallback.")
                cerebras_text = self._get_cerebras_reply(user_message, health_context, chat_history)
                if cerebras_text:
                    return cerebras_text
                return generate_rule_based_voice_consult(user_message, health_context)

        # Chat Messaging Mode: Cerebras Llama 70B Primary
        cerebras_text = self._get_cerebras_reply(user_message, health_context, chat_history)
        if cerebras_text:
            return cerebras_text

        # Secondary Gemini 2.0 Flash Fallback
        try:
            return self._get_gemini_reply(user_message, health_context, chat_history)
        except Exception as err:
            logger.warning(f"[Gemini Voice Service] All LLM engines failed or quota exceeded ({err}). Executing rule-based voice consult fallback.")
            return generate_rule_based_voice_consult(user_message, health_context)
