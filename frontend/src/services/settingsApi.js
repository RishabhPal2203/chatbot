const API_BASE_URL = 'http://localhost:8000';

export const setGroqApiKey = async (apiKey) => {
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
  const response = await fetch(`${API_BASE_URL}/settings/api-key/status`, {
    credentials: 'include'  // Include cookies
  });
  if (!response.ok) throw new Error('Failed to check API key status');
  return response.json();
};
