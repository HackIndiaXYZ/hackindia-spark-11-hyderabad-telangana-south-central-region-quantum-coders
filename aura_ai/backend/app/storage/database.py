from __future__ import annotations

import os
from typing import Any
from pymongo import MongoClient
from pymongo.database import Database


def get_mongo_uri() -> str:
    return os.getenv("MONGO_URI", "mongodb://localhost:27017")


def get_db_name() -> str:
    return os.getenv("MONGO_DB_NAME", "digital_twin_health")


def get_mongo_client() -> MongoClient:
    uri = get_mongo_uri()
    return MongoClient(uri, serverSelectionTimeoutMS=5000)


def get_database() -> Database | None:
    try:
        client = get_mongo_client()
        db_name = get_db_name()
        db = client[db_name]
        
        # Verify connection using a simple ping (no extra args for Atlas compatibility)
        client.admin.command('ping')
        
        print(f"[OK] Connected to MongoDB: {db_name}")
        db.documents.create_index([("title", "text"), ("content", "text")])
        return db
    except Exception as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
        print("Falling back to local development mode (some features may be limited)")
        return None

