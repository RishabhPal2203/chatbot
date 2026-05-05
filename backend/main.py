from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database.config import engine, Base
from .routes import chat, analytics, voice, streaming, settings
from .streaming_audio import WebSocketStreamer
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
    allow_origins=origins,
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

# SPA fallback - serve frontend files or index.html
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Let API routes handle themselves (this should never be reached for API routes)
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")
    
    frontend_build_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "build")
    
    # Check for static asset files in build directory
    potential_file = os.path.join(frontend_build_path, full_path)
    if os.path.isfile(potential_file):
        return FileResponse(potential_file)
    
    # Fallback to SPA index.html
    index_path = os.path.join(frontend_build_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"message": "Frontend not built. Run: cd frontend && npm run build"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
