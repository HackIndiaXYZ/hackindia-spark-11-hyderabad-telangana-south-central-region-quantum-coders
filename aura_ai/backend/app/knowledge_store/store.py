from __future__ import annotations

import json
from pathlib import Path

from ..reasoning_engine.guideline_registry import get_guideline_registry
from ..storage.repositories import DocumentRepository


class KnowledgeStore:
    def __init__(self, repository: DocumentRepository) -> None:
        self.repository = repository

    def ingest_guidelines(self) -> int:
        registry = get_guideline_registry()
        count = 0
        for definition in registry.all():
            content = json.dumps(
                {
                    "summary": definition.summary,
                    "evidence_map": definition.evidence_map,
                    "citations": [
                        {
                            "title": citation.title,
                            "organization": citation.organization,
                            "url": citation.url,
                        }
                        for citation in definition.citations
                    ],
                },
                ensure_ascii=False,
                indent=2,
            )
            document_id = self.repository.upsert_document(
                source_type="guideline",
                title=definition.name,
                source_ref=definition.id,
                content=content,
                metadata={"version": definition.version, "organ_targets": list(definition.organ_targets)},
            )
            chunks = _chunk_text(content, citation_url=definition.citations[0].url if definition.citations else None)
            self.repository.add_chunks(document_id, chunks)
            count += 1
        return count

    def ingest_text_document(
        self,
        *,
        source_type: str,
        title: str,
        source_ref: str,
        content: str,
        citation_url: str | None = None,
        metadata: dict | None = None,
    ) -> str:
        document_id = self.repository.upsert_document(
            source_type=source_type,
            title=title,
            source_ref=source_ref,
            content=content,
            metadata=metadata,
        )
        self.repository.add_chunks(document_id, _chunk_text(content, citation_url=citation_url))
        return document_id

    def search(self, query: str, limit: int = 5) -> list[dict]:
        return self.repository.search(query, limit=limit)


def _chunk_text(text: str, citation_url: str | None = None, chunk_size: int = 600) -> list[tuple[int, str, str | None]]:
    normalized = text.strip()
    chunks: list[tuple[int, str, str | None]] = []
    for index, start in enumerate(range(0, len(normalized), chunk_size)):
        chunks.append((index, normalized[start : start + chunk_size], citation_url))
    return chunks

