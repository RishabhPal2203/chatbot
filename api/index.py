import sys
from pathlib import Path
import os

# Set Vercel environment flag BEFORE any imports
os.environ["VERCEL"] = "1"

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    # Import the main app
    from main import app
except Exception as e:
    # Fallback minimal app if imports fail
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
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
            "note": "Serverless deployment - limited features"
        }
    
    @app.get("/health")
    def health():
        return {"status": "healthy", "error": str(e)}

