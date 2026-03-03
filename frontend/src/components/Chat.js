import React, { useState, useRef, useEffect } from 'react';
import StreamingChatClient from '../services/StreamingChatClient';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [audioLatency, setAudioLatency] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamingClientRef = useRef(null);

  // Initialize streaming client
  useEffect(() => {
    streamingClientRef.current = new StreamingChatClient(
      (token) => {
        // Handle streaming text tokens
        setCurrentResponse(prev => prev + token);
      },
      () => {
        // Text complete - finalize message
        const botMessage = {
          text: currentResponse,
          sender: 'bot',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMessage]);
        setCurrentResponse('');
        setLoading(false);
        setIsProcessing(false);
      },
      () => {
        // Audio complete
        setIsSpeaking(false);
        const latency = streamingClientRef.current.getAudioLatency();
        setAudioLatency(latency);
      }
    );
    
    streamingClientRef.current.connect();
    
    return () => {
      streamingClientRef.current?.disconnect();
    };
  }, [currentResponse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, currentResponse]);

  const handleSend = async (text = input) => {
    if (!text.trim() || isProcessing) return;

    // Stop any currently playing audio
    stopAudio();

    const userMessage = { text, sender: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsProcessing(true);
    setCurrentResponse('');

    // Send via WebSocket for streaming response
    streamingClientRef.current?.sendMessage(text);
  };

  const playAudio = async (text, messageIdx) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    // Request audio streaming on-demand
    streamingClientRef.current?.requestAudio(text);
  };

  const stopAudio = () => {
    streamingClientRef.current?.stopAudio();
    setIsSpeaking(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      alert('Microphone permission denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceInput = async (audioBlob) => {
    // Placeholder for voice transcription
    // Replace with actual transcription service
    const mockTranscription = "Hello, I need help with my order";
    setInput(mockTranscription);
    await handleSend(mockTranscription);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>☁️ Streaming AI Assistant</h2>
        <div className="status-indicators">
          {isRecording && <span className="status-badge recording">🎤 Listening...</span>}
          {isSpeaking && <span className="status-badge speaking">🔊 Speaking</span>}
          {audioLatency && <span className="latency-badge">Latency: {audioLatency.toFixed(0)}ms</span>}
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="message-content">
              <div className="message-text">{msg.text}</div>
              {msg.sender === 'bot' && (
                <button 
                  className="audio-play-btn" 
                  onClick={() => playAudio(msg.text, idx)}
                  disabled={isSpeaking}
                >
                  {isSpeaking ? '🔊' : '▶️'}
                </button>
              )}
            </div>
          </div>
        ))}
        {currentResponse && (
          <div className="message bot streaming">
            <div className="message-content">
              <div className="message-text">{currentResponse}</div>
              <div className="streaming-indicator">●</div>
            </div>
          </div>
        )}
        {loading && <div className="message bot"><div className="typing">Typing...</div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <button 
          className={`mic-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          disabled={loading || isSpeaking}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSend()}
          placeholder="Type or speak your message..."
          disabled={isRecording || isProcessing}
        />
        <button onClick={() => handleSend()} disabled={isProcessing || isRecording}>Send</button>
      </div>

    </div>
  );
};

export default Chat;
