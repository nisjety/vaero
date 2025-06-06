import axios, { AxiosError } from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    
    if (status === 401) {
      console.error('Unauthorized request');
      // Let the auth middleware handle redirects
      // Do not redirect here to avoid loops
    }
    
    return Promise.reject(error);
  }
);
