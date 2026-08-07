from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from .engine import generate_health_report
from .llm_writer import LLMWriterConfig, OpenAIResponsesWriter, WriterGenerationError
from .models import ORGANS, ReportRequest
from .report_schema import validate_report_output


class ReportWriter(Protocol):
    def generate(self, payload: dict, grounded_report: dict) -> dict: ...


@dataclass(frozen=True)
class ReportGenerationResult:
    report: dict
    requested_mode: str
    used_mode: str
    model: str | None = None
    fallback_reason: str | None = None


class HealthReportService:
    def __init__(self, writer_factory=None) -> None:
        self._writer_factory = writer_factory or (lambda config: OpenAIResponsesWriter(config))

    def generate(
        self,
        payload: dict,
        writer_mode: str = "deterministic",
        llm_config: LLMWriterConfig | None = None,
        allow_fallback: bool = True,
    ) -> ReportGenerationResult:
        request = ReportRequest.from_dict(payload)
        grounded_report = validate_report_output(generate_health_report(payload))
        
        if writer_mode == "deterministic":
            for organ in ORGANS:
                print(f"DEBUG: service.py - returning dynamic score for {organ}: {grounded_report['organ_insights'][organ]['numerical_score']}")
            return ReportGenerationResult(
                report=grounded_report,
                requested_mode=writer_mode,
                used_mode="deterministic",
            )

        # LLM Logic
        config = llm_config or LLMWriterConfig()
        writer = self._writer_factory(config)
        used_mode = "deterministic"
        fallback_reason = None
        llm_model = None

        try:
            llm_report = writer.generate(payload, grounded_report)
            # Safe Inject: Layer AI text onto the perfect grounded report
            if isinstance(llm_report, dict):
                if "summary" in llm_report:
                    grounded_report["summary"] = llm_report["summary"]
                if "causal_narrative" in llm_report:
                    grounded_report["causal_narrative"] = llm_report["causal_narrative"]
                used_mode = "llm"
                llm_model = config.model
        except Exception as exc:
            fallback_reason = str(exc)

        # REMOVED SABOTAGE: We no longer pin numerical_score to request.organ_scores.score
        # Clean up legacy keys for strict Pydantic extra="forbid"
        for organ in ORGANS:
            if "organ_insights" in grounded_report and organ in grounded_report["organ_insights"]:
                insight = grounded_report["organ_insights"][organ]
                insight.pop("score", None)

        # ONE Final Validation of the merged object
        final_valid_report = validate_report_output(grounded_report)

        return ReportGenerationResult(
            report=final_valid_report,
            requested_mode=writer_mode,
            used_mode=used_mode,
            model=llm_model,
            fallback_reason=fallback_reason,
        )

