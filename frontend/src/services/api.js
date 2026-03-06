import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Configure axios to include credentials (cookies) with all requests
axios.defaults.withCredentials = true;

export const sendTextMessage = async (message, sessionId) => {
  const response = await axios.post(`${API_BASE_URL}/chat/text`, {
    message,
    session_id: sessionId
  });
  return response.data;
};

export const sendVoiceMessage = async (audioBlob, sessionId) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.wav');
  if (sessionId) formData.append('session_id', sessionId);
  
  const response = await axios.post(`${API_BASE_URL}/chat/voice`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  
  const response = await axios.post(`${API_BASE_URL}/api/transcribe`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const sendChatMessage = async (message, sessionId) => {
  const response = await axios.post(`${API_BASE_URL}/chat/text`, {
    message,
    session_id: sessionId
  });
  return response.data;
};

export const textToSpeech = async (text) => {
  const response = await axios.post(`${API_BASE_URL}/api/tts`, 
    { text },
    { responseType: 'blob' }
  );
  return response.data;
};

export const generateConversationTitle = async (firstMessage) => {
  const response = await axios.post(`${API_BASE_URL}/chat/generate-title`, {
    message: firstMessage
  });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/summary`);
  return response.data;
};
