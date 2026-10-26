import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Unknown paths used to redirect to /dashboard, which sent signed-out
 * visitors on to /login — so a typo looked like a session problem. Guests go
 * home, signed-in users go to their dashboard.
 */
const NotFound = () => {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const home = isGuest ? '/' : '/dashboard';

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" color="text.secondary" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          That page doesn't exist, or it has moved.
        </Typography>
        <Button variant="contained" startIcon={<Home />} onClick={() => navigate(home)} sx={{ mt: 2 }}>
          {isGuest ? 'Back to Home' : 'Go to Dashboard'}
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
