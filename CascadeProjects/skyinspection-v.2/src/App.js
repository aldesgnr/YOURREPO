import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import '@fontsource/inter';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import AppRoutes from './routes';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
