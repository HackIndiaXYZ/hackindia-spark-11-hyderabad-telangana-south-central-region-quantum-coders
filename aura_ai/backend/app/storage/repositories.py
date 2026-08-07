from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from datetime import datetime
from bson import ObjectId
from pymongo.database import Database


@dataclass(frozen=True)
class StoredReport:
    id: str
    requested_mode: str
    used_mode: str
    report: dict[str, Any]


class ReportRepository:
    def __init__(self, db: Database | None) -> None:
        self.collection = db.reports if db is not None else None

    def save(
        self,
        payload: dict[str, Any],
        report: dict[str, Any],
        requested_mode: str,
        used_mode: str,
        model: str | None = None,
        fallback_reason: str | None = None,
    ) -> str:
        doc = {
            "created_at": datetime.utcnow(),
            "requested_mode": requested_mode,
            "used_mode": used_mode,
            "model": model,
            "fallback_reason": fallback_reason,
            "payload": payload,
            "report": report,
        }
        result = self.collection.insert_one(doc)
        return str(result.inserted_id)

    def get(self, report_id: str) -> StoredReport | None:
        try:
            row = self.collection.find_one({"_id": ObjectId(report_id)})
        except Exception:
            return None
        if row is None:
            return None
        return StoredReport(
            id=str(row["_id"]),
            requested_mode=row["requested_mode"],
            used_mode=row["used_mode"],
            report=row["report"],
        )


class TelemetryRepository:
    def __init__(self, db: Database) -> None:
        self.collection = db.telemetry_events

    def record(self, category: str, message: str, details: dict[str, Any] | None = None) -> str:
        doc = {
            "created_at": datetime.utcnow(),
            "category": category,
            "message": message,
            "details": details or {},
        }
        result = self.collection.insert_one(doc)
        return str(result.inserted_id)


class DocumentRepository:
    def __init__(self, db: Database) -> None:
        self.db = db
        self.collection = db.documents
        self.chunks_collection = db.document_chunks

    def upsert_document(
        self,
        source_type: str,
        title: str,
        source_ref: str,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> str:
        query = {"source_type": source_type, "source_ref": source_ref}
        update = {
            "$set": {
                "title": title,
                "content": content,
                "metadata": metadata or {},
                "updated_at": datetime.utcnow(),
            },
            "$setOnInsert": {"created_at": datetime.utcnow()},
        }
        result = self.collection.update_one(query, update, upsert=True)
        
        # Get the ID either from existing or new
        if result.upserted_id:
            doc_id = result.upserted_id
        else:
            existing = self.collection.find_one(query)
            doc_id = existing["_id"]

        # Clear old chunks
        self.chunks_collection.delete_many({"document_id": doc_id})
        return str(doc_id)

    def add_chunks(self, document_id: str, chunks: list[tuple[int, str, str | None]]) -> None:
        doc_id = ObjectId(document_id)
        docs = [
            {
                "document_id": doc_id,
                "chunk_index": index,
                "content": content,
                "citation_url": citation_url,
            }
            for index, content, citation_url in chunks
        ]
        if docs:
            self.chunks_collection.insert_many(docs)

    def search(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        # Use MongoDB Text Search if index exists, otherwise simple regex
        cursor = self.chunks_collection.find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(limit)
        
        results = []
        for chunk in cursor:
            # Join with parent document info
            parent = self.collection.find_one({"_id": chunk["document_id"]})
            if not parent:
                continue
            results.append({
                "title": parent["title"],
                "source_type": parent["source_type"],
                "source_ref": parent.get("source_ref"),
                "citation_url": chunk.get("citation_url"),
                "content": chunk["content"],
            })
            
        # Fallback if text search yields nothing (simple regex)
        if not results:
            cursor = self.chunks_collection.find(
                {"content": {"$regex": query, "$options": "i"}}
            ).limit(limit)
            for chunk in cursor:
                parent = self.collection.find_one({"_id": chunk["document_id"]})
                if not parent:
                    continue
                results.append({
                    "title": parent["title"],
                    "source_type": parent["source_type"],
                    "source_ref": parent.get("source_ref"),
                    "citation_url": chunk.get("citation_url"),
                    "content": chunk["content"],
                })
        
@dataclass(frozen=True)
class User:
    id: str
    email: str
    password_hash: str
    full_name: str
    lifestyle_data: dict[str, Any]
    created_at: datetime


class UserRepository:
    def __init__(self, db: Database | None) -> None:
        self.collection = db.users if db is not None else None

    def create(self, email: str, password_hash: str, full_name: str, lifestyle_data: dict[str, Any]) -> str:
        if self.collection is None:
            raise RuntimeError("Database connection is unavailable")
        doc = {
            "email": email,
            "password_hash": password_hash,
            "full_name": full_name,
            "lifestyle_data": lifestyle_data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        # Ensure email is unique
        self.collection.create_index("email", unique=True)
        result = self.collection.insert_one(doc)
        return str(result.inserted_id)

    def find_by_email(self, email: str) -> User | None:
        if self.collection is None:
            return None
        row = self.collection.find_one({"email": email})
        if row is None:
            return None
        return User(
            id=str(row["_id"]),
            email=row["email"],
            password_hash=row["password_hash"],
            full_name=row["full_name"],
            lifestyle_data=row["lifestyle_data"],
            created_at=row["created_at"],
        )

    def find_by_id(self, user_id: str) -> User | None:
        if self.collection is None:
            return None
        try:
            row = self.collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None
        if row is None:
            return None
        return User(
            id=str(row["_id"]),
            email=row["email"],
            password_hash=row["password_hash"],
            full_name=row["full_name"],
            lifestyle_data=row["lifestyle_data"],
            created_at=row["created_at"],
        )

    def update_lifestyle(self, user_id: str, lifestyle_data: dict[str, Any]) -> bool:
        if self.collection is None:
            return False
        result = self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"lifestyle_data": lifestyle_data, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

