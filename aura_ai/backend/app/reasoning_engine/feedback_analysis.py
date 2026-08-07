from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Any

from .i18n import observation_label, organ_label
from .models import FeedbackObservation, ReportRequest


@dataclass(frozen=True)
class FeedbackSignal:
    organ: str
    observation: str
    status: str
    detail: str
    score: int
    observed_date: str


@dataclass(frozen=True)
class FeedbackAnalysisResult:
    narrative: str
    contradiction_scores: dict[str, int]
    confidence_adjustments: dict[str, str]


def analyze_feedback(request: ReportRequest) -> FeedbackAnalysisResult:
    observations = request.feedback_observations or []
    if not observations:
        return FeedbackAnalysisResult(
            narrative="",
            contradiction_scores={organ: 0 for organ in request.organ_scores},
            confidence_adjustments={organ: "" for organ in request.organ_scores},
        )

    signals = [
        signal
        for item in observations
        if (signal := _classify_observation(request, item)) is not None
    ]
    contradiction_scores = _contradiction_scores(request, signals)
    confidence_adjustments = _confidence_adjustments(request, contradiction_scores)
    narrative = _build_feedback_narrative(request, observations, signals, contradiction_scores)
    return FeedbackAnalysisResult(
        narrative=narrative,
        contradiction_scores=contradiction_scores,
        confidence_adjustments=confidence_adjustments,
    )


def _build_feedback_narrative(
    request: ReportRequest,
    observations: list[FeedbackObservation],
    signals: list[FeedbackSignal],
    contradiction_scores: dict[str, int],
) -> str:
    if not signals:
        listed = ", ".join(
            observation_label(request.language, item.observation) for item in observations[:3]
        )
        if request.language == "English":
            return (
                f"Real-world observations were provided for {listed}. They add useful context, but the current observation types do not map cleanly enough to a specific organ interpretation, so they should mainly be used to refine future inputs."
            )
        if request.language == "Hindi":
            return (
                f"{listed} के लिए real-world observations दिए गए हैं। ये उपयोगी context जोड़ते हैं, लेकिन मौजूदा observation types किसी एक organ interpretation से साफ रूप से नहीं जुड़ते, इसलिए इन्हें future inputs को बेहतर करने के लिए उपयोग करना चाहिए।"
            )
        return (
            f"{listed} కోసం real-world observations అందించబడ్డాయి. ఇవి ఉపయోగకరమైన context ఇస్తాయి, కానీ ప్రస్తుత observation types ను ఒక నిర్దిష్ట organ interpretation తో స్పష్టంగా కట్టడం కష్టం, కాబట్టి future inputs ను మెరుగుపరచడానికి వీటిని ఉపయోగించాలి."
        )

    supportive = [signal for signal in signals if signal.status == "supports"]
    contradictory = [signal for signal in signals if signal.status == "contradicts"]
    mixed = [signal for signal in signals if signal.status == "mixed"]
    trends = _trend_summaries(request, observations)
    top_organ = max(request.organ_scores.items(), key=lambda item: item[1].score)[0]
    top_confidence = confidence_adjustments_text(request, contradiction_scores, top_organ)

    if request.language == "English":
        chunks = [
            "Real-world observations were provided and used as a secondary signal to compare with the simulation."
        ]
        if supportive:
            chunks.append(
                "Supportive signals include "
                + "; ".join(_signal_brief(request, signal) for signal in supportive[:2])
                + "."
            )
        if contradictory:
            chunks.append(
                "Signals that challenge the current simulation include "
                + "; ".join(_signal_brief(request, signal) for signal in contradictory[:2])
                + "."
            )
        if mixed:
            chunks.append(
                "Some observations remain mixed, including "
                + "; ".join(_signal_brief(request, signal) for signal in mixed[:2])
                + "."
            )
        if trends:
            chunks.append("Trend review suggests " + "; ".join(trends[:2]) + ".")
        if top_confidence:
            chunks.append(
                f"For the highest simulated concern, the {organ_label(request.language, top_organ)}, these observations {top_confidence}."
            )
        chunks.append(
            "Persistent mismatch is a reason to refresh the inputs, review the assumptions, or compare the pattern with a clinician."
        )
        return " ".join(chunks)

    if request.language == "Hindi":
        chunks = [
            "Real-world observations दिए गए हैं और इन्हें simulation के साथ तुलना करने वाले द्वितीयक signal की तरह उपयोग किया गया है।"
        ]
        if supportive:
            chunks.append(
                "Simulation का समर्थन करने वाले signals में "
                + "; ".join(_signal_brief(request, signal) for signal in supportive[:2])
                + " शामिल हैं।"
            )
        if contradictory:
            chunks.append(
                "वर्तमान simulation को चुनौती देने वाले signals में "
                + "; ".join(_signal_brief(request, signal) for signal in contradictory[:2])
                + " शामिल हैं।"
            )
        if mixed:
            chunks.append(
                "कुछ observations अभी भी मिश्रित हैं, जैसे "
                + "; ".join(_signal_brief(request, signal) for signal in mixed[:2])
                + "।"
            )
        if trends:
            chunks.append("Trend review से " + "; ".join(trends[:2]) + " दिखाई देता है।")
        if top_confidence:
            chunks.append(
                f"सबसे अधिक simulated concern वाले {organ_label(request.language, top_organ)} के लिए ये observations {top_confidence}।"
            )
        chunks.append(
            "लगातार mismatch होने पर inputs अपडेट करना, assumptions की समीक्षा करना, या clinician से तुलना करना उचित होगा।"
        )
        return " ".join(chunks)

    chunks = [
        "Real-world observations అందించబడ్డాయి మరియు simulation తో పోల్చుకునే ద్వితీయ signal గా ఉపయోగించబడ్డాయి."
    ]
    if supportive:
        chunks.append(
            "Simulation కు మద్దతు ఇస్తున్న signals లో "
            + "; ".join(_signal_brief(request, signal) for signal in supportive[:2])
            + " ఉన్నాయి."
        )
    if contradictory:
        chunks.append(
            "ప్రస్తుత simulation ను సవాలు చేస్తున్న signals లో "
            + "; ".join(_signal_brief(request, signal) for signal in contradictory[:2])
            + " ఉన్నాయి."
        )
    if mixed:
        chunks.append(
            "కొన్ని observations ఇంకా మిశ్రమంగా ఉన్నాయి, ఉదాహరణకు "
            + "; ".join(_signal_brief(request, signal) for signal in mixed[:2])
            + "."
        )
    if trends:
        chunks.append("Trend review ప్రకారం " + "; ".join(trends[:2]) + " కనిపిస్తోంది.")
    if top_confidence:
        chunks.append(
            f"అత్యధిక simulated concern ఉన్న {organ_label(request.language, top_organ)} కోసం ఈ observations {top_confidence}."
        )
    chunks.append(
        "Mismatch కొనసాగితే inputs ను నవీకరించడం, assumptions ను మళ్లీ చూడడం, లేదా clinician తో పోల్చుకోవడం మంచిది."
    )
    return " ".join(chunks)


