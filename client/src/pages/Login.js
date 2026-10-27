import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  ArrowBack,
  VerifiedUserOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { neuRaised, neuInset } from '../neumorphic';
import { BRAND_NAME, LOGO_SQUARE } from '../brand';
import AgriHeroArt from '../components/auth/AgriHeroArt';
import AgriBackgroundDecor from '../components/auth/AgriBackgroundDecor';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Where to land after signing in. A guest who clicked into a protected page
   * is carried there by RouteGuard's location state; a session that expired
   * mid-request arrives with ?next= from the api.js interceptor. Failing both,
   * the dashboard.
   */
  const redirectTo =
    location.state?.from?.pathname ||
    new URLSearchParams(location.search).get('next') ||
    '/dashboard';

  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        py: { xs: 2.5, md: 4 },
        px: { xs: 2, sm: 3, md: 5 },
        overflow: 'hidden',
        bgcolor: '#e3e8f0',
      }}
    >
      {/* Background Decorative Topography & Floating SVGs */}
      <AgriBackgroundDecor />

      {/* Top Header / Back Navigation Bar */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 1240,
          width: '100%',
          mx: 'auto',
          mb: { xs: 2, md: 3 },
        }}
      >
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBack sx={{ color: '#1B5E20' }} />}
          sx={{
            ...neuRaised('sm'),
            borderRadius: '20px',
            px: 2.2,
            py: 0.8,
            color: '#2b3445',
            fontWeight: 700,
            fontSize: '0.88rem',
            textTransform: 'none',
            transition: 'all 0.25s ease',
            '&:hover': {
              transform: 'translateX(-3px)',
              color: '#1B5E20',
            },
          }}
        >
          Back to Home
        </Button>

        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            py: 0.6,
            px: 2,
            borderRadius: '20px',
            bgcolor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1B5E20', letterSpacing: '0.02em' }}>
            Smart Agri Portal
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area: 2-Column Responsive Layout */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          my: 'auto',
          py: { xs: 1, md: 2 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' },
            gap: { xs: 4, md: 5, lg: 7 },
            alignItems: 'center',
          }}
        >
          {/* Left Column: Agricultural SVG Art & Showcase */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <AgriHeroArt />
          </Box>

          {/* Right Column: High-End Neumorphic Login Card */}
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: 440, md: 450 },
              mx: 'auto',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3.5, sm: 4.5 },
                borderRadius: '28px',
                width: '100%',
                ...neuRaised('lg'),
                border: '1px solid rgba(255, 255, 255, 0.75)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle Decorative Emerald Bar on Top */}
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

              {/* Card Header */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5, mt: 0.5 }}>
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: '22px',
                    ...neuRaised('sm'),
                    bgcolor: '#e3e8f0',
                    mb: 1.8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.04)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={LOGO_SQUARE}
                    alt={BRAND_NAME}
                    sx={{
                      width: { xs: 110, sm: 130 },
                      height: 'auto',
                      borderRadius: '16px',
                      display: 'block',
                    }}
                  />
                </Box>

                <Typography
                  component="h1"
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: '#1B5E20',
                    fontSize: { xs: '1.4rem', sm: '1.6rem' },
                    letterSpacing: '-0.01em',
                  }}
                >
                  Welcome Back
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#5b667a',
                    mt: 0.5,
                    textAlign: 'center',
                    fontSize: '0.88rem',
                  }}
                >
                  Sign in to access your agricultural dashboard
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2.5,
                    borderRadius: '14px',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Sign In Form */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: '#2b3445',
                      mb: 0.5,
                      display: 'block',
                      ml: 0.5,
                    }}
                  >
                    Email Address
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined sx={{ color: '#2E7D32', fontSize: '1.25rem' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        bgcolor: 'rgba(255, 255, 255, 0.45)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.75)',
                        },
                        '&.Mui-focused': {
                          bgcolor: '#ffffff',
                          boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.2)',
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: '#2b3445',
                      mb: 0.5,
                      display: 'block',
                      ml: 0.5,
                    }}
                  >
                    Password
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: '#2E7D32', fontSize: '1.25rem' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label="toggle password visibility"
                            sx={{ color: '#5b667a' }}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '16px',
                        bgcolor: 'rgba(255, 255, 255, 0.45)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.75)',
                        },
                        '&.Mui-focused': {
                          bgcolor: '#ffffff',
                          boxShadow: '0 0 0 3px rgba(46, 125, 50, 0.2)',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Helper Row: Remember Me & Forgot Password */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                    mt: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: '#2E7D32',
                          '&.Mui-checked': {
                            color: '#1B5E20',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: '#5b667a', fontWeight: 600 }}>
                        Remember me
                      </Typography>
                    }
                  />

                  <Tooltip title="Contact your system administrator or support team to reset your password" arrow>
                    <Link
                      component={RouterLink}
                      to="/support"
                      underline="hover"
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#1B5E20',
                        transition: 'color 0.2s ease',
                        '&:hover': { color: '#2E7D32' },
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </Tooltip>
                </Box>

                {/* Sign In CTA Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: '16px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'none',
                    letterSpacing: '0.02em',
                    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                    boxShadow: '0 6px 18px rgba(27, 94, 32, 0.32)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #144919 0%, #226425 100%)',
                      boxShadow: '0 8px 24px rgba(27, 94, 32, 0.42)',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Signing In...</span>
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Divider & Register Option */}
                <Box sx={{ textAlign: 'center', mt: 3.5, pt: 2.5, borderTop: '1px solid rgba(169, 180, 200, 0.35)' }}>
                  <Typography variant="body2" sx={{ color: '#5b667a', mb: 1.5 }}>
                    Don't have an account yet?
                  </Typography>

                  <Button
                    component={RouterLink}
                    to="/register"
                    fullWidth
                    variant="outlined"
                    sx={{
                      py: 1.2,
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      textTransform: 'none',
                      borderColor: 'rgba(46, 125, 50, 0.4)',
                      color: '#1B5E20',
                      bgcolor: 'rgba(255, 255, 255, 0.5)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: '#1B5E20',
                        bgcolor: 'rgba(46, 125, 50, 0.08)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Create New Account
                  </Button>
                </Box>
              </Box>

              {/* Security & SSL Trust Badge */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.8,
                  mt: 3,
                  pt: 2,
                  opacity: 0.85,
                }}
              >
                <VerifiedUserOutlined sx={{ fontSize: '0.95rem', color: '#2E7D32' }} />
                <Typography variant="caption" sx={{ color: '#5b667a', fontSize: '0.72rem', fontWeight: 600 }}>
                  256-bit SSL Encrypted & Protected Platform
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Footer Branding Note */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          mt: { xs: 3, md: 2 },
          maxWidth: 1240,
          width: '100%',
          mx: 'auto',
        }}
      >
        <Typography variant="caption" sx={{ color: '#5b667a', opacity: 0.85, fontSize: '0.78rem' }}>
          © {new Date().getFullYear()} {BRAND_NAME} (Haritha Bhoomi) — Sustainable Agriculture Management Platform
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
