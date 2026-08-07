from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from .clinical_scoring import evaluate_clinical_organ_scores
from .feedback_analysis import analyze_feedback
from .guideline_context import build_guideline_context, top_guideline_message
from .i18n import tr
from .models import ORGANS, OrganScore, ReportRequest
from .report_schema import validate_report_output
from .lifestyle_assessment import evaluate_lifestyle_assessment
from .clinical_readiness import evaluate_clinical_readiness

RISK_BANDS = (
    (25.0, "low"),
    (50.0, "moderate"),
    (85.0, "high"),
    (101.0, "critical"),
)

ACTIVITY_BUCKETS = {
    "sedentary": "low",
    "low": "low",
    "light": "low",
    "moderate": "moderate",
    "active": "high",
    "high": "high",
    "very active": "high",
}

UNHEALTHY_DIETS = {
    "processed",
    "junk",
    "junk_food",
    "fast food",
    "western",
    "high sugar",
    "high-fat",
}

BALANCED_DIETS = {
    "balanced",
    "mediterranean",
    "whole-food",
    "whole food",
    "vegetarian",
    "plant-forward",
}

ORGAN_FACTOR_WEIGHTS = {
    "heart": {"smoking": 6, "activity": 5, "bmi": 5, "diet": 4, "alcohol": 3, "sleep": 2},
    "lungs": {"smoking": 8, "activity": 2, "bmi": 2, "sleep": 2, "diet": 1, "alcohol": 1},
    "liver": {"alcohol": 8, "bmi": 5, "diet": 4, "activity": 2, "sleep": 1, "smoking": 1},
    "kidneys": {"bmi": 5, "smoking": 4, "activity": 3, "diet": 3, "sleep": 2, "alcohol": 2},
    "brain": {"sleep": 6, "alcohol": 5, "smoking": 4, "activity": 3, "diet": 2, "bmi": 2},
}


@dataclass(frozen=True)
class FactorState:
    name: str
    active: bool
    severity: int


