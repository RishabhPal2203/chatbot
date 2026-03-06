import os
from typing import AsyncGenerator

# Import OpenAI TTS service
try:
    from services.openai_tts_service import openai_tts_service
except:
    openai_tts_service = None

class TTSProvider:
    def __init__(self):
        if openai_tts_service:
            self.service = openai_tts_service
            print("🔊 Using OpenAI TTS")
        else:
            self.service = None
            print("⚠️ No TTS service available")
    
    async def text_to_speech_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        if self.service:
            async for chunk in self.service.text_to_speech_stream(text):
                yield chunk

tts_provider = TTSProvider()
