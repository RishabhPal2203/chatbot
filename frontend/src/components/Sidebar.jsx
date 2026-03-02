import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User, ChevronLeft } from 'lucide-react';
import ConversationItem from './ConversationItem';

const Sidebar = ({ 
  conversations, 
  activeConversationId, 
  onSelectConversation, 
  onNewChat, 
  onDeleteConversation,
  isOpen,
  onToggle 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-[280px] h-full glass-strong border-r border-white/10 flex flex-col relative"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <button
              onClick={onNewChat}
              className="w-full glass hover:glass-strong rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <Plus className="w-5 h-5 text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-white font-medium">New Chat</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onSelect={() => onSelectConversation(conv.id)}
                onDelete={() => onDeleteConversation(conv.id)}
              />
            ))}
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 hover:glass-strong transition-all duration-200 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">User</p>
                <p className="text-gray-400 text-xs truncate">user@example.com</p>
              </div>
            </div>
          </div>

          {/* Close Button (Mobile) */}
          <button
            onClick={onToggle}
            className="absolute top-4 -right-10 lg:hidden glass rounded-r-xl p-2 hover:glass-strong transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
