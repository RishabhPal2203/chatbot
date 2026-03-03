import json
import websockets
import os
import base64
from typing import AsyncGenerator

class StreamingTTSService:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY", "")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
        
    async def text_to_speech_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        if not self.api_key or not text.strip():
            return
            
        uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}/stream-input?model_id=eleven_turbo_v2"
        
        try:
            async with websockets.connect(uri) as ws:
                await ws.send(json.dumps({
                    "text": " ",
                    "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
                    "xi_api_key": self.api_key,
                }))
                await ws.send(json.dumps({"text": text}))
                await ws.send(json.dumps({"text": ""}))  # End signal
                
                async for message in ws:
                    data = json.loads(message)
                    if data.get("audio"):
                        yield base64.b64decode(data["audio"])
                    if data.get("isFinal"):
                        break
        except Exception as e:
            print(f"TTS Error: {e}")

streaming_tts_service = StreamingTTSService()
