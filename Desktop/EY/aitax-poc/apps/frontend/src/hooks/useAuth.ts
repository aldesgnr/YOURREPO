import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { loginUser } from '@/api/auth';

export const useAuth = () => {
  const { token, setToken, clearToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(email, password);
      setToken(response.access_token);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    clearToken();
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
};
