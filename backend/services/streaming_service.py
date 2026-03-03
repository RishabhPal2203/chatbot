import asyncio
import json
from groq import AsyncGroq
from typing import AsyncGenerator
import os

class StreamingService:
    def __init__(self):
        self.groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self.chunk_size = 75  # Characters to buffer before TTS
        
    async def stream_llm_response(self, message: str) -> AsyncGenerator[str, None]:
        """Stream tokens from Groq LLM"""
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
    
    async def buffer_for_tts(self, token_stream: AsyncGenerator[str, None]) -> AsyncGenerator[str, None]:
        """Buffer tokens into chunks suitable for TTS"""
        buffer = ""
        
        async for token in token_stream:
            buffer += token
            
            # Send on sentence boundaries or when buffer is full
            if len(buffer) >= self.chunk_size and any(p in token for p in ['.', '!', '?', '\n']):
                yield buffer.strip()
                buffer = ""
            elif len(buffer) >= self.chunk_size * 1.5:  # Force send if too large
                yield buffer.strip()
                buffer = ""
        
        # Send remaining buffer
        if buffer.strip():
            yield buffer.strip()

streaming_service = StreamingService()
