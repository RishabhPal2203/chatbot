from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database.config import engine, Base
from routes import chat, analytics
import logging
import os
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cloud Contact Center AI Assistant",
    description="Voice and Text-Based Conversational AI Chatbot",
    version="1.0.0"
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("audio_responses", exist_ok=True)
app.mount("/audio", StaticFiles(directory="audio_responses"), name="audio")

app.include_router(chat.router)
app.include_router(analytics.router)

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
