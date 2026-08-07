from __future__ import annotations

from fastapi.testclient import TestClient

from backend.app.api import create_app
from backend.app.reasoning_engine.llm_writer import WriterGenerationError
from backend.app.reasoning_engine.service import HealthReportService


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


class FakeWriter:
    def __init__(self, report: dict | None = None, error: Exception | None = None) -> None:
        self.report = report
        self.error = error

    def generate(self, payload: dict, grounded_report: dict) -> dict:
        del payload
        if self.error:
            raise self.error
        updated = dict(grounded_report)
        updated["summary"] = self.report["summary"] if self.report else grounded_report["summary"]
        return updated


def test_service_uses_llm_writer_when_available() -> None:
    service = HealthReportService(
        writer_factory=lambda config: FakeWriter(
            report={"summary": f"LLM polished summary via {config.model}."}
        )
    )

    result = service.generate(make_payload(), writer_mode="llm")

    assert result.used_mode == "llm"
    assert result.report["summary"] == "LLM polished summary via gpt-5.4-mini."


def test_service_falls_back_to_deterministic_on_writer_failure() -> None:
    service = HealthReportService(
        writer_factory=lambda config: FakeWriter(
            error=WriterGenerationError(f"{config.model} unavailable")
        )
    )

    result = service.generate(make_payload(), writer_mode="llm", allow_fallback=True)

    assert result.used_mode == "deterministic"
    assert "unavailable" in (result.fallback_reason or "")


def test_fastapi_endpoint_returns_report_and_writer_headers() -> None:
    service = HealthReportService()
    client = TestClient(create_app(service=service))

    response = client.post("/v1/health-report", json={"payload": make_payload()})

    assert response.status_code == 200
    assert response.headers["x-writer-requested"] == "deterministic"
    assert response.headers["x-writer-used"] == "deterministic"
    assert response.json()["risk_level"] == "high"


def test_fastapi_endpoint_exposes_fallback_header() -> None:
    service = HealthReportService(
        writer_factory=lambda config: FakeWriter(
            error=WriterGenerationError(f"{config.model} temporarily unavailable")
        )
    )
    client = TestClient(create_app(service=service))

    response = client.post(
        "/v1/health-report",
        json={"payload": make_payload(), "writer_mode": "llm", "allow_fallback": True},
    )

    assert response.status_code == 200
    assert response.headers["x-writer-requested"] == "llm"
    assert response.headers["x-writer-used"] == "deterministic"
    assert "temporarily unavailable" in response.headers["x-writer-fallback"]

