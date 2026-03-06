from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

router = APIRouter(prefix="/settings", tags=["settings"])

class APIKeyRequest(BaseModel):
    api_key: str

class APIKeyResponse(BaseModel):
    success: bool
    message: str

# In-memory storage for runtime API key
runtime_api_key = None

@router.post("/api-key", response_model=APIKeyResponse)
async def set_api_key(request: APIKeyRequest):
    global runtime_api_key
    
    if not request.api_key or not request.api_key.strip():
        raise HTTPException(status_code=400, detail="API key cannot be empty")
    
    if not request.api_key.startswith("gsk_"):
        raise HTTPException(status_code=400, detail="Invalid Groq API key format")
    
    runtime_api_key = request.api_key.strip()
    os.environ["GROQ_API_KEY"] = runtime_api_key
    
    return APIKeyResponse(
        success=True,
        message="API key updated successfully"
    )

@router.get("/api-key/status")
async def check_api_key_status():
    # Only check runtime key, not .env
    has_key = runtime_api_key is not None
    return {"has_api_key": bool(has_key)}

def get_groq_api_key():
    # Only use runtime key set by user, never fall back to .env
    return runtime_api_key