def generate_health_report(payload: dict[str, Any]) -> dict[str, Any]:
    request = ReportRequest.from_dict(payload)
    factor_states = _factor_states(request)
    
    # 1. WELLNESS LAYER ASSESSMENT (No organ scores computed here)
    user_profile_dict = {
        "age": request.user_profile.age,
        "sex": request.user_profile.sex,
        "bmi": request.user_profile.bmi,
        "sleep_hours": request.user_profile.sleep_hours,
        "activity_level": request.user_profile.activity_level,
        "diet_type": request.user_profile.diet_type,
        "smoker": request.user_profile.smoker,
        "alcohol_units_per_week": request.user_profile.alcohol_units_per_week,
    }
    wellness_assessment = evaluate_lifestyle_assessment(user_profile_dict)

    # 2. CLINICAL READINESS & BIOMARKER EVALUATION
    lab_data_dict = payload.get("lab_biomarkers") or payload.get("lab_data") or {}
    vitals_dict = payload.get("vitals") or {}
    combined_biomarkers = {**lab_data_dict, **vitals_dict}

    readiness_data = evaluate_clinical_readiness(combined_biomarkers)
    clinical_eval = evaluate_clinical_organ_scores(user_profile_dict, lab_data_dict, vitals_dict)
    
    dynamic_scores: dict[str, OrganScore] = {}
    organ_insights: dict[str, Any] = {}
    guideline_context = build_guideline_context(request, factor_states)
    feedback_result = analyze_feedback(request)

    for organ in ORGANS:
        eval_key = "kidneys" if organ == "kidneys" else organ
        clin_meta = clinical_eval.get(eval_key)
        organ_readiness = readiness_data["organ_readiness"].get(eval_key, {})

        if clin_meta is not None:
            # CLINICAL LAYER ACTIVATED FOR THIS ORGAN
            calculated_score = float(clin_meta["score"])
            organ_score = OrganScore(score=calculated_score, uncertainty=5.0)
            dynamic_scores[organ] = organ_score
            organ_label = _risk_label(organ_score.score)
            top_factor = _top_factor_for_organ(organ, factor_states)

            base_explanation = _organ_explanation(
                request=request,
                organ=organ,
                organ_score=organ_score,
                risk_label=organ_label,
                top_factor=top_factor,
                guideline_context=guideline_context,
                confidence_note=feedback_result.confidence_adjustments.get(organ, ""),
            )

            formula_name = clin_meta.get("formula_name", "Clinical Model")
            citation = clin_meta.get("source_citation", "Standard Clinical Guidelines")
            enriched_explanation = f"[{formula_name}] {base_explanation} (Ref: {citation})"

            organ_insights[organ] = {
                "status": "Ready",
                "is_active": True,
                "numerical_score": organ_score.score,
                "aura_visualization_index": round(organ_score.score, 1),
                "risk_label": _localized_risk(request.language, organ_label),
                "top_factor": _localized_factor(request.language, top_factor),
                "explanation": enriched_explanation,
                "recommendation": _recommendation(request, top_factor),
                "formula_name": clin_meta.get("formula_name"),
                "formula_version": clin_meta.get("formula_version"),
                "source_citation": clin_meta.get("source_citation"),
                "input_snapshot": clin_meta.get("input_snapshot"),
                "confidence_level": "Biomarker Verified",
            }
        else:
            # WAITING FOR CLINICAL REPORTS
            organ_insights[organ] = {
                "status": organ_readiness.get("status", "Waiting for Reports"),
                "is_active": False,
                "numerical_score": None,
                "aura_visualization_index": None,
                "risk_label": "Waiting for Reports",
                "top_factor": "Clinical Biomarkers Required",
                "explanation": organ_readiness.get("why_waiting", "Clinical report required to activate assessment."),
                "recommendation": f"Upload {', '.join(organ_readiness.get('required_reports', ['Clinical Report']))} to activate digital twin evaluation.",
                "formula_name": organ_readiness.get("clinical_formula"),
                "source_citation": organ_readiness.get("clinical_standard"),
                "missing_biomarkers": organ_readiness.get("missing_biomarkers", []),
                "why_waiting": organ_readiness.get("why_waiting"),
                "confidence_level": "Awaiting Laboratory Reports",
            }

    overall_label = _overall_risk_label(dynamic_scores) if dynamic_scores else "healthy"

    report = {
        "digital_twin_status": readiness_data["digital_twin_status"],
        "active_modules_count": readiness_data["active_modules_count"],
        "total_modules_count": readiness_data["total_modules_count"],
        "wellness_assessment": wellness_assessment,
        "summary": _summary(request, dynamic_scores, overall_label) if dynamic_scores else "Health profile established. Upload clinical reports to activate organ digital twin assessments.",
        "risk_level": _localized_risk(request.language, overall_label) if dynamic_scores else "Baseline Profile",
        "organ_insights": organ_insights,
        "causal_narrative": _causal_narrative(request, factor_states),
        "priority_actions": wellness_assessment["wellness_recommendations"][:3],
        "what_if_insight": _what_if_insight(request, dynamic_scores) if dynamic_scores else "Upload lab reports to enable dynamic simulation scenario analysis.",
        "feedback_integration": feedback_result.narrative,
        "disclaimer": tr(request.language, "disclaimer"),
        "language_note": tr(request.language, "language_note"),
    }
    return report



def generate_health_report_json(payload: str | dict[str, Any]) -> str:
    data = json.loads(payload) if isinstance(payload, str) else payload
    return json.dumps(generate_health_report(data), ensure_ascii=False)


def _summary(request: ReportRequest, organ_scores: dict[str, OrganScore], overall_label: str) -> str:
    organ_name, organ_score = max(organ_scores.items(), key=lambda item: item[1].score)
    consult = _needs_consult(organ_scores)
    localized_label = tr(request.language, f"risk.{overall_label}")
    if request.language == "English":
        tail = (
            tr(request.language, "consult")
            if consult
            else "This is a good moment to focus on the strongest modifiable drivers before they build further momentum."
        )
        return (
            f"Based on your simulation, you have a {localized_label} health pattern. The most important area to watch is your {organ_name}. "
            f"{tail}"
        )
    if request.language == "Hindi":
        tail = (
            tr(request.language, "consult")
            if consult
            else "यह आपकी आदतों में छोटे सुधार करने का सही समय है।"
        )
        return (
            f"आपके सिमुलेशन के आधार पर, आपका स्वास्थ्य {localized_label} स्तर पर है। सबसे अधिक ध्यान देने वाला क्षेत्र {tr(request.language, 'organ.' + organ_name) if organ_name in ['heart', 'lungs', 'liver', 'kidneys', 'brain'] else organ_name} है। "
            f"{tail}"
        )
    tail = (
        tr(request.language, "consult")
        if consult
        else "మీ అలవాట్లలో చిన్న మార్పులు చేయడానికి ఇది సరైన సమయం."
    )
    return (
        f"మీ సిమ్యులేషన్ ప్రకారం, మీ ఆరోగ్యం {localized_label} స్థాయిలో ఉంది. మీరు ఎక్కువగా దృష్టి పెట్టాల్సిన భాగం {tr(request.language, 'organ.' + organ_name) if organ_name in ['heart', 'lungs', 'liver', 'kidneys', 'brain'] else organ_name}. "
        f"{tail}"
    )


