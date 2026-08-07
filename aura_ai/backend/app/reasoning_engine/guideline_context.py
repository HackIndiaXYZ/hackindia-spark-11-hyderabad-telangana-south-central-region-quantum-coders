from __future__ import annotations

from dataclasses import dataclass

from .guideline_registry import GuidelineDefinition, get_guideline_registry
from .guideline_rules import GuidelineEvidence, build_guideline_evidence
from .models import ReportRequest


@dataclass(frozen=True)
class GuidelineContext:
    definitions: tuple[GuidelineDefinition, ...]
    organ_evidence: dict[str, list[GuidelineEvidence]]
    citations_by_organ: dict[str, list[str]]


def build_guideline_context(
    request: ReportRequest, factor_states: dict[str, object]
) -> GuidelineContext:
    registry = get_guideline_registry()
    definitions = tuple(registry.resolve_many(request.guidelines_applied))
    organ_evidence: dict[str, list[GuidelineEvidence]] = {
        "heart": [],
        "lungs": [],
        "liver": [],
        "kidneys": [],
        "brain": [],
    }
    citations_by_organ: dict[str, list[str]] = {organ: [] for organ in organ_evidence}

    for definition in definitions:
        for evidence in build_guideline_evidence(definition.id, request, factor_states):
            organ_evidence[evidence.organ].append(evidence)
            for citation in definition.citations:
                citation_text = f"{definition.name} ({citation.organization})"
                if citation_text not in citations_by_organ[evidence.organ]:
                    citations_by_organ[evidence.organ].append(citation_text)

    for organ in organ_evidence:
        organ_evidence[organ].sort(key=lambda item: item.strength, reverse=True)

    return GuidelineContext(
        definitions=definitions,
        organ_evidence=organ_evidence,
        citations_by_organ=citations_by_organ,
    )


def top_guideline_message(context: GuidelineContext, organ: str) -> str | None:
    items = context.organ_evidence.get(organ, [])
    if not items:
        return None
    return items[0].message

