from __future__ import annotations

from dataclasses import dataclass
from typing import Any


class ValidationError(ValueError):
    """Raised when an incoming report payload does not match the contract."""


SUPPORTED_LANGUAGES = {
    "english": "English",
    "hindi": "Hindi",
    "telugu": "Telugu",
}

SUPPORTED_REPORT_TYPES = {
    "full_simulation",
    "what_if",
    "pdf_report_analysis",
}

ORGANS = ("heart", "lungs", "liver", "kidneys", "brain")


@dataclass(frozen=True)
class UserProfile:
    age: int
    sex: str
    bmi: float
    sleep_hours: float
    activity_level: str
    diet_type: str
    smoker: bool
    alcohol_units_per_week: float

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> "UserProfile":
        required = {
            "age",
            "sex",
            "bmi",
            "sleep_hours",
            "activity_level",
            "diet_type",
            "smoker",
            "alcohol_units_per_week",
        }
        missing = sorted(required - raw.keys())
        if missing:
            raise ValidationError(f"user_profile is missing required fields: {missing}")

        age = _require_int(raw["age"], "user_profile.age")
        if age < 0 or age > 120:
            raise ValidationError("user_profile.age must be between 0 and 120")

        bmi = _require_number(raw["bmi"], "user_profile.bmi")
        sleep_hours = _require_number(raw["sleep_hours"], "user_profile.sleep_hours")
        alcohol_units = _require_number(
            raw["alcohol_units_per_week"], "user_profile.alcohol_units_per_week"
        )

        return cls(
            age=age,
            sex=_require_non_empty_string(raw["sex"], "user_profile.sex"),
            bmi=bmi,
            sleep_hours=sleep_hours,
            activity_level=_require_non_empty_string(
                raw["activity_level"], "user_profile.activity_level"
            ),
            diet_type=_require_non_empty_string(raw["diet_type"], "user_profile.diet_type"),
            smoker=_require_bool(raw["smoker"], "user_profile.smoker"),
            alcohol_units_per_week=alcohol_units,
        )


@dataclass(frozen=True)
class OrganScore:
    score: float
    uncertainty: float

    @classmethod
    def from_dict(cls, organ: str, raw: dict[str, Any]) -> "OrganScore":
        if not isinstance(raw, dict):
            raise ValidationError(f"organ_scores.{organ} must be an object")

        score = _require_number(raw.get("score"), f"organ_scores.{organ}.score")
        uncertainty = _require_number(
            raw.get("uncertainty"), f"organ_scores.{organ}.uncertainty"
        )
        if not 0 <= score <= 100:
            raise ValidationError(f"organ_scores.{organ}.score must be between 0 and 100")
        if not 0 <= uncertainty <= 100:
            raise ValidationError(
                f"organ_scores.{organ}.uncertainty must be between 0 and 100"
            )
        return cls(score=score, uncertainty=uncertainty)


@dataclass(frozen=True)
class WhatIfDelta:
    changed_variable: str
    old_value: Any
    new_value: Any
    new_organ_scores: dict[str, OrganScore]

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> "WhatIfDelta":
        required = {"changed_variable", "old_value", "new_value", "new_organ_scores"}
        missing = sorted(required - raw.keys())
        if missing:
            raise ValidationError(f"what_if_delta is missing required fields: {missing}")

        scores = _parse_organ_scores(raw["new_organ_scores"], "what_if_delta.new_organ_scores")
        return cls(
            changed_variable=_require_non_empty_string(
                raw["changed_variable"], "what_if_delta.changed_variable"
            ),
            old_value=raw["old_value"],
            new_value=raw["new_value"],
            new_organ_scores=scores,
        )


