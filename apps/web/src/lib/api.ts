// Fixed api.ts - Base API configuration
import axios, { AxiosError } from 'axios';

// Ensure proper API URL construction
const getApiBaseUrl = () => {
  // In browser environment
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  }
  // In server environment
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
};

// Create axios instance with proper base URL
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to log requests (for debugging)
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response from ${response.config.url}: ${response.status}`);
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const baseURL = error.config?.baseURL;
    
    console.error(`API Error: ${status} for ${baseURL}${url}`, {
      status,
      url: `${baseURL}${url}`,
      message: error.message,
      response: error.response?.data
    });

    if (status === 401) {
      console.error('Unauthorized request');
      // Let the auth middleware handle redirects
    }

    if (status === 404) {
      console.error(`Endpoint not found: ${baseURL}${url}`);
    }

    return Promise.reject(error);
  }
);

// Health check function with better error handling
export const checkApiHealth = async () => {
  try {
    const startTime = Date.now();
    console.log('Checking API health at:', api.defaults.baseURL);
    
    const response = await api.get('/health');
    const responseTime = Date.now() - startTime;

    return {
      healthy: response.status === 200,
      status: response.data.status,
      responseTime,
      timestamp: response.data.timestamp,
      services: response.data.services,
      uptime: response.data.uptime,
      version: response.data.version,
      baseURL: api.defaults.baseURL
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      healthy: false,
      error: (error as Error).message,
      responseTime: 0,
      baseURL: api.defaults.baseURL
    };
  }
};