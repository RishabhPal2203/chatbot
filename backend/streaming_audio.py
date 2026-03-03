import asyncio
import json
from fastapi import WebSocket
from typing import AsyncGenerator
from gtts import gTTS
import io

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
        
        # Check if this is an audio request
        if message.get('requestAudio'):
            text = message.get('text', '')
            # Stream MP3 audio chunks
            async for mp3_chunk in self.audio_service.stream_tts_to_mp3(text):
                await websocket.send_bytes(mp3_chunk)
            await websocket.send_text(json.dumps({'type': 'audio_complete'}))
            return
        
        # Regular text message - skip audio if requested
        text_response = message.get('message', '')
        skip_audio = message.get('skipAudio', False)
        
        # Stream text tokens first
        async for token in self._stream_text_response(text_response):
            await websocket.send_text(json.dumps({
                'type': 'text_token',
                'token': token
            }))
        
        # Signal text completion
        await websocket.send_text(json.dumps({'type': 'text_complete'}))
    
    async def _stream_text_response(self, text: str) -> AsyncGenerator[str, None]:
        """Simulate Groq streaming API response"""
        words = text.split()
        for word in words:
            yield word + ' '
            await asyncio.sleep(0.05)