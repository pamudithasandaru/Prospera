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
  People,
  Article,
  Event,
  Groups,
  Verified,
  Message,
} from '@mui/icons-material';

const ProfileSidebar = ({ user }) => {
  return (
    <>
      {/* Profile Card */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 2, 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Cover Image */}
        <Box
          sx={{
            height: 80,
            background: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)',
          }}
        />
        
        {/* Profile Info */}
        <Box sx={{ px: 2, pb: 2, mt: -5 }}>
          <Avatar
            src={user?.profile?.profilePicture}
            sx={{ 
              width: 80, 
              height: 80, 
              border: '4px solid white',
              mb: 1,
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          
          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
              {user?.name}
            </Typography>
            {user?.profile?.verificationBadge && (
              <Verified sx={{ fontSize: 18, color: 'primary.main' }} />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {user?.role === 'farmer' ? 'Farmer' : user?.role}
            {user?.profile?.location?.district && ` • ${user.profile.location.district}`}
          </Typography>
          
          {user?.profile?.bio && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {user.profile.bio}
            </Typography>
          )}
          
          <Divider sx={{ my: 1.5 }} />
          
          {/* Profile Stats */}
          <Box sx={{ py: 1 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="caption" color="text.secondary">
                Profile Viewers
              </Typography>
              <Typography variant="caption" fontWeight="bold" color="primary">
                {Math.floor(Math.random() * 100) + 20}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Post Impressions
              </Typography>
              <Typography variant="caption" fontWeight="bold" color="primary">
                {Math.floor(Math.random() * 500) + 100}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Quick Links */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button 
          fullWidth 
          variant="text" 
          startIcon={<People />} 
          sx={{ 
            justifyContent: 'flex-start', 
            mb: 1,
            color: 'text.primary',
            '&:hover': { bgcolor: alpha('#4CAF50', 0.08) }
          }}
        >
          My Network
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          startIcon={<Groups />} 
          sx={{ 
            justifyContent: 'flex-start', 
            mb: 1,
            color: 'text.primary',
            '&:hover': { bgcolor: alpha('#4CAF50', 0.08) }
          }}
        >
          My Groups
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          startIcon={<Article />} 
          sx={{ 
            justifyContent: 'flex-start', 
            mb: 1,
            color: 'text.primary',
            '&:hover': { bgcolor: alpha('#4CAF50', 0.08) }
          }}
        >
          Knowledge Hub
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          startIcon={<Event />} 
          sx={{ 
            justifyContent: 'flex-start',
            color: 'text.primary',
            '&:hover': { bgcolor: alpha('#4CAF50', 0.08) }
          }}
        >
          Expert Sessions
        </Button>
      </Paper>

      {/* Recent Connections */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Recent Connections
        </Typography>
        <Box display="flex" flexDirection="column" gap={1.5} mt={1.5}>
          {['Pradeep Silva', 'Nimal Perera', 'Kamala Jayasinghe'].map((name, idx) => (
            <Box key={`connection-${name}`} display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {name.charAt(0)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="caption" fontWeight="600" display="block">
                  {name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Farmer
                </Typography>
              </Box>
              <IconButton size="small">
                <Message sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Paper>
    </>
  );
};

export default ProfileSidebar;