def _organ_explanation(
    request: ReportRequest,
    organ: str,
    organ_score: OrganScore,
    risk_label: str,
    top_factor: str,
    guideline_context: object,
    confidence_note: str,
) -> str:
    range_low = _risk_label(max(0.0, organ_score.score - organ_score.uncertainty))
    range_high = _risk_label(min(100.0, organ_score.score + organ_score.uncertainty))
    guideline_text = _guideline_reason(request, organ, top_factor, guideline_context)
    confidence_text = _confidence_tail(request.language, confidence_note)
    consult_text = _organ_consult_tail(request.language, risk_label)
    if request.language == "English":
        return (
            f"Your {organ} risk is currently {tr(request.language, 'risk.' + risk_label)}. "
            f"This score is based on your current habits and lifestyle. {guideline_text}{confidence_text}{consult_text}"
        )
    if request.language == "Hindi":
        return (
            f"आपके {tr(request.language, 'organ.' + organ)} का जोखिम अभी {tr(request.language, 'risk.' + risk_label)} है। "
            f"यह स्कोर आपकी वर्तमान आदतों और जीवनशैली पर आधारित है। {guideline_text}{confidence_text}{consult_text}"
        )
    return (
        f"మీ {tr(request.language, 'organ.' + organ)} ప్రమాదం ప్రస్తుతం {tr(request.language, 'risk.' + risk_label)} స్థాయిలో ఉంది. "
        f"ఈ స్కోర్ మీ ప్రస్తుత అలవాట్లు మరియు జీవనశైలిపై ఆధారపడి ఉంటుంది. {guideline_text}{confidence_text}{consult_text}"
    )


def _guideline_reason(
    request: ReportRequest,
    organ: str,
    top_factor: str,
    guideline_context: object,
) -> str:
    top_message = top_guideline_message(guideline_context, organ)
    if top_message:
        return top_message + " "
    if request.language == "English":
        return f"Looking at your overall health, {top_factor.replace('_', ' ')} seems to be the biggest factor affecting this area. "
    if request.language == "Hindi":
        return f"आपके समग्र स्वास्थ्य को देखते हुए, {tr(request.language, 'factor.' + top_factor)} इस अंग को प्रभावित करने वाला सबसे बड़ा कारण लगता है। "
    return f"మీ మొత్తం ఆరోగ్యాన్ని బట్టి చూస్తే, {tr(request.language, 'factor.' + top_factor)} ఈ అవయవాన్ని ప్రభావితం చేసే అతి పెద్ద అంశంగా కనిపిస్తోంది. "


