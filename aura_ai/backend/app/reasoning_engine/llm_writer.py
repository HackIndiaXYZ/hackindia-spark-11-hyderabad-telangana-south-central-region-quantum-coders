from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any

from openai import OpenAI

from .report_schema import HEALTH_REPORT_JSON_SCHEMA, validate_report_output


class WriterGenerationError(RuntimeError):
    """Raised when the configured writer cannot produce a valid report."""


@dataclass(frozen=True)
class LLMWriterConfig:
    model: str = os.getenv("LLM_MODEL", "meta-llama/llama-3.3-70b-instruct")
    reasoning_effort: str = "medium"
    max_output_tokens: int = 4096
    temperature: float | None = None
    api_key_env: str = "OPENAI_API_KEY"
    base_url: str | None = None


class OpenAIResponsesWriter:
    def __init__(self, config: LLMWriterConfig, client: OpenAI | None = None) -> None:
        self.config = config
        if client is not None:
            self.client = client
            return
        api_key = os.getenv(config.api_key_env)
        if not api_key:
            raise WriterGenerationError(
                f"{config.api_key_env} is not set, so LLM writer mode is unavailable."
            )
        self.client = OpenAI(api_key=api_key, base_url=config.base_url)

    def generate(self, payload: dict[str, Any], grounded_report: dict[str, Any]) -> dict[str, Any]:
        # Step 5: Fix LLM Input - Inject dynamic context
        profile = payload.get("user_profile", {})
        
        # Only ask the AI to rewrite the specific narrative parts
        narrative_subset = {
            "summary": grounded_report["summary"],
            "causal_narrative": grounded_report["causal_narrative"]
        }
        
        instructions = (
            "You are a cutting-edge clinical researcher and health coach. I will provide you a technical report. "
            "Your task is to provide a DEEP biological interpretation of the results. "
            "Don't just paraphrase; explain the physiological 'why' behind the risks. "
            f"CONTEXT: Analyzing a {profile.get('age')}-year-old {profile.get('sex')} "
            f"(BMI: {profile.get('bmi')}, Smoker: {profile.get('smoker')}). "
            "Use a professional, visionary, and empathetic tone. Every response must feel fresh and unique. "
            "Return ONLY a JSON object with: 'summary' and 'causal_narrative'."
        )
        prompt = f"Technical Narratives to Rewrite:\n{json.dumps(narrative_subset, indent=2)}"
        
        try:
            response = self.client.chat.completions.create(
                model=self.config.model,
                messages=[
                    {"role": "system", "content": instructions},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=1000,
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            raw_output = response.choices[0].message.content
            if raw_output is None:
                raise WriterGenerationError("LLM writer failed: Received empty content response.")
            parsed = json.loads(raw_output)
            return parsed
        except Exception as exc:
            raise WriterGenerationError(f"LLM writer failed: {exc}") from exc
 

def build_grounded_writer_prompt(
    payload: dict[str, Any], grounded_report: dict[str, Any]
) -> tuple[str, str]:
    instructions = (
        "You are an empathetic health coach. I will give you a technical health report. "
        "Your job is to rewrite the 'summary' and 'causal_narrative' to be more human, encouraging, and easy to understand. "
        "IMPORTANT: You must return the FULL JSON report back to me. "
        "Keep all numerical scores and risk labels exactly as they are. "
        "Return ONLY the raw JSON data. Do not include a JSON Schema or any preamble."
    )
    prompt = (
        f"Grounded Report to Rewrite:\n{json.dumps(grounded_report, ensure_ascii=False, indent=2)}\n\n"
        "Task: Rewrite the 'summary' and 'causal_narrative' for better empathy, then return the complete JSON object."
    )
    return instructions, prompt