def _signal_brief(request: ReportRequest, signal: FeedbackSignal) -> str:
    status_label = {
        "English": {
            "supports": "supports",
            "mixed": "is mixed for",
            "contradicts": "challenges",
        },
        "Hindi": {
            "supports": "समर्थन करता है",
            "mixed": "मिश्रित संकेत देता है",
            "contradicts": "चुनौती देता है",
        },
        "Telugu": {
            "supports": "మద్దతు ఇస్తోంది",
            "mixed": "మిశ్రమ సంకేతం ఇస్తోంది",
            "contradicts": "సవాలు చేస్తోంది",
        },
    }[request.language][signal.status]
    return (
        f"{observation_label(request.language, signal.observation)} "
        f"{status_label} {organ_label(request.language, signal.organ)} "
        f"({signal.detail})"
    )


def _trend_summaries(
    request: ReportRequest, observations: list[FeedbackObservation]
) -> list[str]:
    by_name: dict[str, list[FeedbackObservation]] = {}
    for item in observations:
        by_name.setdefault(item.observation.strip().lower(), []).append(item)

    summaries: list[str] = []
    for name, items in by_name.items():
        if len(items) < 2:
            continue
        ordered = sorted(items, key=lambda item: _parse_date(item.date))
        first = ordered[0].value
        last = ordered[-1].value
        text = _trend_text(request, name, first, last)
        if text:
            summaries.append(text)
    return summaries