def _causal_narrative(request: ReportRequest, factor_states: dict[str, FactorState]) -> str:
    active = [name for name, state in factor_states.items() if state.active]
    if request.language == "English":
        sentences = []
        if "smoking" in active:
            sentences.append("Smoking raises overlapping strain on the heart, lungs, kidneys, and brain, so one habit can push several organ scores upward at the same time.")
        if "alcohol" in active:
            sentences.append("Alcohol intake can compound risk most directly in the liver and brain, and it may also worsen broader metabolic stress when other lifestyle factors are present.")
        if "bmi" in active or "activity" in active:
            sentences.append("Higher BMI and lower activity tend to work together by increasing long-term cardiovascular and metabolic load, which can spill over into kidney and liver risk.")
        if "sleep" in active:
            sentences.append("Short sleep reduces recovery time and can make the overall risk pattern less stable, especially when combined with inactivity or alcohol use.")
        if "diet" in active:
            sentences.append("Diet quality shapes how strongly these other factors play out over time, especially for weight-linked and metabolic pathways.")
        if not sentences:
            sentences.append("The current simulation does not show a single dominant lifestyle driver, which suggests the preventive focus can stay on maintaining healthy routines and tracking change over time.")
        return " ".join(sentences[:5])
    if request.language == "Hindi":
        sentences = []
        if "smoking" in active:
            sentences.append("धूम्रपान एक साथ हृदय, फेफड़ों, किडनी और मस्तिष्क पर असर डाल सकता है, इसलिए एक आदत कई अंग स्कोर को ऊपर ले जा सकती है।")
        if "alcohol" in active:
            sentences.append("अल्कोहल सेवन सीधे तौर पर लिवर और मस्तिष्क जोखिम को बढ़ा सकता है और अन्य lifestyle factors होने पर metabolic stress भी बढ़ा सकता है।")
        if "bmi" in active or "activity" in active:
            sentences.append("उच्च BMI और कम activity अक्सर साथ मिलकर cardiovascular और metabolic load बढ़ाते हैं, जिसका असर किडनी और लिवर जोखिम पर भी पड़ सकता है।")
        if "sleep" in active:
            sentences.append("कम नींद रिकवरी समय घटाती है और inactivity या alcohol use के साथ मिलकर जोखिम पैटर्न को और अस्थिर बना सकती है।")
        if "diet" in active:
            sentences.append("आहार की गुणवत्ता तय करती है कि बाकी lifestyle factors समय के साथ कितने मजबूत असर डालेंगे, खासकर weight और metabolism से जुड़े रास्तों में।")
        if not sentences:
            sentences.append("मौजूदा simulation में कोई एक बहुत प्रमुख lifestyle driver नहीं दिख रहा, इसलिए ध्यान स्वस्थ आदतों को बनाए रखने और समय के साथ बदलाव ट्रैक करने पर रखा जा सकता है।")
        return " ".join(sentences[:5])
    sentences = []
    if "smoking" in active:
        sentences.append("ధూమపానం ఒకేసారి గుండె, ఊపిరితిత్తులు, మూత్రపిండాలు మరియు మెదడు పై ఒత్తిడిని పెంచుతుంది, కాబట్టి ఒకే అలవాటు అనేక అవయవ స్కోర్లను పైకి నెట్టవచ్చు.")
    if "alcohol" in active:
        sentences.append("మద్యం సేవనం ముఖ్యంగా కాలేయం మరియు మెదడుపై ప్రమాదాన్ని పెంచుతుంది, అలాగే ఇతర జీవనశైలి అంశాలు ఉన్నప్పుడు విస్తృతమైన metabolic stress ను కూడా పెంచవచ్చు.")
    if "bmi" in active or "activity" in active:
        sentences.append("ఎక్కువ BMI మరియు తక్కువ activity కలిసివచ్చినప్పుడు దీర్ఘకాలిక cardiovascular మరియు metabolic load పెరిగి, అది మూత్రపిండాలు మరియు కాలేయ ప్రమాదాలకూ ప్రభావం చూపవచ్చు.")
    if "sleep" in active:
        sentences.append("తక్కువ నిద్ర రికవరీ సమయాన్ని తగ్గిస్తుంది మరియు inactivity లేదా alcohol use తో కలిసినప్పుడు మొత్తం ప్రమాద నమూనాను మరింత అస్థిరం చేయవచ్చు.")
    if "diet" in active:
        sentences.append("ఆహార నాణ్యత మిగతా జీవనశైలి అంశాలు కాలక్రమేణా ఎంత బలంగా ప్రభావం చూపుతాయో నిర్ణయిస్తుంది, ముఖ్యంగా బరువు మరియు metabolism కు సంబంధించిన మార్గాల్లో.")
    if not sentences:
        sentences.append("ప్రస్తుతం simulation లో ఒక్కటి మాత్రమే ప్రధాన lifestyle driver గా కనిపించడం లేదు, కాబట్టి ఆరోగ్యకరమైన అలవాట్లు కొనసాగించడం మరియు కాలంతో మార్పును ట్రాక్ చేయడం సరైన దారి అవుతుంది.")
    return " ".join(sentences[:5])


def _priority_actions(
    request: ReportRequest, factor_states: dict[str, FactorState], overall_label: str
) -> list[str]:
    ranked = []
    for factor, state in factor_states.items():
        if not state.active or factor == "general":
            continue
        weight = sum(ORGAN_FACTOR_WEIGHTS[organ].get(factor, 0) * state.severity for organ in ORGANS)
        ranked.append((factor, weight))
    ranked.sort(key=lambda item: item[1], reverse=True)

    actions: list[str] = []
    if overall_label in {"high", "critical"}:
        actions.append(tr(request.language, "priority.consult"))
    for factor, _ in ranked:
        action = _priority_message(request, factor)
        if action not in actions:
            actions.append(action)
        if len(actions) == 3:
            break
    while len(actions) < 3:
        for fallback_key in ["priority.general", "priority.routine", "priority.tracking"]:
            msg = tr(request.language, fallback_key)
            if msg not in actions:
                actions.append(msg)
            if len(actions) == 3:
                break
        # Safeguard to prevent infinite loop if translations are missing
        if len(actions) < 3:
            actions.append("Continue monitoring health trends.")
            if len(actions) == 3: break
    return actions[:3]


