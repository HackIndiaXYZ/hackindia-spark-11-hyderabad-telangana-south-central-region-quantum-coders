from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class GuidelineCitation:
    title: str
    organization: str
    url: str


@dataclass(frozen=True)
class GuidelineDefinition:
    id: str
    name: str
    version: str
    aliases: tuple[str, ...]
    summary: str
    organ_targets: tuple[str, ...]
    citations: tuple[GuidelineCitation, ...]
    evidence_map: dict[str, list[str]]


class GuidelineRegistry:
    def __init__(self, base_path: Path | None = None) -> None:
        self.base_path = base_path or Path(__file__).resolve().parents[2] / "data" / "guidelines"
        self._definitions = self._load_definitions()
        self._alias_lookup = self._build_alias_lookup(self._definitions)

    def all(self) -> list[GuidelineDefinition]:
        return list(self._definitions.values())

    def resolve_many(self, names: list[str]) -> list[GuidelineDefinition]:
        resolved: list[GuidelineDefinition] = []
        seen: set[str] = set()
        for name in names:
            key = name.strip().lower()
            definition = self._alias_lookup.get(key)
            if definition and definition.id not in seen:
                resolved.append(definition)
                seen.add(definition.id)
        return resolved

    def by_id(self, guideline_id: str) -> GuidelineDefinition | None:
        return self._definitions.get(guideline_id)

    def _load_definitions(self) -> dict[str, GuidelineDefinition]:
        definitions: dict[str, GuidelineDefinition] = {}
        for path in sorted(self.base_path.glob("*.json")):
            raw = json.loads(path.read_text(encoding="utf-8"))
            definition = GuidelineDefinition(
                id=raw["id"],
                name=raw["name"],
                version=raw["version"],
                aliases=tuple(raw.get("aliases", [])),
                summary=raw["summary"],
                organ_targets=tuple(raw.get("organ_targets", [])),
                citations=tuple(
                    GuidelineCitation(
                        title=item["title"],
                        organization=item["organization"],
                        url=item["url"],
                    )
                    for item in raw.get("citations", [])
                ),
                evidence_map={key: list(value) for key, value in raw.get("evidence_map", {}).items()},
            )
            definitions[definition.id] = definition
        return definitions

    @staticmethod
    def _build_alias_lookup(
        definitions: dict[str, GuidelineDefinition]
    ) -> dict[str, GuidelineDefinition]:
        lookup: dict[str, GuidelineDefinition] = {}
        for definition in definitions.values():
            lookup[definition.id.lower()] = definition
            lookup[definition.name.lower()] = definition
            for alias in definition.aliases:
                lookup[alias.lower()] = definition
        return lookup


@lru_cache(maxsize=1)
def get_guideline_registry() -> GuidelineRegistry:
    return GuidelineRegistry()


def export_guideline_metadata() -> list[dict[str, Any]]:
    registry = get_guideline_registry()
    items: list[dict[str, Any]] = []
    for definition in registry.all():
        items.append(
            {
                "id": definition.id,
                "name": definition.name,
                "version": definition.version,
                "organ_targets": list(definition.organ_targets),
                "citations": [
                    {
                        "title": citation.title,
                        "organization": citation.organization,
                        "url": citation.url,
                    }
                    for citation in definition.citations
                ],
            }
        )
    return items

