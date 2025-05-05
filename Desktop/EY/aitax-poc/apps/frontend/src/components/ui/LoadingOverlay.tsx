import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { useLoadingStore } from '@/store/loadingStore';

interface LoadingOverlayProps {
  requestId?: string;
  fullScreen?: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  requestId,
  fullScreen = false,
  message = 'Loading...',
}) => {
  const theme = useTheme();
  const isLoading = useLoadingStore((state) => {
    if (requestId) {
      return state.isRequestLoading(requestId);
    }
    return state.isLoading;
  });

  if (!isLoading) {
    return null;
  }

  const overlayStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: theme.zIndex.drawer + 1,
    ...(fullScreen && {
      position: 'fixed',
      zIndex: theme.zIndex.modal + 1,
    }),
  } as const;

  return (
    <Box sx={overlayStyles}>
      <CircularProgress color="primary" size={40} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

// Wrapper component for easy usage with children
interface WithLoadingProps {
  requestId?: string;
  loading?: boolean;
  message?: string;
  children: React.ReactNode;
}

export const WithLoading: React.FC<WithLoadingProps> = ({
  requestId,
  loading,
  message,
  children,
}) => {
  const isLoading = useLoadingStore((state) => {
    if (requestId) {
      return state.isRequestLoading(requestId);
    }
    return loading || false;
  });

  return (
    <Box position="relative">
      {children}
      {isLoading && (
        <LoadingOverlay requestId={requestId} message={message} />
      )}
    </Box>
  );
};
