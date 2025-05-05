import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { useToast } from '@/components/ui/Toast';

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export function useApi<T, E = unknown>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { showToast } = useToast();
  
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
  } = options;

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiCall(...args);
        setData(result);
        
        if (showSuccessToast) {
          showToast(successMessage, 'success');
        }
        
        return result;
      } catch (err) {
        const axiosError = err as AxiosError<any>;
        setError(axiosError as any);
        
        if (showErrorToast) {
          const errorMessage = 
            axiosError.response?.data?.detail || 
            axiosError.message || 
            'An error occurred';
          
          showToast(errorMessage, 'error');
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, showSuccessToast, showErrorToast, successMessage, showToast]
  );

  return {
    data,
    error,
    loading,
    execute,
    setData,
    reset: useCallback(() => {
      setData(null);
      setError(null);
      setLoading(false);
    }, []),
  };
}
