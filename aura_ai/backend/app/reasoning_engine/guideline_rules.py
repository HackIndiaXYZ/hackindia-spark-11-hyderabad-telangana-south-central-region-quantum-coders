from __future__ import annotations

from dataclasses import dataclass

from .models import ReportRequest


@dataclass(frozen=True)
class GuidelineEvidence:
    organ: str
    message: str
    strength: int


def build_guideline_evidence(
    guideline_id: str,
    request: ReportRequest,
    factor_states: dict[str, object],
) -> list[GuidelineEvidence]:
    handler = HANDLERS.get(guideline_id)
    if handler is None:
        return []
    return handler(request, factor_states)


def _state_severity(factor_states: dict[str, object], factor: str) -> int:
    state = factor_states.get(factor)
    return getattr(state, "severity", 0) if state is not None else 0


def _smoking_harms(request: ReportRequest, factor_states: dict[str, object]) -> list[GuidelineEvidence]:
    if not request.user_profile.smoker:
        return []
    severity = max(1, _state_severity(factor_states, "smoking"))
    return [
        GuidelineEvidence("lungs", "CDC smoking-harms guidance links smoking directly to lung damage risk.", 5 + severity),
        GuidelineEvidence("heart", "CDC smoking-harms guidance also identifies smoking as a major cardiovascular risk amplifier.", 4 + severity),
        GuidelineEvidence("kidneys", "Smoking adds vascular stress that can spill over into kidney risk.", 3 + severity),
        GuidelineEvidence("brain", "Smoking-related vascular strain can also influence brain risk patterns.", 3 + severity),
    ]


def _framingham(request: ReportRequest, factor_states: dict[str, object]) -> list[GuidelineEvidence]:
    evidence: list[GuidelineEvidence] = []
    if request.user_profile.age >= 40:
        evidence.append(GuidelineEvidence("heart", "Framingham-style cardiovascular interpretation gives more weight to age-related risk accumulation.", 4))
    if request.user_profile.smoker:
        evidence.append(GuidelineEvidence("heart", "Smoking is an explicit cardiovascular risk factor in Framingham-style reasoning.", 5))
    if _state_severity(factor_states, "activity") > 0 or _state_severity(factor_states, "bmi") > 0:
        evidence.append(GuidelineEvidence("heart", "Lower activity and higher BMI reinforce the cardiovascular pattern around the heart score.", 4))
    if evidence:
        evidence.append(GuidelineEvidence("brain", "Because vascular risk factors overlap across organs, this cardiovascular pattern also matters for brain risk interpretation.", 2))
        evidence.append(GuidelineEvidence("kidneys", "Cardiometabolic and vascular overlap means heart-related risk factors can also strengthen kidney concern.", 2))
    return evidence


def _audit_c(request: ReportRequest, factor_states: dict[str, object]) -> list[GuidelineEvidence]:
    severity = _state_severity(factor_states, "alcohol")
    if severity <= 0:
        return [
            GuidelineEvidence("liver", "AUDIT-C-style alcohol screening is still relevant here, but the reported weekly intake does not look elevated.", 1),
            GuidelineEvidence("brain", "Alcohol remains part of the framework, though the current weekly intake does not appear to be the dominant driver.", 1),
        ]
    return [
        GuidelineEvidence("liver", "AUDIT-C-style alcohol screening makes drinking pattern one of the clearest modifiable drivers for liver risk.", 5 + severity),
        GuidelineEvidence("brain", "Alcohol can also interact with sleep and cognition-related risk pathways in the brain.", 4 + severity),
        GuidelineEvidence("heart", "Alcohol may add broader metabolic and cardiovascular strain when it coexists with other lifestyle risks.", 2 + severity),
    ]


def _who_bmi_activity(request: ReportRequest, factor_states: dict[str, object]) -> list[GuidelineEvidence]:
    evidence: list[GuidelineEvidence] = []
    bmi_severity = _state_severity(factor_states, "bmi")
    activity_severity = _state_severity(factor_states, "activity")
    if bmi_severity > 0 or activity_severity > 0:
        evidence.extend(
            [
                GuidelineEvidence("heart", "WHO BMI-activity framing supports the link between higher BMI or lower activity and rising cardiovascular strain.", 4 + bmi_severity + activity_severity),
                GuidelineEvidence("liver", "Higher BMI and lower activity increase longer-term metabolic load that can affect liver risk.", 3 + bmi_severity),
                GuidelineEvidence("kidneys", "Metabolic load from BMI and inactivity can spill over into kidney risk over time.", 3 + bmi_severity),
                GuidelineEvidence("brain", "Lower activity can also reduce protective benefit for long-term brain health.", 2 + activity_severity),
            ]
        )
    return evidence


def _diabetes_metabolic(request: ReportRequest, factor_states: dict[str, object]) -> list[GuidelineEvidence]:
    bmi_severity = _state_severity(factor_states, "bmi")
    diet_severity = _state_severity(factor_states, "diet")
    activity_severity = _state_severity(factor_states, "activity")
    if max(bmi_severity, diet_severity, activity_severity) <= 0:
        return []
    strength = 2 + bmi_severity + diet_severity + activity_severity
    return [
        GuidelineEvidence("heart", "CDC diabetes-prevention guidance highlights the combined effect of weight, activity, and diet on broader metabolic risk.", strength),
        GuidelineEvidence("kidneys", "Metabolic-risk prevention is also relevant to kidney protection because diabetes is a major kidney risk driver.", strength),
        GuidelineEvidence("liver", "Weight and diet quality reinforce metabolic pressure that can raise liver concern.", strength - 1),
        GuidelineEvidence("brain", "Metabolic health can also influence longer-term vascular and brain-risk patterns.", max(1, strength - 2)),
    ]


def _kidney_risk(request: ReportRequest, factor_states: dict[str, object]) -> list[GuidelineEvidence]:
    evidence: list[GuidelineEvidence] = []
    if _state_severity(factor_states, "smoking") > 0:
        evidence.append(GuidelineEvidence("kidneys", "NIDDK kidney-risk guidance is consistent with smoking as a meaningful kidney risk contributor.", 4))
    if _state_severity(factor_states, "bmi") > 0 or _state_severity(factor_states, "activity") > 0:
        evidence.append(GuidelineEvidence("kidneys", "Kidney risk rises alongside cardiometabolic burden, especially when weight and activity patterns are unfavorable.", 4))
    return evidence


def _sleep_health(request: ReportRequest, factor_states: dict[str, object]) -> list[GuidelineEvidence]:
    severity = _state_severity(factor_states, "sleep")
    if severity <= 0:
        return []
    return [
        GuidelineEvidence("brain", "CDC sleep-health guidance indicates that adults usually need seven or more hours of sleep, so short sleep meaningfully affects brain recovery.", 5 + severity),
        GuidelineEvidence("heart", "Short sleep can also add stress load that influences cardiovascular risk patterns.", 3 + severity),
        GuidelineEvidence("liver", "Sleep and metabolic regulation overlap, so persistent short sleep can contribute to liver-risk context too.", 2 + severity),
    ]


HANDLERS = {
    "cdc_smoking_harms": _smoking_harms,
    "framingham_risk_score": _framingham,
    "audit_c": _audit_c,
    "who_bmi_activity": _who_bmi_activity,
    "cdc_diabetes_metabolic": _diabetes_metabolic,
    "niddk_kidney_risk": _kidney_risk,
    "cdc_sleep_health": _sleep_health,
}

