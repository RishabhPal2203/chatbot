import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Settings } from 'lucide-react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import SettingsModal from './SettingsModal';
import { transcribeAudio, generateConversationTitle } from '../services/api';
import { setGroqApiKey } from '../services/settingsApi';

const ChatWindow = ({ conversationId, messages, onUpdateMessages, onCreateConversation, onUpdateConversationTitle, onToggleSidebar, isSidebarOpen }) => {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [titleGenerated, setTitleGenerated] = useState({});
  const [localMessages, setLocalMessages] = useState([]);
  const [playingMessageIndex, setPlayingMessageIndex] = useState(null);
  const [isPausedGlobal, setIsPausedGlobal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const activeAudioRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(scrollToBottom, [localMessages]);
  
  useEffect(() => {
    // Stop audio when conversation changes
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    setSessionId(null);
    setTitleGenerated({});
  }, [conversationId]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    let currentConvId = conversationId;
    
    if (!currentConvId) {
      currentConvId = onCreateConversation('New Conversation');
    }

    const userMessage = { text, sender: 'user', timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    onUpdateMessages(currentConvId, newMessages);

    const botMessage = {
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      streaming: true,
      tokenQueue: [],
      displayText: ''
    };
    const botMessageIndex = newMessages.length;
    onUpdateMessages(currentConvId, [...newMessages, botMessage]);

    let renderInterval = null;

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('http://localhost:8000/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId }),
        signal: abortControllerRef.current.signal
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      const charBuffer = [];
      let streamComplete = false;

      renderInterval = setInterval(() => {
        setLocalMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const currentBot = updatedMessages[botMessageIndex];
          
          if (currentBot && charBuffer.length > 0) {
            const queueSize = charBuffer.length;
            let charsToReveal = 1;
            
            if (queueSize > 100) charsToReveal = 3;
            else if (queueSize > 50) charsToReveal = 2;
            
            const chars = charBuffer.splice(0, charsToReveal).join('');
            currentBot.displayText = (currentBot.displayText || '') + chars;
          } else if (streamComplete && charBuffer.length === 0) {
            clearInterval(renderInterval);
          }
          
          return updatedMessages;
        });
      }, 14);

      const processToken = (token) => {
        fullResponse += token;
        for (let char of token) {
          charBuffer.push(char);
        }
        setLocalMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const currentBot = updatedMessages[botMessageIndex];
          if (currentBot) {
            currentBot.text = fullResponse;
          }
          return updatedMessages;
        });
      };

      const finishStreaming = () => {
        streamComplete = true;
        // Schedule state update after render
        setTimeout(() => {
          setLocalMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const currentBot = updatedMessages[botMessageIndex];
            if (currentBot) {
              currentBot.streaming = false;
              currentBot.text = fullResponse;
            }
            onUpdateMessages(currentConvId, updatedMessages);
            return updatedMessages;
          });
        }, 0);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.token) {
              processToken(data.token);
            } else if (data.done) {
              finishStreaming();
              if (!sessionId) setSessionId(data.session_id);
            } else if (data.error) {
              if (renderInterval) clearInterval(renderInterval);
              console.error('Stream error:', data.error);
            }
          }
        }
      }
      
      if (messages.length === 0 && !titleGenerated[currentConvId]) {
        setTitleGenerated(prev => ({ ...prev, [currentConvId]: true }));
        try {
          const titleResponse = await generateConversationTitle(text);
          onUpdateConversationTitle(currentConvId, titleResponse.title);
        } catch (error) {
          console.error('Title generation failed:', error);
        }
      }
    } catch (error) {
      if (renderInterval) clearInterval(renderInterval);
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      const errorMessage = { 
        text: 'Error: Could not connect to server', 
        sender: 'bot',
        timestamp: new Date()
      };
      onUpdateMessages(currentConvId, [...newMessages, errorMessage]);
    } finally {
      abortControllerRef.current = null;
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
      const transcription = await transcribeAudio(audioBlob);
      await handleSendMessage(transcription.text);
    } catch (error) {
      console.error('Transcription error:', error);
      alert(`Transcription failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async (apiKey) => {
    await setGroqApiKey(apiKey);
    sessionStorage.setItem('groq_api_key_set', 'true');
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Header */}
      <div className="glass-strong border-b border-white/10 px-6 py-4 flex items-center gap-4">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="glass hover:glass-strong rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-white text-lg font-semibold">Cloud Contact Center Assistant</h1>
          <p className="text-gray-400 text-sm">AI-powered support chatbot</p>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="glass hover:glass-strong rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 glass-strong rounded-full px-4 py-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />
            <span className="text-white text-sm font-medium">Listening...</span>
          </motion.div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {localMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 glass-strong rounded-3xl flex items-center justify-center">
                <span className="text-4xl">💬</span>
              </div>
              <h2 className="text-white text-2xl font-semibold mb-3">Welcome to Cloud Contact Center</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Start a conversation by typing a message or using voice input. 
                I'm here to help with orders, technical support, pricing, and more.
              </p>
            </div>
          </motion.div>
        )}
        
        {localMessages.map((msg, idx) => (
          <MessageBubble 
            key={idx} 
            message={msg}
            messageIndex={idx}
            activeAudioRef={activeAudioRef}
            playingMessageIndex={playingMessageIndex}
            setPlayingMessageIndex={setPlayingMessageIndex}
            isPausedGlobal={isPausedGlobal}
            setIsPausedGlobal={setIsPausedGlobal}
          />
        ))}
        
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div className="glass-strong rounded-3xl px-6 py-4">
              <div className="flex gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <InputBar
        onSendMessage={handleSendMessage}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        isRecording={isRecording}
        disabled={loading}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveKey={handleSaveApiKey}
      />
    </div>
  );
};

export default ChatWindow;
