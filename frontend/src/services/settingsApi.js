import { API_URL } from '../config';

const API_BASE_URL = API_URL;

// Store API key in localStorage for cross-domain compatibility
let storedApiKey = null;

export const setGroqApiKey = async (apiKey) => {
  // Store in localStorage for persistence across sessions
  storedApiKey = apiKey;
  localStorage.setItem('groq_api_key', apiKey);
  
  const response = await fetch(`${API_BASE_URL}/settings/api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ api_key: apiKey })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to save API key');
  }

  return response.json();
};

export const checkApiKeyStatus = async () => {
  // First check localStorage
  const localKey = localStorage.getItem('groq_api_key');
  if (localKey) {
    return { has_api_key: true };
  }
  
  const response = await fetch(`${API_BASE_URL}/settings/api-key/status`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to check API key status');
  return response.json();
};

export const getStoredApiKey = () => {
  if (storedApiKey) return storedApiKey;
  storedApiKey = localStorage.getItem('groq_api_key');
  return storedApiKey;
};
