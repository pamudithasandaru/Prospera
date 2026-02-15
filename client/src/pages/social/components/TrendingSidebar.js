import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Divider,
  IconButton,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  Message,
  PersonAdd,
} from '@mui/icons-material';

const TrendingSidebar = () => {
  const trendingTopics = [
    { tag: '#RiceHarvest', posts: '2.5k posts' },
    { tag: '#OrganicFarming', posts: '1.8k posts' },
    { tag: '#PestControl', posts: '956 posts' },
    { tag: '#IrrigationTips', posts: '743 posts' },
    { tag: '#SoilHealth', posts: '623 posts' },
  ];

  const suggestedGroups = [
    { name: 'Rice Farmers LK', members: '12.5k members', image: '🌾' },
    { name: 'Organic Farming', members: '8.3k members', image: '🌱' },
    { name: 'Tea Growers', members: '6.7k members', image: '🍵' },
  ];

  const suggestedFarmers = [
    { name: 'Sunil Bandara', role: 'Rice Farmer', location: 'Anuradhapura' },
    { name: 'Latha Fernando', role: 'Vegetable Farmer', location: 'Nuwara Eliya' },
    { name: 'Rajith Kumar', role: 'Dairy Farmer', location: 'Kurunegala' },
  ];

  return (
    <>
      {/* Trending Topics */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUp sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Trending Topics
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {trendingTopics.map((item) => (
            <Box 
              key={item.tag}
              sx={{
                cursor: 'pointer',
                p: 1,
                borderRadius: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha('#4CAF50', 0.08),
                },
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                {item.tag}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.posts}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Suggested Groups */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Suggested Groups
        </Typography>
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {suggestedGroups.map((group, index) => (
            <Box key={group.name}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                  {group.image}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight="600">
                    {group.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.members}
                  </Typography>
                </Box>
              </Box>
              <Button 
                fullWidth 
                size="small" 
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  borderRadius: 50,
                  fontWeight: 600,
                }}
              >
                Join Group
              </Button>
              {index < suggestedGroups.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Farmer Network */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Connect with Farmers
        </Typography>
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {suggestedFarmers.map((farmer, index) => (
            <Box key={farmer.name}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {farmer.name.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight="600">
                    {farmer.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {farmer.role}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {farmer.location}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <Button 
                  fullWidth 
                  size="small" 
                  variant="outlined"
                  startIcon={<PersonAdd />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 50,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  Connect
                </Button>
                <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <Message sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              {index < suggestedFarmers.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Box>
      </Paper>
    </>
  );
};

export default TrendingSidebar;
