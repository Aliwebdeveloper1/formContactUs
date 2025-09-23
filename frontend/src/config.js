// API Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:5000',
  },
  production: {
    // Use environment variable or fallback to localStorage-only mode
    apiUrl: process.env.REACT_APP_API_URL || null,
  }
};

const environment = process.env.NODE_ENV || 'development';

export const API_CONFIG = config[environment];

// Helper function to get full API endpoint
export const getApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.apiUrl;
  if (!baseUrl) return null; // No API available, use localStorage fallback
  return `${baseUrl}${endpoint}`;
};

export default API_CONFIG;
