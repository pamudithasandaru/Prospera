import React from 'react';
import { Container, Typography, Button, Box, Paper, Stack } from '@mui/material';
import { Home, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { neuRaised } from '../neumorphic';
import { Agri403Art } from '../components/common/AgriSvgArts';
import AgriBackgroundDecor from '../components/auth/AgriBackgroundDecor';

const Unauthorized = () => {
  const navigate = useNavigate();

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
          {/* Top Gold/Emerald Accent Line */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              background: 'linear-gradient(90deg, #F59E0B 0%, #1B5E20 50%, #2E7D32 100%)',
            }}
          />

          {/* Agricultural 403 Vector Illustration */}
          <Box sx={{ mb: 3 }}>
            <Agri403Art width={320} height={210} />
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
            Restricted Farm Territory
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
            This section requires specific agricultural role credentials (such as Agronomy Expert or Admin access) that are not associated with your current account.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate('/dashboard')}
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
              Go to Dashboard
            </Button>

            <Button
              variant="outlined"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
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
              Switch Account
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Unauthorized;
