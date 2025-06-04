import React from 'react';
import axios, { AxiosError } from 'axios';
import { useAuth } from '@clerk/nextjs';

// Create axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API hook for authenticated requests
export const useApi = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Configure request interceptor to add auth token
  React.useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        if (isLoaded && isSignedIn) {
          try {
            const token = await getToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Failed to get auth token:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken, isLoaded, isSignedIn]);

  return api;
};

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    
    if (status === 401) {
      // Handle unauthorized - redirect to sign in
      console.error('Unauthorized request');
    } else if (status === 403) {
      // Handle forbidden
      console.error('Forbidden request');
    } else if (status && status >= 500) {
      // Handle server errors
      console.error('Server error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API utility functions
export const apiUtils = {
  get: (url: string, params?: any) => api.get(url, { params }),
  post: (url: string, data?: any) => api.post(url, data),
  put: (url: string, data?: any) => api.put(url, data),
  delete: (url: string) => api.delete(url),
  patch: (url: string, data?: any) => api.patch(url, data),
};

export default api;
