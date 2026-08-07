import sys
from pathlib import Path

_project_root = str(Path(__file__).resolve().parents[1])
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from backend.app.api import app

# Entry point for Vercel Serverless Functions and root API handler
