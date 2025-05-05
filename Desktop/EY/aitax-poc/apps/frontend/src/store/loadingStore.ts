import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  loadingRequests: Record<string, boolean>;
  startLoading: (requestId: string) => void;
  finishLoading: (requestId: string) => void;
  isRequestLoading: (requestId: string) => boolean;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  isLoading: false,
  loadingRequests: {},
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  startLoading: (requestId: string) => {
    set((state) => ({
      loadingRequests: {
        ...state.loadingRequests,
        [requestId]: true,
      },
      isLoading: true,
    }));
  },
  
  finishLoading: (requestId: string) => {
    set((state) => {
      const newLoadingRequests = { ...state.loadingRequests };
      delete newLoadingRequests[requestId];
      
      return {
        loadingRequests: newLoadingRequests,
        isLoading: Object.keys(newLoadingRequests).length > 0,
      };
    });
  },
  
  isRequestLoading: (requestId: string) => {
    return !!get().loadingRequests[requestId];
  },
}));
