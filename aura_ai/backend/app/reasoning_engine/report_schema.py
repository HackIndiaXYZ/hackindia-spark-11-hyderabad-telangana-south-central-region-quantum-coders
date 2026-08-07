from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


RiskLabel = Literal["low", "moderate", "high", "critical"]


class OrganInsightModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    numerical_score: float
    risk_label: str
    top_factor: str
    explanation: str
    recommendation: str
    formula_name: str | None = None
    formula_version: str | None = None
    source_citation: str | None = None
    input_snapshot: dict[str, Any] | None = None
    confidence_level: str | None = None


class OrganInsightsModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    heart: OrganInsightModel
    lungs: OrganInsightModel
    liver: OrganInsightModel
    kidneys: OrganInsightModel
    brain: OrganInsightModel


class HealthReportModel(BaseModel):
    model_config = ConfigDict(extra="ignore")

    summary: str
    risk_level: str
    organ_insights: OrganInsightsModel
    causal_narrative: str
    priority_actions: list[str] = Field(min_length=3, max_length=3)
    what_if_insight: str
    feedback_integration: str
    disclaimer: str
    language_note: str


HEALTH_REPORT_JSON_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": [
        "summary",
        "risk_level",
        "organ_insights",
        "causal_narrative",
        "priority_actions",
        "what_if_insight",
        "feedback_integration",
        "disclaimer",
        "language_note",
    ],
    "properties": {
        "summary": {"type": "string"},
        "risk_level": {"type": "string"},
        "organ_insights": {
            "type": "object",
            "additionalProperties": False,
            "required": ["heart", "lungs", "liver", "kidneys", "brain"],
            "properties": {
                organ: {
                    "type": "object",
                    "additionalProperties": False,
                    "required": [
                        "numerical_score",
                        "risk_label",
                        "top_factor",
                        "explanation",
                        "recommendation",
                    ],
                    "properties": {
                        "numerical_score": {"type": "number"},
                        "risk_label": {"type": "string"},
                        "top_factor": {"type": "string"},
                        "explanation": {"type": "string"},
                        "recommendation": {"type": "string"},
                    },
                }
                for organ in ["heart", "lungs", "liver", "kidneys", "brain"]
            },
        },
        "causal_narrative": {"type": "string"},
        "priority_actions": {
            "type": "array",
            "minItems": 3,
            "maxItems": 3,
            "items": {"type": "string"},
        },
        "what_if_insight": {"type": "string"},
        "feedback_integration": {"type": "string"},
        "disclaimer": {"type": "string"},
        "language_note": {"type": "string"},
    },
}


class ReportOutputValidationError(ValueError):
    """Raised when a generated report does not match the output schema."""


def validate_report_output(report: dict[str, Any]) -> dict[str, Any]:
    try:
        validated = HealthReportModel.model_validate(report)
    except Exception as exc:  # pragma: no cover - pydantic provides the detail
        raise ReportOutputValidationError(str(exc)) from exc
    return validated.model_dump()

