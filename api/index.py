import sys
from pathlib import Path
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import traceback

# Set Vercel environment flag BEFORE any imports
os.environ["VERCEL"] = "1"

# Change working directory to backend for relative imports to work
os.chdir(Path(__file__).parent.parent / "backend")

# Add the project root to path so 'backend' is importable as a package
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

error_details = None
try:
    from backend.main import app as backend_app
    app = backend_app
except Exception as e:
    error_details = f"{str(e)}\n{traceback.format_exc()}"
    app = FastAPI(title="Cloud Contact Center AI Assistant")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    def root():
        return {
            "message": "Cloud Contact Center AI Assistant API",
            "status": "running",
            "note": "Serverless deployment - import error occurred",
            "error": error_details
        }
    
    @app.get("/health")
    def health():
        return {"status": "healthy", "error": error_details}

handler = app