def _what_if_insight(request: ReportRequest, organ_scores: dict[str, OrganScore]) -> str:
    if request.what_if_delta is None:
        return ""
    delta = request.what_if_delta
    improvements = []
    worsenings = []
    for organ in ORGANS:
        old = organ_scores[organ].score
        new = delta.new_organ_scores[organ].score
        if old > new:
            improvements.append(f"{organ} ({old - new:.0f} points lower)")
        elif new > old:
            worsenings.append(f"{organ} ({new - old:.0f} points higher)")
    if request.language == "English":
        parts = [f"The simulated change in {delta.changed_variable} from {delta.old_value} to {delta.new_value} shows a before-and-after scenario rather than replacing your current results."]
        if improvements:
            parts.append("Estimated improvements appear in " + ", ".join(improvements) + ".")
        if worsenings:
            parts.append("At the same time, " + ", ".join(worsenings) + " would move in the wrong direction.")
        parts.append("This remains a simulation, so real-world results may differ if unmeasured factors change.")
        return " ".join(parts)
    if request.language == "Hindi":
        parts = [f"{delta.changed_variable} को {delta.old_value} से {delta.new_value} में बदलने का simulated effect आपके वर्तमान परिणामों को नहीं बदलता, बल्कि before-and-after तुलना दिखाता है।"]
        if improvements:
            parts.append("अनुमानित सुधार " + ", ".join(improvements) + " में दिखता है।")
        if worsenings:
            parts.append("साथ ही " + ", ".join(worsenings) + " गलत दिशा में जा सकता है।")
        parts.append("यह अभी भी एक simulation है, इसलिए वास्तविक परिणाम अलग हो सकते हैं।")
        return " ".join(parts)
    parts = [f"{delta.changed_variable} ను {delta.old_value} నుండి {delta.new_value} కి మార్చిన simulated effect మీ ప్రస్తుత ఫలితాలను మార్చదు, కానీ before-and-after తేడాను చూపిస్తుంది."]
    if improvements:
        parts.append("అంచనా మెరుగుదలలు " + ", ".join(improvements) + " లో కనిపిస్తున్నాయి.")
    if worsenings:
        parts.append("అదే సమయంలో " + ", ".join(worsenings) + " చెడు దిశలో కదలవచ్చు.")
    parts.append("ఇది ఇంకా simulation మాత్రమే, కాబట్టి నిజజీవిత ఫలితాలు భిన్నంగా ఉండవచ్చు.")
    return " ".join(parts)


def _factor_states(request: ReportRequest) -> dict[str, FactorState]:
    profile = request.user_profile
    activity_bucket = ACTIVITY_BUCKETS.get(profile.activity_level.strip().lower(), "moderate")
    diet_key = profile.diet_type.strip().lower()
    alcohol_status = _alcohol_status(profile.sex, profile.alcohol_units_per_week)
    return {
        "smoking": FactorState("smoking", profile.smoker, 3 if profile.smoker else 0),
        "alcohol": FactorState("alcohol", alcohol_status != "low", 3 if alcohol_status == "high" else (1 if alcohol_status == "moderate" else 0)),
        "bmi": FactorState("bmi", profile.bmi >= 25, 3 if profile.bmi >= 30 else (2 if profile.bmi >= 25 else 0)),
        "sleep": FactorState("sleep", profile.sleep_hours < 7, 3 if profile.sleep_hours < 6 else (1 if profile.sleep_hours < 7 else 0)),
        "activity": FactorState("activity", activity_bucket == "low", 3 if activity_bucket == "low" else 0),
        "diet": FactorState("diet", diet_key not in BALANCED_DIETS, 2 if diet_key in UNHEALTHY_DIETS else (1 if diet_key not in BALANCED_DIETS else 0)),
        "general": FactorState("general", True, 1),
    }


def _top_factor_for_organ(organ: str, factor_states: dict[str, FactorState]) -> str:
    scored = []
    for factor, weight in ORGAN_FACTOR_WEIGHTS[organ].items():
        state = factor_states[factor]
        if state.active:
            scored.append((factor, weight * state.severity))
    if not scored:
        return "general"
    scored.sort(key=lambda item: item[1], reverse=True)
    return scored[0][0]