def _trend_text(
    request: ReportRequest, name: str, first: Any, last: Any
) -> str | None:
    label = observation_label(request.language, name)
    if name in {"resting_heart_rate", "heart_rate", "fasting_glucose", "hba1c", "creatinine", "alt", "ast"}:
        if not isinstance(first, (int, float)) or not isinstance(last, (int, float)):
            return None
        direction = "down" if last < first else "up" if last > first else "flat"
        if direction == "flat":
            return None
        if request.language == "English":
            return f"{label} moved {direction} from {first} to {last}"
        if request.language == "Hindi":
            return f"{label} {first} से {last} तक {'घटा' if direction == 'down' else 'बढ़ा'}"
        return f"{label} {first} నుండి {last} కు {'తగ్గింది' if direction == 'down' else 'పెరిగింది'}"
    if name in {"steps_per_day", "daily_steps", "sleep_tracker_avg", "sleep_hours"}:
        if not isinstance(first, (int, float)) or not isinstance(last, (int, float)):
            return None
        direction = "up" if last > first else "down" if last < first else "flat"
        if direction == "flat":
            return None
        if request.language == "English":
            return f"{label} moved {direction} from {first} to {last}"
        if request.language == "Hindi":
            return f"{label} {first} से {last} तक {'बढ़ा' if direction == 'up' else 'घटा'}"
        return f"{label} {first} నుండి {last} కు {'పెరిగింది' if direction == 'up' else 'తగ్గింది'}"
    return None


def _contradiction_scores(
    request: ReportRequest, signals: list[FeedbackSignal]
) -> dict[str, int]:
    scores = {organ: 0 for organ in request.organ_scores}
    for signal in signals:
        if signal.status == "supports":
            scores[signal.organ] += signal.score
        elif signal.status == "contradicts":
            scores[signal.organ] -= signal.score
    return scores


def _confidence_adjustments(
    request: ReportRequest, contradiction_scores: dict[str, int]
) -> dict[str, str]:
    adjustments: dict[str, str] = {}
    for organ, score in contradiction_scores.items():
        adjustments[organ] = confidence_adjustments_text(request, contradiction_scores, organ)
    return adjustments


def confidence_adjustments_text(
    request: ReportRequest, contradiction_scores: dict[str, int], organ: str
) -> str:
    score = contradiction_scores.get(organ, 0)
    if request.language == "English":
        if score >= 3:
            return "modestly increase confidence in this estimate"
        if score <= -3:
            return "reduce confidence in this estimate"
        return ""
    if request.language == "Hindi":
        if score >= 3:
            return "इस अनुमान पर विश्वास को कुछ बढ़ाते हैं"
        if score <= -3:
            return "इस अनुमान पर विश्वास को कुछ कम करते हैं"
        return ""
    if score >= 3:
        return "ఈ అంచనాపై నమ్మకాన్ని కొంత పెంచుతున్నాయి"
    if score <= -3:
        return "ఈ అంచనాపై నమ్మకాన్ని కొంత తగ్గిస్తున్నాయి"
    return ""


