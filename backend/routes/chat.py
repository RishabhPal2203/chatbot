from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database.config import get_db
from services.chat_service import ChatService
from services.speech_service import SpeechService
from services.title_service import TitleGenerationService
from utils.schemas import TextChatRequest, ChatResponse
from pydantic import BaseModel
import uuid
import os
import shutil
import json

router = APIRouter(prefix="/chat", tags=["chat"])
chat_service = ChatService()
speech_service = SpeechService()
title_service = TitleGenerationService()

class TitleRequest(BaseModel):
    message: str

class TitleResponse(BaseModel):
    title: str

@router.post("/generate-title", response_model=TitleResponse)
def generate_title(title_request: TitleRequest, request: Request):
    """Generate a conversation title from the first message"""
    title = title_service.generate_title(title_request.message, request)
    return TitleResponse(title=title)

@router.post("/stream")
async def stream_chat(chat_request: TextChatRequest, request: Request, db: Session = Depends(get_db)):
    session_id = chat_request.session_id or str(uuid.uuid4())
    
    async def generate():
        full_response = ""
        try:
            async for chunk in chat_service.stream_message(chat_request.message, session_id, request):
                full_response += chunk
                yield f"data: {json.dumps({'token': chunk})}\n\n"
            
            # Save to database after streaming completes
            intent = chat_service.detect_intent(chat_request.message)
            chat_service.save_conversation(chat_request.message, full_response, intent, session_id, db)
            
            yield f"data: {json.dumps({'done': True, 'session_id': session_id})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@router.post("/text", response_model=ChatResponse)
def text_chat(chat_request: TextChatRequest, request: Request, db: Session = Depends(get_db)):
    session_id = chat_request.session_id or str(uuid.uuid4())
    result = chat_service.process_message(chat_request.message, session_id, db, request)
    
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
