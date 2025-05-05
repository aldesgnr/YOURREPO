import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useLoadingStore } from '@/store/loadingStore';
import { useToast } from '@/components/ui/Toast';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Generate a unique request ID
const generateRequestId = (config: AxiosRequestConfig): string => {
  const { method, url, params, data } = config;
  return `${method}-${url}-${JSON.stringify(params || {})}-${JSON.stringify(data || {})}`;
};

// Add auth token to requests and track loading state
api.interceptors.request.use((config) => {
  // Add auth token
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Track loading state
  const requestId = generateRequestId(config);
  useLoadingStore.getState().startLoading(requestId);
  
  // Store request ID for response handling
  config.metadata = { requestId };
  
  return config;
});

// Handle response and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful response
    const requestId = response.config.metadata?.requestId;
    if (requestId) {
      useLoadingStore.getState().finishLoading(requestId);
    }
    return response;
  },
  (error: AxiosError) => {
    // Get request ID and finish loading
    const requestId = error.config?.metadata?.requestId;
    if (requestId) {
      useLoadingStore.getState().finishLoading(requestId);
    }
    
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      // Handle 401 Unauthorized errors
      if (status === 401) {
        useAuthStore.getState().clearToken();
        window.location.href = '/login';
      }
      
      // Show error toast for other errors
      const errorMessage = data.detail || 'An error occurred';
      // We can't directly use the hook here, but we'll handle this in components
      // that use the API calls by catching errors
    }
    
    return Promise.reject(error);
  }
);

// Login user and get token
export const loginUser = async (email: string, password: string) => {
  const formData = new FormData();
  formData.append('username', email); // API expects 'username' field
  formData.append('password', password);

  const response = await api.post('/api/auth/token', formData);
  return response.data;
};

// Register new user
export const registerUser = async (email: string, password: string) => {
  const response = await api.post('/api/auth/register', {
    email,
    password,
    is_active: true,
    is_admin: false,
  });
  return response.data;
};

export default api;
