import asyncio
import json
from groq import AsyncGroq
from typing import AsyncGenerator
import os

class OptimizedStreamingService:
    def __init__(self):
        self.groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self.min_chunk = 50  # Balanced: not too small, not too large
        self.max_chunk = 100  # Balanced
        
    async def stream_llm_response(self, message: str) -> AsyncGenerator[str, None]:
        """Stream tokens from Groq with minimal latency"""
        stream = await self.groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": message}],
            stream=True,
            temperature=0.7,
            max_tokens=1024
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    async def smart_buffer(self, token_stream: AsyncGenerator[str, None]) -> AsyncGenerator[tuple[str, str], None]:
        """Buffer tokens - yield display tokens immediately, TTS in chunks"""
        tts_buffer = ""
        
        async for token in token_stream:
            # Send each token immediately for display
            yield ("display", token)
            
            tts_buffer += token
            
            # Send to TTS only at sentence boundaries or when buffer is full
            if len(tts_buffer) >= self.min_chunk:
                # Check for sentence endings (not commas)
                if any(p in token for p in ['.', '!', '?', '\n']):
                    yield ("tts", tts_buffer.strip())
                    tts_buffer = ""
                # Force send if buffer too large
                elif len(tts_buffer) >= self.max_chunk:
                    yield ("tts", tts_buffer.strip())
                    tts_buffer = ""
        
        # Send remaining buffer
        if tts_buffer.strip():
            yield ("tts", tts_buffer.strip())

optimized_streaming_service = OptimizedStreamingService()
