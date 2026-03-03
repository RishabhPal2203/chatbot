import React, { useState, useEffect, useRef } from 'react';
import { AudioStreamPlayer } from '../utils/audioPlayerOptimized';

export default function VoiceChatOptimized() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const wsRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    audioPlayerRef.current = new AudioStreamPlayer();
    connectWebSocket();
    
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (audioPlayerRef.current) audioPlayerRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    const ws = new WebSocket('ws://localhost:8000/ws/stream');
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setConnectionStatus('connected');
    };
    
    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const arrayBuffer = await event.data.arrayBuffer();
        await audioPlayerRef.current.playChunk(arrayBuffer);
      } else {
        const data = JSON.parse(event.data);
        
        if (data.type === 'stop') {
          // Stop current audio playback
          audioPlayerRef.current.stop();
          setCurrentResponse('');
        } else if (data.type === 'text') {
          setCurrentResponse(prev => prev + data.content);
        } else if (data.type === 'done') {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.full_text,
            timestamp: new Date()
          }]);
          setCurrentResponse('');
          setIsStreaming(false);
        }
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setConnectionStatus('error');
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket closed');
      setConnectionStatus('disconnected');
      setIsStreaming(false);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Reconnecting...');
        connectWebSocket();
      }, 3000);
    };
    
    wsRef.current = ws;
  };

  const sendMessage = (text = input) => {
    if (!text.trim() || isStreaming) return;
    
    const userMessage = { 
      role: 'user', 
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setCurrentResponse('');
    
    // Stop previous audio
    audioPlayerRef.current.stop();
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text }));
      setInput('');
    } else {
      setIsStreaming(false);
      alert('WebSocket not connected. Reconnecting...');
      connectWebSocket();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          sendMessage(transcript);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">🎙️ Streaming Voice AI</h1>
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
          <span className="text-sm text-gray-400">{connectionStatus}</span>
        </div>
        <button
          onClick={() => {
            setMessages([]);
            setCurrentResponse('');
            audioPlayerRef.current.stop();
          }}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-sm"
        >
          Clear Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg mb-2">👋 Start a conversation</p>
            <p className="text-sm">Type a message or use voice input</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 rounded-br-none' 
                : 'bg-gray-700 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-gray-300 mt-1 opacity-70">
                {msg.timestamp?.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {currentResponse && (
          <div className="flex justify-start">
            <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-gray-700 rounded-bl-none shadow-lg">
              <p className="whitespace-pre-wrap">
                {currentResponse}
                <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse">▋</span>
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700 bg-gray-900/50 backdrop-blur">
        <div className="flex gap-2 items-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isStreaming}
            className={`p-3 rounded-full transition-all ${
              isRecording 
                ? 'bg-red-600 animate-pulse' 
                : 'bg-gray-700 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isRecording ? 'Recording...' : 'Type your message...'}
            disabled={isStreaming || isRecording}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
          />
          
          <button
            onClick={() => sendMessage()}
            disabled={isStreaming || !input.trim() || isRecording}
            className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {isStreaming ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Streaming
              </span>
            ) : '📤 Send'}
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send • Click 🎤 for voice input
        </div>
      </div>
    </div>
  );
}

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Convert to text using Web Speech API or send to backend
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          sendMessage(transcript);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">🎙️ Streaming Voice AI</h1>
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
          <span className="text-sm text-gray-400">{connectionStatus}</span>
        </div>
        <button
          onClick={() => {
            setMessages([]);
            setCurrentResponse('');
            audioPlayerRef.current.reset();
          }}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-sm"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg mb-2">👋 Start a conversation</p>
            <p className="text-sm">Type a message or use voice input</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 rounded-br-none' 
                : 'bg-gray-700 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs text-gray-300 mt-1 opacity-70">
                {msg.timestamp?.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {currentResponse && (
          <div className="flex justify-start">
            <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-gray-700 rounded-bl-none shadow-lg">
              <p className="whitespace-pre-wrap">
                {currentResponse}
                <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse">▋</span>
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50 backdrop-blur">
        <div className="flex gap-2 items-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isStreaming}
            className={`p-3 rounded-full transition-all ${
              isRecording 
                ? 'bg-red-600 animate-pulse' 
                : 'bg-gray-700 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isRecording ? 'Recording...' : 'Type your message...'}
            disabled={isStreaming || isRecording}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
          />
          
          <button
            onClick={() => sendMessage()}
            disabled={isStreaming || !input.trim() || isRecording}
            className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {isStreaming ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Streaming
              </span>
            ) : '📤 Send'}
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send • Click 🎤 for voice input
        </div>
      </div>
    </div>
  );
}
