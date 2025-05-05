import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = 'An unexpected error has occurred.';
  let statusCode = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
    statusCode = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Oops!
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {statusCode === 404 ? 'Page not found' : 'Something went wrong'}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {errorMessage}
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/', { replace: true })}
          >
            Go to Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ErrorPage;