def _recommendation(request: ReportRequest, top_factor: str) -> str:
    if top_factor == "alcohol":
        key = "recommend.alcohol_female" if _is_female(request.user_profile.sex) else "recommend.alcohol_male"
        return tr(request.language, key)
    return tr(request.language, f"recommend.{top_factor}")


def _priority_message(request: ReportRequest, factor: str) -> str:
    if factor == "alcohol":
        key = "priority.alcohol_female" if _is_female(request.user_profile.sex) else "priority.alcohol_male"
        return tr(request.language, key)
    return tr(request.language, f"priority.{factor}")


def _risk_label(score: float) -> str:
    if score >= 80.0:
        return "low"
    elif score >= 60.0:
        return "moderate"
    elif score >= 40.0:
        return "high"
    else:
        return "critical"


def _overall_risk_label(organ_scores: dict[str, OrganScore]) -> str:
    min_integrity = min(item.score for item in organ_scores.values())
    return _risk_label(min_integrity)


def _localized_risk(language: str, label: str) -> str:
    return tr(language, f"risk.{label}")


def _localized_factor(language: str, factor: str) -> str:
    return tr(language, f"factor.{factor}")


def _is_female(sex: str) -> bool:
    return sex.strip().lower() in {"female", "f", "woman"}


def _alcohol_status(sex: str, units_per_week: float) -> str:
    weekly_limit = 7.0 if _is_female(sex) else 14.0
    if units_per_week > weekly_limit:
        return "high"
    if units_per_week > 0:
        return "moderate"
    return "low"


def _needs_consult(organ_scores: dict[str, OrganScore]) -> bool:
    return any(_risk_label(item.score) in {"high", "critical"} for item in organ_scores.values())


def _organ_consult_tail(language: str, risk_label: str) -> str:
    if risk_label not in {"high", "critical"}:
        return ""
    if language == "English":
        return " Please discuss this organ risk with a healthcare professional."
    if language == "Hindi":
        return " कृपया इस अंग के जोखिम पर किसी स्वास्थ्य विशेषज्ञ से चर्चा करें।"
    return " ఈ అవయవ ప్రమాదం గురించి ఆరోగ్య నిపుణుడితో మాట్లాడండి."


def _confidence_tail(language: str, confidence_note: str) -> str:
    if not confidence_note:
        return ""
    if language == "English":
        return f" Real-world observations {confidence_note}."
    return f" Real-world observations {confidence_note}."


def _calculate_dynamic_score(organ: str, factor_states: dict[str, FactorState], profile: UserProfile) -> float:
    """
    Calculates a predictive health risk score based on lifestyle factors.
    Uses specialized formulas for each organ system.
    """
    # 1. HEART: Specific user-provided formula
    if organ == "heart":
        score = (
            profile.age * 0.3 +
            profile.bmi * 1.5 +
            (20 if profile.smoker else 0) +
            (profile.alcohol_units_per_week * 0.5) -
            (profile.sleep_hours * 2.0)
        )
        # Shift baseline to ensure healthy individuals start low
        score = max(5.0, score - 15) 

    # 2. LUNGS: Smoking dominated
    elif organ == "lungs":
        score = 20.0
        if profile.smoker:
            score += 45.0
        score += (profile.bmi * 0.5) + (profile.age * 0.1)
        if profile.activity_level.lower() == "low":
            score += 10.0

    # 3. LIVER: Alcohol & BMI dominated
    elif organ == "liver":
        score = 15.0
        score += (profile.alcohol_units_per_week * 2.5)
        score += (profile.bmi * 1.0)
        if profile.smoker:
            score += 5.0

    # 4. KIDNEYS: BMI & Diet dominated
    elif organ == "kidneys":
        score = 15.0
        score += (profile.bmi * 1.5)
        if profile.smoker:
            score += 10.0
        diet_key = profile.diet_type.strip().lower()
        if diet_key in UNHEALTHY_DIETS:
            score += 15.0

    # 5. BRAIN: Sleep & Activity dominated
    elif organ == "brain":
        score = 25.0
        score -= (profile.sleep_hours * 2.5)  # More sleep reduces risk
        score += (profile.age * 0.4)
        if profile.activity_level.lower() == "low":
            score += 15.0
        if profile.alcohol_units_per_week > 14:
            score += 15.0
        score = score + 15 # baseline adjust

    # Final score clamp
    final_score = float(min(100.0, max(0.0, score)))
    print(f"DEBUG: engine.py - calculated {organ} as {final_score:.1f}")
    return final_score

