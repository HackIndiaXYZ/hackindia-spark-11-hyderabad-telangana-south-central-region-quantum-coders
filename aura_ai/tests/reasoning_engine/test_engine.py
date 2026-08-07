from __future__ import annotations

from backend.app.reasoning_engine.engine import generate_health_report
from backend.app.reasoning_engine.models import ValidationError


def make_payload() -> dict:
    return {
        "user_profile": {
            "age": 55,
            "sex": "male",
            "bmi": 31.2,
            "sleep_hours": 5.8,
            "activity_level": "sedentary",
            "diet_type": "processed",
            "smoker": True,
            "alcohol_units_per_week": 18,
        },
        "organ_scores": {
            "heart": {"score": 72, "uncertainty": 10},
            "lungs": {"score": 78, "uncertainty": 9},
            "liver": {"score": 69, "uncertainty": 8},
            "kidneys": {"score": 58, "uncertainty": 7},
            "brain": {"score": 62, "uncertainty": 6},
        },
        "guidelines_applied": [
            "Framingham Risk Score",
            "AUDIT-C",
            "WHO BMI-Activity",
        ],
        "language": "English",
        "report_type": "full_simulation",
    }


def test_generates_complete_report_schema() -> None:
    report = generate_health_report(make_payload())

    assert set(report) == {
        "summary",
        "risk_level",
        "organ_insights",
        "causal_narrative",
        "priority_actions",
        "what_if_insight",
        "feedback_integration",
        "disclaimer",
        "language_note",
    }
    assert set(report["organ_insights"]) == {"heart", "lungs", "liver", "kidneys", "brain"}
    assert report["risk_level"] == "high"
    assert len(report["priority_actions"]) == 3
    assert "healthcare professional" in report["summary"]


def test_guideline_grounding_mentions_framingham_and_audit_c() -> None:
    report = generate_health_report(make_payload())

    assert "Framingham" in report["organ_insights"]["heart"]["explanation"]
    assert "AUDIT-C" in report["organ_insights"]["liver"]["explanation"]


def test_optional_branches_are_populated() -> None:
    payload = make_payload()
    payload["what_if_delta"] = {
        "changed_variable": "activity_level",
        "old_value": "sedentary",
        "new_value": "moderate",
        "new_organ_scores": {
            "heart": {"score": 60, "uncertainty": 10},
            "lungs": {"score": 72, "uncertainty": 9},
            "liver": {"score": 64, "uncertainty": 8},
            "kidneys": {"score": 52, "uncertainty": 7},
            "brain": {"score": 56, "uncertainty": 6},
        },
    }
    payload["feedback_observations"] = [
        {"date": "2026-04-01", "observation": "resting_heart_rate", "value": 84},
        {"date": "2026-04-10", "observation": "sleep_tracker_avg", "value": 6.1},
    ]

    report = generate_health_report(payload)

    assert "activity_level" in report["what_if_insight"]
    assert "heart (12 points lower)" in report["what_if_insight"]
    assert "resting heart rate" in report["feedback_integration"]
    assert "mixed" in report["feedback_integration"]


def test_hindi_output_uses_requested_language() -> None:
    payload = make_payload()
    payload["language"] = "Hindi"

    report = generate_health_report(payload)

    assert report["language_note"] == "रिपोर्ट हिंदी में तैयार की गई है।"
    assert "यह सिमुलेशन" in report["disclaimer"]


def test_feedback_observations_can_support_low_risk_pattern() -> None:
    payload = make_payload()
    payload["organ_scores"]["heart"]["score"] = 20
    payload["organ_scores"]["brain"]["score"] = 24
    payload["feedback_observations"] = [
        {"date": "2026-04-01", "observation": "resting_heart_rate", "value": 68},
        {"date": "2026-04-10", "observation": "sleep_tracker_avg", "value": 7.4},
    ]

    report = generate_health_report(payload)

    assert "supports" in report["feedback_integration"]
    assert "average sleep duration" in report["feedback_integration"]


def test_validation_rejects_missing_organs() -> None:
    payload = make_payload()
    del payload["organ_scores"]["brain"]

    try:
        generate_health_report(payload)
    except ValidationError as exc:
        assert "missing organ entries" in str(exc)
    else:
        raise AssertionError("ValidationError was not raised")
