import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Default backend API URL. Can be adjusted in Settings (e.g., http://localhost:8080)
const API_BASE_KEY = 'fortress_api_base_url';
export const getApiBaseUrl = (): string => {
  return localStorage.getItem(API_BASE_KEY) || 'http://localhost:8080';
};

export const setApiBaseUrl = (url: string) => {
  localStorage.setItem(API_BASE_KEY, url);
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer JWT token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expiration
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('fortress:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
