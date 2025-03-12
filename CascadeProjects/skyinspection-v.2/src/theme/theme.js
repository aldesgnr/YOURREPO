import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#2d5bff',
    },
    secondary: {
      main: '#6c63ff',
    },
    background: {
      default: mode === 'light' ? '#f8f9fa' : '#1a1a1a',
      paper: mode === 'light' ? '#ffffff' : '#242424',
    },
  },
  typography: {
    fontFamily: '"Inter Variable", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            : '0 4px 6px -1px rgb(255 255 255 / 0.1), 0 2px 4px -2px rgb(255 255 255 / 0.1)',
        },
      },
    },
  },
});
