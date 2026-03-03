import os
from typing import AsyncGenerator

# Import both TTS services
try:
    from services.streaming_tts_service import streaming_tts_service as elevenlabs_service
except:
    elevenlabs_service = None

try:
    from services.openai_tts_service import openai_tts_service
except:
    openai_tts_service = None

class TTSProvider:
    def __init__(self):
        provider = os.getenv("TTS_PROVIDER", "openai").lower()
        
        if provider == "elevenlabs" and elevenlabs_service:
            self.service = elevenlabs_service
            print("🔊 Using ElevenLabs TTS")
        elif provider == "openai" and openai_tts_service:
            self.service = openai_tts_service
            print("🔊 Using OpenAI TTS (faster)")
        else:
            # Fallback to OpenAI
            self.service = openai_tts_service if openai_tts_service else elevenlabs_service
            print(f"🔊 Using fallback TTS")
    
    async def text_to_speech_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        if self.service:
            async for chunk in self.service.text_to_speech_stream(text):
                yield chunk

tts_provider = TTSProvider()
