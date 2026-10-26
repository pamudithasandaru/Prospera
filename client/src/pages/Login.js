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
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { neuInset } from '../neumorphic';
import { BRAND_NAME, LOGO_SQUARE } from '../brand';

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
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={0} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box component="img" src={LOGO_SQUARE} alt={BRAND_NAME} sx={{ width: 170, height: 'auto', mb: 1.5, borderRadius: '24px' }} />
            <Typography component="h1" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              {BRAND_NAME}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Agriculture Management Platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
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
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" underline="hover">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3, p: 2, borderRadius: '14px', ...neuInset('sm') }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Test Credentials:
            </Typography>
            <Typography variant="caption" display="block">
              Farmer: sunil@farmer.lk / password123
            </Typography>
            <Typography variant="caption" display="block">
              Expert: nimal@expert.lk / password123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
