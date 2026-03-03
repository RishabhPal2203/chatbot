import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Pause, Square } from 'lucide-react';
import { textToSpeech } from '../services/api';

const MessageBubble = ({ message, messageIndex, activeAudioRef, playingMessageIndex, setPlayingMessageIndex, isPausedGlobal, setIsPausedGlobal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const isUser = message.sender === 'user';
  const isStreaming = message.streaming;
  const displayContent = isStreaming ? message.displayText : message.text;
  
  const isPlaying = playingMessageIndex === messageIndex;
  const isPaused = isPlaying && isPausedGlobal;
  const isAnyAudioPlaying = playingMessageIndex !== null && playingMessageIndex !== messageIndex && !isPausedGlobal;

  const stripMarkdown = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    const txt = document.createElement('textarea');
    txt.innerHTML = text;
    let decoded = txt.value.replace(/\\n/g, '\n');
    
    // Remove markdown syntax for TTS
    return decoded
      .replace(/^#{1,6} (.+)$/gm, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/^[•-] (.+)$/gm, '$1')
      .replace(/^\d+\. (.+)$/gm, '$1');
  };

  const formatText = (text, streaming = false) => {
    if (!text || typeof text !== 'string') return '';
    
    const txt = document.createElement('textarea');
    txt.innerHTML = text;
    let decoded = txt.value.replace(/\\n/g, '\n');
    
    // While streaming, show plain text
    if (streaming) {
      return decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    }
    
    // After streaming, render markdown
    decoded = decoded
      .replace(/^### (.+)$/gm, '<h4 class="text-base font-semibold mt-2 mb-1">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 class="text-lg font-semibold mt-3 mb-2">$1</h3>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-blue-300">$1</strong>')
      .replace(/^• (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4">$2</li>');
    
    return decoded;
  };

  const messageText = formatText(displayContent, isStreaming);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = async () => {
    try {
      // Stop any currently playing audio
      if (activeAudioRef?.current && activeAudioRef.current !== audioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      }
      
      if (!audioRef.current) {
        setIsLoading(true);
        const cleanText = stripMarkdown(message.text);
        const audioBlob = await textToSpeech(cleanText);
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setPlayingMessageIndex(null);
          setIsPausedGlobal(false);
          if (activeAudioRef) activeAudioRef.current = null;
        };
        setIsLoading(false);
      }
      
      if (activeAudioRef) activeAudioRef.current = audioRef.current;
      await audioRef.current.play();
      setPlayingMessageIndex(messageIndex);
      setIsPausedGlobal(false);
    } catch (error) {
      console.error('TTS error:', error);
      setPlayingMessageIndex(null);
      setIsLoading(false);
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPausedGlobal(true);
    }
  };

  const handleResumeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPausedGlobal(false);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingMessageIndex(null);
      setIsPausedGlobal(false);
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
        ${isUser 
          ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
          : 'bg-gradient-to-br from-purple-500 to-blue-500'
        }
      `}>
        <span className="text-white text-lg">
          {isUser ? '👤' : '🤖'}
        </span>
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-2 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          rounded-3xl px-6 py-4 shadow-lg
          ${isUser 
            ? 'bg-gradient-to-br from-blue-500/90 to-cyan-500/90 backdrop-blur-xl border border-blue-400/30' 
            : 'glass-strong'
          }
        `}>
          <div 
            className="text-white text-[15px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: messageText }}
          />
          
        </div>

        {/* Audio Controls for Bot Messages */}
        {!isUser && !isStreaming && (
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayAudio}
                disabled={isLoading || isAnyAudioPlaying}
                className="glass hover:glass-strong rounded-full px-4 py-2 flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Volume2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-xs font-medium">{isLoading ? 'Loading...' : 'Play Audio'}</span>
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isPaused ? handleResumeAudio : handlePauseAudio}
                  className="glass hover:glass-strong rounded-full px-4 py-2 flex items-center gap-2 transition-all duration-200"
                >
                  <Pause className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-xs font-medium">{isPaused ? 'Resume' : 'Pause'}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStopAudio}
                  className="glass hover:glass-strong rounded-full p-2 transition-all duration-200"
                >
                  <Square className="w-4 h-4 text-red-400" />
                </motion.button>
              </>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-500 px-2">
          {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
