import React from 'react';
import { useAuth } from '../context/AuthContext';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Hero3D from '../components/Hero3D';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    { title: 'Farm Management', icon: <Terrain />, path: '/farm', color: '#4caf50', role: 'farmer' },
    { title: 'Browse Market', icon: <ShoppingCart />, path: '/market', color: '#2196f3', role: ['farmer', 'buyer'] },
    { title: 'Social Network', icon: <People />, path: '/social', color: '#9c27b0', role: ['farmer', 'buyer', 'expert'] },
    { title: 'Learning Hub', icon: <School />, path: '/learning', color: '#ff9800', role: ['farmer', 'buyer', 'expert'] },
  ];

  const filteredActions = quickActions.filter(
    (action) => !action.role || (Array.isArray(action.role) ? action.role.includes(user?.role) : action.role === user?.role)
  );

  return (
    <>
      {/* Hero slideshow — outside Container so it matches navbar width exactly */}
      <Box sx={{ width: '100%', height: '100vh', mb: 5 }}>
        <Hero3D height="92vh" />
      </Box>

    <Container maxWidth="lg" sx={{ mb: 6 }}>
        {/* Quick Actions */}
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {filteredActions.map((action) => (
              <Grid item xs={12} sm={6} md={3} key={action.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
                },
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Avatar
              sx={{
                width: 60,
                height: 60,
                margin: '0 auto',
                bgcolor: action.color,
                mb: 2,
                boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)',
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
              <Paper sx={{ p: 3, bgcolor: '#e8f5e9', borderRadius: 3, border: '1px solid rgba(27,94,32,0.12)' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {user?.farmDetails?.farmSize || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Acres Farming
                    </Typography>
                  </Box>
                  <Terrain sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 3, border: '1px solid rgba(13,71,161,0.12)' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {user?.farmDetails?.mainCrops?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Crops
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </Paper>
            </Grid>
          </>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, bgcolor: '#fff3e0', borderRadius: 3, border: '1px solid rgba(237,108,2,0.12)' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {user?.stats?.coursesCompleted || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Courses Completed
                </Typography>
              </Box>
              <School sx={{ fontSize: 40, color: 'warning.main' }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, bgcolor: '#f3e5f5', borderRadius: 3, border: '1px solid rgba(156,39,176,0.12)' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {user?.stats?.postsCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Community Posts
                </Typography>
              </Box>
              <People sx={{ fontSize: 40, color: 'secondary.main' }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          Recent Activity
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Notifications color="action" />
            <Typography variant="body1" color="text.secondary">
              No recent notifications. Start exploring the platform!
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
    </>
  );
};

export default Dashboard;
