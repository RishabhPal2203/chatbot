import React, { useState, useRef, useEffect } from 'react';
import { sendTextMessage } from '../services/api';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendTextMessage(input, sessionId);
      if (!sessionId) setSessionId(response.session_id);

      const botMessage = {
        text: response.response,
        sender: 'bot',
        intent: response.intent,
        confidence: response.confidence,
        audioUrl: response.audio_url
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { text: 'Error: Could not connect to server', sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (audioUrl) => {
    const audio = new Audio(`http://localhost:8000${audioUrl}`);
    audio.play();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>☁️ Cloud Contact Center Assistant</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="message-content">
              <p>{msg.text}</p>
              {msg.intent && (
                <span className="intent-badge">Intent: {msg.intent} ({(msg.confidence * 100).toFixed(0)}%)</span>
              )}
              {msg.audioUrl && (
                <button className="audio-btn" onClick={() => playAudio(msg.audioUrl)}>🔊 Play</button>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="message bot"><div className="typing">Typing...</div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
