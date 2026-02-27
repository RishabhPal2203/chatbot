from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database.config import get_db
from services.chat_service import ChatService
from services.speech_service import SpeechService
from utils.schemas import TextChatRequest, ChatResponse
import uuid
import os
import shutil

router = APIRouter(prefix="/chat", tags=["chat"])
chat_service = ChatService()
speech_service = SpeechService()

@router.post("/text", response_model=ChatResponse)
def text_chat(request: TextChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or str(uuid.uuid4())
    result = chat_service.process_message(request.message, session_id, db)
    
    audio_path = speech_service.text_to_speech(result["response"])
    audio_url = f"/audio/{os.path.basename(audio_path)}"
    
    return ChatResponse(
        response=result["response"],
        intent=result["intent"],
        confidence=result["confidence"],
        session_id=result["session_id"],
        audio_url=audio_url
    )

@router.post("/voice", response_model=ChatResponse)
async def voice_chat(audio: UploadFile = File(...), session_id: str = None, db: Session = Depends(get_db)):
    temp_path = f"temp_{uuid.uuid4()}.wav"
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        text = speech_service.speech_to_text(temp_path)
        session_id = session_id or str(uuid.uuid4())
        result = chat_service.process_message(text, session_id, db)
        
        audio_path = speech_service.text_to_speech(result["response"])
        audio_url = f"/audio/{os.path.basename(audio_path)}"
        
        return ChatResponse(
            response=result["response"],
            intent=result["intent"],
            confidence=result["confidence"],
            session_id=result["session_id"],
            audio_url=audio_url
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing audio: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
