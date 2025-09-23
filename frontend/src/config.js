// API Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:5000',
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || '', // Use relative path for same domain or env variable
  }
};

const environment = process.env.NODE_ENV || 'development';

export const API_CONFIG = config[environment];

// Helper function to get full API endpoint
export const getApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.apiUrl;
  return `${baseUrl}${endpoint}`;
};

export default API_CONFIG;
