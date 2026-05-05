import asyncio
import json
import os
import sys
from fastapi import WebSocket
from typing import AsyncGenerator
from gtts import gTTS
import io

# Handle both relative and absolute imports
try:
    from .routes.settings import api_key_sessions
except ImportError:
    # When running directly from backend directory
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from backend.routes.settings import api_key_sessions

class StreamingAudioService:
    async def stream_tts_to_mp3(self, text: str) -> AsyncGenerator[bytes, None]:
        """Stream TTS as MP3 chunks"""
        # Generate TTS audio
        tts = gTTS(text=text, lang='en', slow=False)
        
        # Save to BytesIO buffer
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        # Stream in chunks
        chunk_size = 4096
        while True:
            chunk = audio_buffer.read(chunk_size)
            if not chunk:
                break
            yield chunk
            await asyncio.sleep(0.01)

class WebSocketStreamer:
    def __init__(self):
        self.audio_service = StreamingAudioService()
    
    async def handle_streaming_chat(self, websocket: WebSocket, message: dict):
        """Handle streaming text + audio response"""
        from groq import AsyncGroq
        
        # Check if this is an audio request
        if message.get('requestAudio'):
            text = message.get('text', '')
            # Stream MP3 audio chunks
            async for mp3_chunk in self.audio_service.stream_tts_to_mp3(text):
                await websocket.send_bytes(mp3_chunk)
            await websocket.send_text(json.dumps({'type': 'audio_complete'}))
            return
        
        # Regular text message
        text_message = message.get('message', '')
        
        # Get API key - try multiple sources
        api_key = message.get('api_key')
        
        # Try to get from cookies (passed from WebSocket in main.py)
        cookies = message.get('_cookies', {})
        session_id = cookies.get('session_id', '')
        if not api_key and session_id and session_id in api_key_sessions:
            api_key = api_key_sessions[session_id]
        
        # Fallback to environment variable (for server-side configured key)
        if not api_key:
            api_key = os.getenv('GROQ_API_KEY')
        
        if not api_key:
            await websocket.send_text(json.dumps({
                'type': 'error',
                'message': 'Please configure your Groq API key in Settings. Get your free API key from https://console.groq.com/keys'
            }))
            return
        
        # Stream text tokens from Groq
        client = AsyncGroq(api_key=api_key)
        stream = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": text_message}],
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                token = chunk.choices[0].delta.content
                await websocket.send_text(json.dumps({
                    'type': 'text_token',
                    'token': token
                }))
        
        # Signal text completion
        await websocket.send_text(json.dumps({'type': 'text_complete'}))