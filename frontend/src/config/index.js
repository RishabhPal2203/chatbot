// Centralized API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS_BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/^http/, 'ws')
  : 'ws://localhost:8000';

export const API_URL = API_BASE_URL;
export const WS_URL = WS_BASE_URL;
