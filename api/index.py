import sys
from pathlib import Path
import os

# Set Vercel environment flag BEFORE any imports
os.environ["VERCEL"] = "1"

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import the main app
from main import app
