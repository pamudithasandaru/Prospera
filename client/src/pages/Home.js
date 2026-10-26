import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  ShoppingCart,
  People,
  School,
  Store,
  AccountBalance,
  Cloud,
  ArrowForward,
} from '@mui/icons-material';
import Hero3D from '../components/Hero3D';
import { useAuth } from '../context/AuthContext';
import { BRAND_NAME, brandTextSx } from '../brand';
import { neuColors, neuRaised, neuInteractive } from '../neumorphic';

/**
 * The public landing page.
 *
 * `/` used to redirect straight to /dashboard, which is behind a login — so a
 * signed-out visitor could never land anywhere but the login form. This is
 * where they arrive instead: the modules open to everyone, plus the sign-in
 * call to action.
 *
 * Every tile below links to a route marked PUBLIC in config/access.js. If a
 * route's access changes there, remove its tile here too.
 */
const publicFeatures = [
  {
    title: 'Wholesale Market',
    path: '/market',
    icon: <ShoppingCart />,
    color: neuColors.secondary,
    blurb: 'Live export and domestic produce listings with current asking prices.',
  },
  {
    title: 'Marketplace',
    path: '/marketplace',
    icon: <Store />,
    color: neuColors.primary,
    blurb: 'Seeds, tools and equipment from verified suppliers. Sign in to buy.',
  },
  {
    title: 'Learning Hub',
    path: '/learning',
    icon: <School />,
    color: neuColors.warning,
    blurb: 'Courses from agricultural experts. Browse free, sign in to enrol.',
  },
  {
    title: 'AgriLink Social',
    path: '/social',
    icon: <People />,
    color: neuColors.info,
    blurb: 'What growers across the island are discussing right now.',
  },
  {
    title: 'Government Portal',
    path: '/government',
    icon: <AccountBalance />,
    color: neuColors.success,
    blurb: 'Subsidies, grants and support schemes. Sign in to apply.',
  },
  {
    title: 'Weather',
    path: '/weather',
    icon: <Cloud />,
    color: neuColors.info,
    blurb: 'District-level forecasts and advisories for planning your week.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { isGuest, loading } = useAuth();

  // Signed-in visitors have a richer home already.
  if (!loading && !isGuest) return <Navigate to="/dashboard" replace />;

  return (
    <Box sx={{ bgcolor: neuColors.base }}>
      <Hero3D height="92vh" />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography variant="h4" sx={{ ...brandTextSx, color: neuColors.text }}>
            {BRAND_NAME}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: neuColors.text }}>
            Explore the platform — no account needed
          </Typography>
          <Typography sx={{ color: neuColors.text, opacity: 0.75, maxWidth: 620 }}>
            Browse the market, read the feed and take a look at the courses. Create a
            free account when you want to trade, enrol, post or manage your farm.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {publicFeatures.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.path}>
              <Card
                onClick={() => navigate(feature.path)}
                sx={{
                  ...neuInteractive('md'),
                  cursor: 'pointer',
                  height: '100%',
                  borderRadius: '20px',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      ...neuRaised('sm'),
                      borderRadius: '14px',
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: feature.color,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: neuColors.text, mb: 0.75 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: neuColors.text, opacity: 0.7 }}>
                    {feature.blurb}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: { xs: 5, md: 7 } }}
        >
          <Button
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate('/register')}
            sx={{
              ...neuInteractive('md'),
              borderRadius: '14px',
              px: 4,
              py: 1.5,
              color: neuColors.primary,
              fontWeight: 700,
            }}
          >
            Create a free account
          </Button>
          <Button
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              ...neuInteractive('sm'),
              borderRadius: '14px',
              px: 4,
              py: 1.5,
              color: neuColors.text,
              fontWeight: 600,
            }}
          >
            Sign in
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default Home;
