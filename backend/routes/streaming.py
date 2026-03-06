from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
from services.optimized_streaming_service import optimized_streaming_service
from services.openai_tts_service import openai_tts_service

router = APIRouter(prefix="/ws", tags=["websocket"])

@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    await websocket.accept()
    current_tasks = []
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            user_message = message_data.get("message", "")
            
            if not user_message:
                continue
            
            # Cancel all previous TTS tasks
            for task in current_tasks:
                task.cancel()
            current_tasks.clear()
            
            # Send stop signal to frontend
            await websocket.send_json({"type": "stop"})
            
            token_stream = optimized_streaming_service.stream_llm_response(user_message)
            smart_stream = optimized_streaming_service.smart_buffer(token_stream)
            
            full_text = ""
            tts_count = 0
            
            async def process_tts_chunk(text_chunk):
                nonlocal tts_count
                tts_count += 1
                print(f"🔊 TTS Call #{tts_count}: '{text_chunk[:50]}...'")
                
                try:
                    async for audio_chunk in openai_tts_service.text_to_speech_stream(text_chunk):
                        if audio_chunk:
                            await websocket.send_bytes(audio_chunk)
                except asyncio.CancelledError:
                    print(f"🛑 TTS #{tts_count} cancelled")
                    raise
            
            async for msg_type, content in smart_stream:
                if msg_type == "display":
                    await websocket.send_json({"type": "text", "content": content})
                    full_text += content
                    
                elif msg_type == "tts":
                    task = asyncio.create_task(process_tts_chunk(content))
                    current_tasks.append(task)
            
            print(f"✅ Total TTS calls: {tts_count}")
            await websocket.send_json({"type": "done", "full_text": full_text.strip()})
            
    except WebSocketDisconnect:
        for task in current_tasks:
            task.cancel()
        print("Client disconnected")
    except Exception as e:
        for task in current_tasks:
            task.cancel()
        print(f"WebSocket error: {e}")
        await websocket.close()
