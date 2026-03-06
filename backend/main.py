from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database.config import engine, Base
from routes import chat, analytics, voice, streaming, settings
from streaming_audio import WebSocketStreamer
import logging
import os
import json
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Skip database creation in serverless
if not os.getenv("VERCEL"):
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cloud Contact Center AI Assistant",
    description="Voice and Text-Based Conversational AI Chatbot",
    version="1.0.0"
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use specific origins, not "*" when using credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Skip file operations in serverless
if not os.getenv("VERCEL"):
    os.makedirs("audio_responses", exist_ok=True)
    app.mount("/audio", StaticFiles(directory="audio_responses"), name="audio")

app.include_router(chat.router)
app.include_router(analytics.router)
app.include_router(voice.router)
app.include_router(streaming.router)
app.include_router(settings.router)

# WebSocket streaming endpoint
streamer = WebSocketStreamer()

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            logger.info(f"Received: {message.get('message', message.get('requestAudio'))}")
            
            await streamer.handle_streaming_chat(websocket, message)
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass

@app.get("/")
def root():
    return {
        "message": "Cloud Contact Center AI Assistant API",
        "version": "1.0.0",
        "endpoints": {
            "chat_text": "/chat/text",
            "chat_voice": "/chat/voice",
            "analytics_summary": "/analytics/summary",
            "analytics_intents": "/analytics/intents"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
