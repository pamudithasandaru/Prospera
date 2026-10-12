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
import { neuColors, neuRaised, neuInset } from '../neumorphic';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    { title: 'Farm Management', icon: <Terrain />, path: '/farm', color: neuColors.primary, role: 'farmer' },
    { title: 'Browse Market', icon: <ShoppingCart />, path: '/market', color: neuColors.secondary, role: ['farmer', 'buyer'] },
    { title: 'Social Network', icon: <People />, path: '/social', color: neuColors.info, role: ['farmer', 'buyer', 'expert'] },
    { title: 'Learning Hub', icon: <School />, path: '/learning', color: neuColors.warning, role: ['farmer', 'buyer', 'expert'] },
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
                      {user?.farmDetails?.farmSize || 0}
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
                      {user?.farmDetails?.mainCrops?.length || 0}
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
                  {user?.stats?.coursesCompleted || 0}
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
                  {user?.stats?.postsCount || 0}
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
