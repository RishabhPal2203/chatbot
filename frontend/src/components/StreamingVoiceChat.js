import React, { useState, useEffect, useRef } from 'react';
import { AudioStreamPlayer } from '../utils/audioPlayer';

export default function StreamingVoiceChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  
  const wsRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    audioPlayerRef.current = new AudioStreamPlayer();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.stop();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/stream');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        // Binary audio chunk
        const arrayBuffer = await event.data.arrayBuffer();
        audioPlayerRef.current.playChunk(arrayBuffer);
      } else {
        // JSON text message
        const data = JSON.parse(event.data);
        
        if (data.type === 'text') {
          setCurrentResponse(prev => prev + data.content + ' ');
        } else if (data.type === 'done') {
          setMessages(prev => [...prev, { role: 'assistant', content: data.full_text }]);
          setCurrentResponse('');
          setIsStreaming(false);
        }
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsStreaming(false);
    };
    
    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsStreaming(false);
    };
    
    return ws;
  };

  const sendMessage = () => {
    if (!input.trim() || isStreaming) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setIsStreaming(true);
    setCurrentResponse('');
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      wsRef.current = connectWebSocket();
    }
    
    const sendWhenReady = () => {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ message: input }));
        setInput('');
      } else {
        setTimeout(sendWhenReady, 100);
      }
    };
    
    sendWhenReady();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {currentResponse && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg bg-gray-700">
              {currentResponse}
              <span className="animate-pulse">▋</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? 'Streaming...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
