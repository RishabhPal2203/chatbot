from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
import os
import secrets

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
    
    if len(api_key) < 20:
        raise HTTPException(status_code=400, detail="API key seems too short")
    
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
    return {"has_api_key": bool(has_key)}

def get_groq_api_key(request: Request) -> str:
    """Get API key for current session"""
    session_id = request.cookies.get("session_id")
    if session_id and session_id in api_key_sessions:
        return api_key_sessions[session_id]
    return None
