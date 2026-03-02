import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Square } from 'lucide-react';

const InputBar = ({ onSendMessage, onStartRecording, onStopRecording, isRecording, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <div className="p-6 border-t border-white/10">
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit}
        className="glass-strong rounded-2xl p-2 flex items-end gap-2 shadow-2xl"
      >
        {/* Voice Recording Button */}
        <motion.button
          type="button"
          onClick={toggleRecording}
          disabled={disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
            transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
              : 'glass hover:glass-strong'
            }
          `}
        >
          {isRecording ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Square className="w-5 h-5 text-white fill-white" />
            </motion.div>
          ) : (
            <Mic className="w-5 h-5 text-gray-300" />
          )}
        </motion.button>

        {/* Text Input */}
        <div className="flex-1 min-w-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Listening..." : "Type your message..."}
            disabled={disabled || isRecording}
            rows={1}
            className="
              w-full bg-transparent text-white placeholder-gray-500
              resize-none outline-none px-4 py-3
              disabled:opacity-50 disabled:cursor-not-allowed
              max-h-32 overflow-y-auto
            "
            style={{
              minHeight: '48px',
              lineHeight: '24px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
        </div>

        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={!input.trim() || disabled || isRecording}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
            transition-all duration-300
            ${input.trim() && !disabled && !isRecording
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/50'
              : 'glass opacity-50 cursor-not-allowed'
            }
          `}
        >
          <Send className="w-5 h-5 text-white" />
        </motion.button>
      </motion.form>

      {/* Helper Text */}
      <div className="mt-3 px-2 flex items-center justify-between text-xs text-gray-500">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span className="flex items-center gap-2">
          <Mic className="w-3 h-3" />
          Voice input available
        </span>
      </div>
    </div>
  );
};

export default InputBar;
