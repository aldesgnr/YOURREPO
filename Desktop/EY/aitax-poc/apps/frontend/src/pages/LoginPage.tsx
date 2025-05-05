import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/api/auth';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import { WithLoading } from '@/components/ui/LoadingOverlay';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  // Use our custom hook for API calls
  const { loading, error, execute: login } = useApi<LoginResponse>(
    (data: LoginFormData) => api.post('/api/auth/login', data).then(res => res.data),
    { showErrorToast: true }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await login(formData);
    if (result) {
      setToken(result.access_token);
      showToast('Login successful', 'success');
      navigate('/profile');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <WithLoading loading={loading} message="Logging in...">
          <Paper
            elevation={3}
            sx={{ p: 4, width: '100%', maxWidth: '500px' }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              AI Tax Insights
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Login to your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.response?.data?.detail || 'Failed to login. Please try again.'}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Demo credentials: demo@example.com / password123
                </Typography>
              </Box>
            </Box>
          </Paper>
        </WithLoading>
      </Box>
    </Container>
  );
};

export default LoginPage;
