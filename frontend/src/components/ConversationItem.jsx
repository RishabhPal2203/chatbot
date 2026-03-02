import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, MoreVertical } from 'lucide-react';

const ConversationItem = ({ conversation, isActive, onSelect, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      className="relative group"
    >
      <div
        onClick={onSelect}
        className={`
          rounded-xl px-4 py-3 cursor-pointer transition-all duration-200
          ${isActive 
            ? 'glass-strong border border-blue-400/30 shadow-lg shadow-blue-500/10' 
            : 'glass hover:glass-strong'
          }
        `}
      >
        <div className="flex items-start gap-3">
          <MessageSquare className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
              {conversation.title}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatTime(conversation.timestamp)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-lg"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Delete Menu */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-0 top-full mt-1 z-10 glass-strong rounded-lg shadow-xl border border-white/10 overflow-hidden"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-red-500/20 transition-colors text-red-400 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ConversationItem;
