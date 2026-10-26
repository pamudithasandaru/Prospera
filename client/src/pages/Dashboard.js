import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Terrain,
  ShoppingCart,
  People,
  School,
  TrendingUp,
  Notifications,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Hero3D from '../components/Hero3D';
import { neuColors, neuRaised, neuInset } from '../neumorphic';
import { accessFor, canAccess } from '../config/access';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ acresFarming: 0, activeCrops: 0, coursesCompleted: 0, postsCount: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([api.get('/auth/stats'), api.get('/notifications?limit=5')]).then(([s, n]) => {
      if (cancelled) return;
      if (s.status === 'fulfilled' && s.value.data?.data) setStats(s.value.data.data);
      if (n.status === 'fulfilled' && Array.isArray(n.value.data?.data)) setRecent(n.value.data.data);
    });
    return () => { cancelled = true; };
  }, []);

  // These tiles used to carry their own role lists, which drifted from the
  // router's. Each one is now filtered by the same rule the router applies —
  // see config/access.js.
  const quickActions = [
    { title: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin', color: neuColors.primary },
    { title: 'Farm Management', icon: <Terrain />, path: '/farm', color: neuColors.primary },
    { title: 'Browse Market', icon: <ShoppingCart />, path: '/market', color: neuColors.secondary },
    { title: 'Social Network', icon: <People />, path: '/social', color: neuColors.info },
    { title: 'Learning Hub', icon: <School />, path: '/learning', color: neuColors.warning },
  ];

  const isAdmin = user?.role === 'admin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const filteredActions = quickActions.filter((action) => canAccess(accessFor(action.path), user?.role));

  return (
    <>
      {/* Hero slideshow — outside Container so it matches navbar width
          exactly, the same treatment the landing page gives it, so a signed-in
          member opens on the same view a guest does. Everything below it
          starts off-screen by design; ScrollReveal brings it in on scroll. */}
      <Box sx={{ width: '100%', height: '100vh' }}>
        <Hero3D height="92vh" />
      </Box>

    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: neuColors.text }}>
            {greeting}, {user?.name?.split(' ')[0] || 'there'}
          </Typography>
          <Typography variant="body1" sx={{ color: neuColors.text, opacity: 0.7, mt: 0.5 }}>
            Here's what's happening on your farm today.
          </Typography>
        </Box>

        {/* Quick Actions */}
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {filteredActions.map((action) => (
              <Grid item xs={12} sm={6} md={isAdmin ? 2.4 : 3} key={action.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                ...neuRaised('md'),
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: neuRaised('lg').boxShadow },
                '&:active': { boxShadow: neuInset('md').boxShadow },
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Avatar
              sx={{
                ...neuInset('sm'),
                width: 60,
                height: 60,
                margin: '0 auto',
                color: action.color,
                mb: 2,
              }}
                >
              {action.icon}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
              {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Jump into the latest tools and insights.
                </Typography>
              </CardContent>
            </Card>
              </Grid>
            ))}
          </Grid>

          {/* Stats Overview */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid container spacing={3}>
        {user?.role === 'farmer' && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: neuColors.success }}>
                      {stats.acresFarming}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Acres Farming
                    </Typography>
                  </Box>
                  <Terrain sx={{ fontSize: 40, color: neuColors.success }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: neuColors.primary }}>
                      {stats.activeCrops}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Crops
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, color: neuColors.primary }} />
                </Box>
              </Paper>
            </Grid>
          </>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: neuColors.warning }}>
                  {stats.coursesCompleted}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Courses Completed
                </Typography>
              </Box>
              <School sx={{ fontSize: 40, color: neuColors.warning }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: neuColors.secondary }}>
                  {stats.postsCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Community Posts
                </Typography>
              </Box>
              <People sx={{ fontSize: 40, color: neuColors.secondary }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          Recent Activity
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {recent.length === 0 ? (
            <Box display="flex" alignItems="center" gap={2}>
              <Notifications color="action" />
              <Typography variant="body1" color="text.secondary">
                No recent notifications. Start exploring the platform!
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={1.5}>
              {recent.map((n) => (
                <Box key={n._id} display="flex" alignItems="center" gap={2}>
                  <Notifications color={n.read ? 'action' : 'primary'} />
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    {n.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
    </>
  );
};

export default Dashboard;
