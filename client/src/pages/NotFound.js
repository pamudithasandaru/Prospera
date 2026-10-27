import React from 'react';
import { Container, Typography, Button, Box, Paper, Stack } from '@mui/material';
import { Home, ShoppingCart, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { neuRaised } from '../neumorphic';
import { Agri404Art } from '../components/common/AgriSvgArts';
import AgriBackgroundDecor from '../components/auth/AgriBackgroundDecor';

const NotFound = () => {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const home = isGuest ? '/' : '/dashboard';

  return (
    <Box
      sx={{
        minHeight: '85vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 6 },
        px: 2,
        overflow: 'hidden',
      }}
    >
      {/* Ambient background decor */}
      <AgriBackgroundDecor />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 5 },
            borderRadius: '28px',
            textAlign: 'center',
            ...neuRaised('lg'),
            border: '1px solid rgba(255, 255, 255, 0.75)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Emerald Accent Line */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              background: 'linear-gradient(90deg, #1B5E20 0%, #4CAF50 50%, #F59E0B 100%)',
            }}
          />

          {/* Agricultural 404 Vector Illustration */}
          <Box sx={{ mb: 3 }}>
            <Agri404Art width={320} height={210} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#1B5E20',
              fontSize: { xs: '1.5rem', sm: '1.85rem' },
              mb: 1,
            }}
          >
            Lost in the Fields
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#5b667a',
              maxWidth: 420,
              mx: 'auto',
              mb: 3.5,
              fontSize: '0.95rem',
              lineHeight: 1.5,
            }}
          >
            That path doesn't lead anywhere! The crop or page you're looking for might have been moved, harvested, or doesn't exist.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate(home)}
              sx={{
                py: 1.3,
                px: 3,
                borderRadius: '16px',
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                boxShadow: '0 6px 18px rgba(27, 94, 32, 0.32)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #144919 0%, #226425 100%)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {isGuest ? 'Back to Home' : 'Go to Dashboard'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<ShoppingCart />}
              onClick={() => navigate('/market')}
              sx={{
                py: 1.3,
                px: 2.5,
                borderRadius: '16px',
                fontWeight: 700,
                textTransform: 'none',
                borderColor: 'rgba(46, 125, 50, 0.4)',
                color: '#1B5E20',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: '#1B5E20',
                  bgcolor: 'rgba(46, 125, 50, 0.08)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Browse Market
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;
