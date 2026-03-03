from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from streaming_audio import WebSocketStreamer
import json

app = FastAPI()
streamer = WebSocketStreamer()

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Receive text message
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Stream response (text + audio)
            await streamer.handle_streaming_chat(websocket, message)
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()