def _classify_observation(
    request: ReportRequest, observation: FeedbackObservation
) -> FeedbackSignal | None:
    name = observation.observation.strip().lower()
    value = observation.value
    if name in {"resting_heart_rate", "heart_rate"} and isinstance(value, (int, float)):
        return _signal_for_numeric(request, "heart", name, value, 80, 90, "bpm", lower_is_better=True)
    if name == "blood_pressure":
        systolic, diastolic = _parse_blood_pressure(value)
        if systolic is None or diastolic is None:
            return None
        detail = f"{systolic}/{diastolic} mmHg"
        if systolic < 120 and diastolic < 80:
            return _build_signal(request, "heart", name, "better", detail, observation.date, 2)
        if systolic < 140 and diastolic < 90:
            return FeedbackSignal("heart", name, "mixed", detail, 1, observation.date)
        return _build_signal(request, "heart", name, "worse", detail, observation.date, 2)
    if name in {"spo2", "oxygen_saturation"} and isinstance(value, (int, float)):
        return _signal_for_numeric(request, "lungs", name, value, 95, 92, "%", lower_is_better=False)
    if name in {"sleep_tracker_avg", "sleep_hours"} and isinstance(value, (int, float)):
        if 7 <= value <= 9:
            return _build_signal(request, "brain", name, "better", f"{value:.1f} hours", observation.date, 2)
        if 6 <= value < 7:
            return FeedbackSignal("brain", name, "mixed", f"{value:.1f} hours", 1, observation.date)
        return _build_signal(request, "brain", name, "worse", f"{value:.1f} hours", observation.date, 2)
    if name in {"steps_per_day", "daily_steps"} and isinstance(value, (int, float)):
        if value >= 8000:
            return _build_signal(request, "heart", name, "better", f"{value:.0f} steps/day", observation.date, 2)
        if value >= 5000:
            return FeedbackSignal("heart", name, "mixed", f"{value:.0f} steps/day", 1, observation.date)
        return _build_signal(request, "heart", name, "worse", f"{value:.0f} steps/day", observation.date, 2)
    if name in {"alt", "ast"} and isinstance(value, (int, float)):
        return _signal_for_numeric(request, "liver", name, value, 40, 60, "U/L", lower_is_better=True)
    if name == "egfr" and isinstance(value, (int, float)):
        if value >= 90:
            return _build_signal(request, "kidneys", name, "better", f"{value:.0f}", observation.date, 2)
        if value >= 60:
            return FeedbackSignal("kidneys", name, "mixed", f"{value:.0f}", 1, observation.date)
        return _build_signal(request, "kidneys", name, "worse", f"{value:.0f}", observation.date, 2)
    if name == "creatinine" and isinstance(value, (int, float)):
        return _signal_for_numeric(request, "kidneys", name, value, 1.2, 1.5, "mg/dL", lower_is_better=True, decimals=2)
    if name == "fasting_glucose" and isinstance(value, (int, float)):
        return _signal_for_numeric(request, "kidneys", name, value, 99, 125, "mg/dL", lower_is_better=True)
    if name == "hba1c" and isinstance(value, (int, float)):
        return _signal_for_numeric(request, "kidneys", name, value, 5.6, 6.4, "%", lower_is_better=True, decimals=1)
    if name in {"waist_circumference", "triglycerides"} and isinstance(value, (int, float)):
        return _signal_for_numeric(request, "heart", name, value, 100, 150, "", lower_is_better=True)
    if name in {"hdl"} and isinstance(value, (int, float)):
        return _signal_for_numeric(request, "heart", name, value, 60, 40, "mg/dL", lower_is_better=False)
    if name in {"urine_albumin_creatinine_ratio", "uacr"} and isinstance(value, (int, float)):
        return _signal_for_numeric(request, "kidneys", name, value, 30, 300, "mg/g", lower_is_better=True)
    return None


def _signal_for_numeric(
    request: ReportRequest,
    organ: str,
    observation: str,
    value: float,
    good_threshold: float,
    mid_threshold: float,
    unit: str,
    *,
    lower_is_better: bool,
    decimals: int = 0,
) -> FeedbackSignal:
    detail = f"{value:.{decimals}f}{(' ' + unit) if unit else ''}".strip()
    if lower_is_better:
        if value <= good_threshold:
            return _build_signal(request, organ, observation, "better", detail, "", 2)
        if value <= mid_threshold:
            return FeedbackSignal(organ, observation, "mixed", detail, 1, "")
        return _build_signal(request, organ, observation, "worse", detail, "", 2)
    if value >= good_threshold:
        return _build_signal(request, organ, observation, "better", detail, "", 2)
    if value >= mid_threshold:
        return FeedbackSignal(organ, observation, "mixed", detail, 1, "")
    return _build_signal(request, organ, observation, "worse", detail, "", 2)


def _build_signal(
    request: ReportRequest,
    organ: str,
    observation: str,
    direction: str,
    detail: str,
    observed_date: str,
    weight: int,
) -> FeedbackSignal:
    score = request.organ_scores[organ].score
    high_risk = score >= 50
    if direction == "better":
        status = "contradicts" if high_risk else "supports"
    else:
        status = "supports" if high_risk else "contradicts"
    return FeedbackSignal(organ, observation, status, detail, weight, observed_date)


def _parse_blood_pressure(value: Any) -> tuple[int | None, int | None]:
    if isinstance(value, str) and "/" in value:
        try:
            systolic_raw, diastolic_raw = value.split("/", 1)
            return int(systolic_raw.strip()), int(diastolic_raw.strip())
        except ValueError:
            return None, None
    if isinstance(value, dict):
        systolic = value.get("systolic")
        diastolic = value.get("diastolic")
        if isinstance(systolic, (int, float)) and isinstance(diastolic, (int, float)):
            return int(systolic), int(diastolic)
    return None, None


def _parse_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError:
        return date.min

