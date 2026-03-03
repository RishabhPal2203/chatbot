import os
import time
from typing import AsyncGenerator
from openai import AsyncOpenAI

class OpenAITTSService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
        
    async def text_to_speech_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        """Stream audio from OpenAI TTS (faster than ElevenLabs)"""
        if not self.client.api_key or not text.strip():
            return
            
        start_time = time.time()
        chunk_count = 0
        
        try:
            async with self.client.audio.speech.with_streaming_response.create(
                model="tts-1",  # Fastest model
                voice="alloy",
                input=text,
                response_format="mp3"
            ) as response:
                first_chunk = True
                async for chunk in response.iter_bytes(chunk_size=1024):
                    if chunk:
                        chunk_count += 1
                        if first_chunk:
                            first_time = time.time()
                            print(f"  ⏱️  First audio chunk: {int((first_time - start_time) * 1000)}ms")
                            first_chunk = False
                        yield chunk
                
                total_time = time.time() - start_time
                print(f"  ✅ TTS complete: {chunk_count} chunks in {int(total_time * 1000)}ms")
                
        except Exception as e:
            print(f"OpenAI TTS Error: {e}")

openai_tts_service = OpenAITTSService()
