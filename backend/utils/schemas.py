from pydantic import BaseModel
from typing import Optional

class TextChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    confidence: float
    session_id: str
    audio_url: Optional[str] = None
