import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsModal from './components/SettingsModal';
import { checkApiKeyStatus, setGroqApiKey } from './services/settingsApi';

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversationMessages, setConversationMessages] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showInitialSettings, setShowInitialSettings] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const hasKeyInSession = sessionStorage.getItem('groq_api_key_set') === 'true';
        
        if (!hasKeyInSession) {
          const status = await checkApiKeyStatus();
          if (!status.has_api_key) {
            setShowInitialSettings(true);
          } else {
            sessionStorage.setItem('groq_api_key_set', 'true');
          }
        }
      } catch (error) {
        console.error('Failed to check API key status:', error);
        setShowInitialSettings(true);
      } finally {
        setIsCheckingApiKey(false);
      }
    };

    checkApiKey();
  }, []);

  const createNewConversation = (title = 'New Conversation') => {
    const newConv = {
      id: Date.now().toString(),
      title,
      timestamp: new Date()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setConversationMessages(prev => ({ ...prev, [newConv.id]: [] }));
    return newConv.id;
  };

  const handleNewChat = () => {
    createNewConversation();
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const updateConversationTitle = (convId, title) => {
    setConversations(prev => 
      prev.map(c => c.id === convId ? { ...c, title } : c)
    );
  };

  const handleDeleteConversation = (id) => {
    setConversations(conversations.filter(c => c.id !== id));
    const newMessages = { ...conversationMessages };
    delete newMessages[id];
    setConversationMessages(newMessages);
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updateConversationMessages = (convId, messages) => {
    setConversationMessages(prev => ({ ...prev, [convId]: messages }));
  };

  const handleInitialApiKeySave = async (apiKey) => {
    await setGroqApiKey(apiKey);
    sessionStorage.setItem('groq_api_key_set', 'true');
    setShowInitialSettings(false);
  };

  if (isCheckingApiKey) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <div className="flex h-full">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <ChatWindow
          conversationId={activeConversationId}
          messages={conversationMessages[activeConversationId] || []}
          onUpdateMessages={updateConversationMessages}
          onCreateConversation={createNewConversation}
          onUpdateConversationTitle={updateConversationTitle}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      {/* Initial Settings Modal */}
      <SettingsModal
        isOpen={showInitialSettings}
        onClose={() => {}} // Prevent closing
        onSaveKey={handleInitialApiKeySave}
        isRequired={true}
      />
    </div>
  );
}

export default App;