@dataclass(frozen=True)
class FeedbackObservation:
    date: str
    observation: str
    value: Any

    @classmethod
    def from_dict(cls, raw: dict[str, Any], index: int) -> "FeedbackObservation":
        required = {"date", "observation", "value"}
        missing = sorted(required - raw.keys())
        if missing:
            raise ValidationError(
                f"feedback_observations[{index}] is missing required fields: {missing}"
            )

        return cls(
            date=_require_non_empty_string(raw["date"], f"feedback_observations[{index}].date"),
            observation=_require_non_empty_string(
                raw["observation"], f"feedback_observations[{index}].observation"
            ),
            value=raw["value"],
        )


@dataclass(frozen=True)
class ReportRequest:
    user_profile: UserProfile
    organ_scores: dict[str, OrganScore]
    guidelines_applied: list[str]
    language: str
    report_type: str
    what_if_delta: WhatIfDelta | None = None
    feedback_observations: list[FeedbackObservation] | None = None

    @classmethod
    def from_dict(cls, raw: dict[str, Any]) -> "ReportRequest":
        required = {
            "user_profile",
            "organ_scores",
            "guidelines_applied",
            "language",
            "report_type",
        }
        missing = sorted(required - raw.keys())
        if missing:
            raise ValidationError(f"payload is missing required fields: {missing}")

        if not isinstance(raw["guidelines_applied"], list) or not raw["guidelines_applied"]:
            raise ValidationError("guidelines_applied must be a non-empty list")

        normalized_language = normalize_language(
            _require_non_empty_string(raw["language"], "language")
        )
        report_type = _require_non_empty_string(raw["report_type"], "report_type")
        if report_type not in SUPPORTED_REPORT_TYPES:
            raise ValidationError(
                "report_type must be one of full_simulation, what_if, pdf_report_analysis"
            )

        observations: list[FeedbackObservation] | None = None
        if "feedback_observations" in raw and raw["feedback_observations"] is not None:
            feedback_raw = raw["feedback_observations"]
            if not isinstance(feedback_raw, list):
                raise ValidationError("feedback_observations must be a list when provided")
            observations = [
                FeedbackObservation.from_dict(item, index)
                for index, item in enumerate(feedback_raw)
            ]

        what_if = None
        if "what_if_delta" in raw and raw["what_if_delta"] is not None:
            if not isinstance(raw["what_if_delta"], dict):
                raise ValidationError("what_if_delta must be an object when provided")
            what_if = WhatIfDelta.from_dict(raw["what_if_delta"])

        return cls(
            user_profile=UserProfile.from_dict(raw["user_profile"]),
            organ_scores=_parse_organ_scores(raw["organ_scores"], "organ_scores"),
            guidelines_applied=[
                _require_non_empty_string(item, f"guidelines_applied[{index}]")
                for index, item in enumerate(raw["guidelines_applied"])
            ],
            language=normalized_language,
            report_type=report_type,
            what_if_delta=what_if,
            feedback_observations=observations,
        )


def normalize_language(value: str) -> str:
    key = value.strip().lower()
    if key not in SUPPORTED_LANGUAGES:
        supported = ", ".join(sorted(SUPPORTED_LANGUAGES.values()))
        raise ValidationError(f"language must be one of: {supported}")
    return SUPPORTED_LANGUAGES[key]


def _parse_organ_scores(raw: Any, field_name: str) -> dict[str, OrganScore]:
    if not isinstance(raw, dict):
        raise ValidationError(f"{field_name} must be an object")
    missing = sorted(set(ORGANS) - raw.keys())
    if missing:
        raise ValidationError(f"{field_name} is missing organ entries: {missing}")

    parsed: dict[str, OrganScore] = {}
    for organ in ORGANS:
        parsed[organ] = OrganScore.from_dict(organ, raw[organ])
    return parsed


def _require_non_empty_string(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{field_name} must be a non-empty string")
    return value.strip()


def _require_number(value: Any, field_name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValidationError(f"{field_name} must be a number")
    return float(value)


def _require_int(value: Any, field_name: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValidationError(f"{field_name} must be an integer")
    return value


def _require_bool(value: Any, field_name: str) -> bool:
    if not isinstance(value, bool):
        raise ValidationError(f"{field_name} must be a boolean")
    return value
