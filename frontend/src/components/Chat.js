import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio, sendChatMessage, textToSpeech } from '../services/api';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(text, sessionId);
      if (!sessionId) setSessionId(response.session_id);

      const botMessage = {
        text: response.response,
        sender: 'bot',
        audioUrl: null
      };
      const messageIndex = messages.length + 1;
      setMessages(prev => [...prev, botMessage]);
      
      // Auto-play TTS
      await playTTS(response.response, messageIndex);
    } catch (error) {
      setMessages(prev => [...prev, { text: 'Error: Could not connect to server', sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const playTTS = async (text, messageIndex) => {
    try {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentAudioIndex(messageIndex);
      const audioBlob = await textToSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      setCurrentAudioIndex(null);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentAudioIndex(null);
    }
  };

  const togglePauseAudio = () => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.play();
        setIsPaused(false);
      } else {
        audioRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const replayAudio = (messageIndex) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentAudioIndex(messageIndex);
    }
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
    setLoading(true);
    try {
      console.log('Audio blob size:', audioBlob.size);
      const transcription = await transcribeAudio(audioBlob);
      console.log('Transcription:', transcription);
      setInput(transcription.text);
      await handleSend(transcription.text);
    } catch (error) {
      console.error('Transcription error:', error);
      alert(`Transcription failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
        <h2>☁️ Cloud Contact Center Assistant</h2>
        {isRecording && <span className="status-badge recording">🎤 Listening...</span>}
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="message-content">
              <p>{msg.text}</p>
              {msg.sender === 'bot' && (
                <div className="audio-controls">
                  {isSpeaking && currentAudioIndex === idx ? (
                    <>
                      <button className="control-btn" onClick={togglePauseAudio}>
                        {isPaused ? '▶️' : '⏸️'}
                      </button>
                      <button className="control-btn stop" onClick={stopAudio}>⏹️</button>
                    </>
                  ) : (
                    <button className="control-btn" onClick={() => replayAudio(idx)}>🔊</button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
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
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type or speak your message..."
          disabled={isRecording}
        />
        <button onClick={() => handleSend()} disabled={loading || isRecording}>Send</button>
      </div>
      <audio ref={audioRef} onEnded={() => { setIsSpeaking(false); setIsPaused(false); setCurrentAudioIndex(null); }} />
    </div>
  );
};

export default Chat;
