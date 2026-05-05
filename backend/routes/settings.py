from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
import os
import secrets
import re

router = APIRouter(prefix="/settings", tags=["settings"])

class APIKeyRequest(BaseModel):
    api_key: str

class APIKeyResponse(BaseModel):
    success: bool
    message: str

# Session-based storage for API keys (session_id -> api_key)
api_key_sessions = {}

def get_or_create_session(request: Request, response: Response) -> str:
    """Get existing session ID from cookie or create new one"""
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = secrets.token_urlsafe(32)
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            max_age=3600,  # 1 hour
            samesite="lax"
        )
    return session_id

@router.post("/api-key", response_model=APIKeyResponse)
async def set_api_key(request: Request, response: Response, api_request: APIKeyRequest):
    if not api_request.api_key or not api_request.api_key.strip():
        raise HTTPException(status_code=400, detail="API key cannot be empty")
    
    api_key = api_request.api_key.strip()
    
    # Allow environment variable as fallback (server-side configured key)
    env_key = os.getenv("GROQ_API_KEY", "")
    if env_key and api_key == "use_server_key":
        api_key = env_key
    else:
        # Validate Groq API key format (must start with 'gsk_')
        if not api_key.startswith("gsk_"):
            raise HTTPException(
                status_code=400, 
                detail="Invalid API key. Groq API keys must start with 'gsk_'. Get your API key from https://console.groq.com/keys"
            )
        
        # Groq keys are typically 51+ characters
        if len(api_key) < 40:
            raise HTTPException(status_code=400, detail="API key seems too short for a Groq key")
        
        # Validate character set (alphanumeric + underscore after prefix)
        if not re.match(r'^gsk_[A-Za-z0-9]+$', api_key):
            raise HTTPException(
                status_code=400,
                detail="Invalid API key format. Groq API keys should only contain letters, numbers, and the 'gsk_' prefix"
            )
    
    session_id = get_or_create_session(request, response)
    api_key_sessions[session_id] = api_key
    
    return APIKeyResponse(
        success=True,
        message="API key updated successfully"
    )

@router.get("/api-key/status")
async def check_api_key_status(request: Request):
    session_id = request.cookies.get("session_id")
    has_key = session_id and session_id in api_key_sessions
    
    # Also check if server has a default key configured
    if not has_key and os.getenv("GROQ_API_KEY"):
        has_key = True
    
    return {"has_api_key": bool(has_key)}

def get_groq_api_key(request: Request) -> str:
    """Get API key for current session"""
    session_id = request.cookies.get("session_id")
    if session_id and session_id in api_key_sessions:
        return api_key_sessions[session_id]
    
    # Fallback to environment variable (server-side configured key)
    return os.getenv("GROQ_API_KEY", "")
