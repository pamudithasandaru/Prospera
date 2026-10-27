import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  EmailOutlined,
  PhoneOutlined,
  LockOutlined,
  ArrowBack,
  VerifiedUserOutlined,
  BadgeOutlined,
  TranslateOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { neuRaised } from '../neumorphic';
import { BRAND_NAME, LOGO_SQUARE } from '../brand';
import AgriHeroArt from '../components/auth/AgriHeroArt';
import AgriBackgroundDecor from '../components/auth/AgriBackgroundDecor';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    language: 'EN',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both passwords.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information and try again.');
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
      {/* Background Decorative Topography & Floating Botanical SVGs */}
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
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
            gap: { xs: 4, md: 5, lg: 6 },
            alignItems: 'center',
          }}
        >
          {/* Left Column: Agricultural Art & Showcase */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <AgriHeroArt
              badge="Join Our Agricultural Community"
              title="Grow, Trade & Prosper with Sri Lanka's Smart Farming Network"
              subtitle="Create your account to get free AI crop disease diagnosis, direct trade with certified buyers, real-time market price discovery, and agronomy expert consultations."
            />
          </Box>

          {/* Right Column: High-End Neumorphic Signup Card */}
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: 480, md: 540 },
              mx: 'auto',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, mt: 0.5 }}>
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: '20px',
                    ...neuRaised('sm'),
                    bgcolor: '#e3e8f0',
                    mb: 1.5,
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
                      width: { xs: 100, sm: 115 },
                      height: 'auto',
                      borderRadius: '14px',
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
                    fontSize: { xs: '1.35rem', sm: '1.55rem' },
                    letterSpacing: '-0.01em',
                  }}
                >
                  Create an Account
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#5b667a',
                    mt: 0.4,
                    textAlign: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  Join thousands of farmers, buyers & agronomy experts
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

              {/* Signup Form */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={1.8}>
                  {/* Full Name */}
                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: '#2b3445', mb: 0.4, display: 'block', ml: 0.5 }}
                    >
                      Full Name
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      id="name"
                      name="name"
                      placeholder="e.g. Sarath Gunawardena"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutline sx={{ color: '#2E7D32', fontSize: '1.25rem' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                  {/* Email Address */}
                  <Grid item xs={12} sm={7}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: '#2b3445', mb: 0.4, display: 'block', ml: 0.5 }}
                    >
                      Email Address
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      name="email"
                      type="email"
                      placeholder="sarath@example.com"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined sx={{ color: '#2E7D32', fontSize: '1.25rem' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                  {/* Phone Number */}
                  <Grid item xs={12} sm={5}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: '#2b3445', mb: 0.4, display: 'block', ml: 0.5 }}
                    >
                      Phone Number
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      id="phone"
                      name="phone"
                      placeholder="+94 77 123 4567"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneOutlined sx={{ color: '#2E7D32', fontSize: '1.25rem' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                  {/* Primary Role */}
                  <Grid item xs={12} sm={7}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: '#2b3445', mb: 0.4, display: 'block', ml: 0.5 }}
                    >
                      Primary Role
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeOutlined sx={{ color: '#2E7D32', fontSize: '1.25rem' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    >
                      <MenuItem value="farmer">🌾 Farmer / Cultivator</MenuItem>
                      <MenuItem value="buyer">🛒 Market Buyer / Wholesaler</MenuItem>
                      <MenuItem value="expert">🔬 Agricultural Expert / Agronomist</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Preferred Language */}
                  <Grid item xs={12} sm={5}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: '#2b3445', mb: 0.4, display: 'block', ml: 0.5 }}
                    >
                      Language
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      select
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TranslateOutlined sx={{ color: '#2E7D32', fontSize: '1.25rem' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    >
                      <MenuItem value="EN">English</MenuItem>
                      <MenuItem value="SI">සිංහල (Sinhala)</MenuItem>
                      <MenuItem value="TA">தமிழ் (Tamil)</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Password */}
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: '#2b3445', mb: 0.4, display: 'block', ml: 0.5 }}
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
                      autoComplete="new-password"
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
                              size="small"
                              sx={{ color: '#5b667a' }}
                            >
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                  </Grid>

                  {/* Confirm Password */}
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: '#2b3445', mb: 0.4, display: 'block', ml: 0.5 }}
                    >
                      Confirm Password
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      placeholder="••••••••"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
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
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              aria-label="toggle confirm password visibility"
                              size="small"
                              sx={{ color: '#5b667a' }}
                            >
                              {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                  </Grid>
                </Grid>

                {/* Terms Note */}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: '#5b667a',
                    mt: 2,
                    mb: 2.5,
                    fontSize: '0.74rem',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  By registering, you agree to our Terms of Service and Privacy Policy for secure agricultural trading.
                </Typography>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.4,
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
                      <span>Creating Account...</span>
                    </Box>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                {/* Divider & Sign In Option */}
                <Box sx={{ textAlign: 'center', mt: 3, pt: 2.2, borderTop: '1px solid rgba(169, 180, 200, 0.35)' }}>
                  <Typography variant="body2" sx={{ color: '#5b667a', mb: 1.5 }}>
                    Already have an account?
                  </Typography>

                  <Button
                    component={RouterLink}
                    to="/login"
                    fullWidth
                    variant="outlined"
                    sx={{
                      py: 1.1,
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
                    Sign In to Existing Account
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
                  mt: 2.5,
                  pt: 1.5,
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

// Reusable styling tokens for text fields matching the neumorphic surface
const inputStyles = {
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
};

export default Register;
