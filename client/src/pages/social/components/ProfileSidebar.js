import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveAvatar } from '../../../utils/avatarUtils';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import {
  People,
  Article,
  Event,
  Groups,
  Verified,
  Message,
} from '@mui/icons-material';
import api from '../../../services/api';
import { neuInset, neuRaised } from '../../../neumorphic';

const ProfileSidebar = ({ user, onViewProfile }) => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [impressions] = useState(() => 342);

  useEffect(() => {
    api.get('/social/connections')
      .then((res) => setConnections(res.data.data || []))
      .catch(() => setConnections([]));
  }, []);

  // Build a display list of recent connected users (need their names, but connections only store IDs)
  const connectionCount = connections.length;

  return (
    <>
      {/* Profile Card */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 2, 
          overflow: 'hidden',
        }}
      >
        {/* Cover Image */}
        <Box
          onClick={() => navigate('/profile')}
          sx={{
            height: 80,
            ...neuInset('md'),
            borderRadius: 0,
            cursor: 'pointer',
          }}
        />
        
        {/* Profile Info */}
        <Box sx={{ px: 2, pb: 2, mt: -5 }}>
          <Avatar
            src={resolveAvatar(user)}
            onClick={() => navigate('/profile')}
            sx={{ 
              width: 80, 
              height: 80, 
              ...neuRaised('sm'),
              mb: 1,
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          
          <Box 
            display="flex" 
            alignItems="center" 
            gap={0.5} 
            mb={0.5}
            onClick={() => navigate('/profile')}
            sx={{
              cursor: 'pointer',
              width: 'fit-content',
              '&:hover .profile-name': { color: 'primary.main', textDecoration: 'underline' },
            }}
          >
            <Typography variant="h6" fontWeight="bold" className="profile-name" sx={{ fontSize: '1.1rem', transition: 'color 0.2s' }}>
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
            <Box 
              display="flex" 
              justifyContent="space-between" 
              mb={1}
              onClick={() => navigate('/profile?tab=connections')}
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              <Typography variant="caption" color="text.secondary">
                Connections
              </Typography>
              <Typography variant="caption" fontWeight="bold" color="primary">
                {user?.connectionCount ?? connectionCount}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Post Impressions
              </Typography>
              <Typography variant="caption" fontWeight="bold" color="primary">
                {impressions}
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
        }}
      >
        <Button 
          fullWidth 
          variant="text" 
          startIcon={<People />} 
          onClick={() => navigate('/profile?tab=connections')}
          sx={{ 
            justifyContent: 'flex-start', 
            mb: 1,
            color: 'text.primary',
          }}
        >
          My Network
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          startIcon={<Groups />} 
          onClick={() => navigate('/profile?tab=groups')}
          sx={{ 
            justifyContent: 'flex-start', 
            mb: 1,
            color: 'text.primary',
          }}
        >
          My Groups
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          startIcon={<Message />} 
          onClick={() => navigate('/messages')}
          sx={{ 
            justifyContent: 'flex-start', 
            mb: 1,
            color: 'text.primary',
          }}
        >
          Messages
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          startIcon={<Article />} 
          onClick={() => navigate('/learning')}
          sx={{ 
            justifyContent: 'flex-start', 
            mb: 1,
            color: 'text.primary',
          }}
        >
          Knowledge Hub
        </Button>
        <Button 
          fullWidth 
          variant="text" 
          startIcon={<Event />} 
          onClick={() => navigate('/farm/expert')}
          sx={{ 
            justifyContent: 'flex-start',
            color: 'text.primary',
          }}
        >
          Expert Consultations
        </Button>
      </Paper>

      {/* Recent Connections */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2,
        }}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={1}
          onClick={() => navigate('/profile?tab=connections')}
          sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            My Connections
          </Typography>
          <Typography variant="caption" color="primary" fontWeight="bold">
            {connectionCount}
          </Typography>
        </Box>
        {connectionCount === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No connections yet. Connect with farmers!
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={1.5} mt={1.5}>
            {connections.slice(0, 4).map((conn) => {
              const other = conn.otherUser || {};
              return (
                <Box key={conn._id} display="flex" alignItems="center" gap={1.5}>
                  <Avatar 
                    src={resolveAvatar(other)}
                    onClick={() => onViewProfile ? onViewProfile(other) : navigate(`/profile?userId=${other._id}`)}
                    sx={{ width: 34, height: 34, cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' } }}
                  >
                    {other.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Box 
                    flex={1}
                    onClick={() => onViewProfile ? onViewProfile(other) : navigate(`/profile?userId=${other._id}`)}
                    sx={{ cursor: 'pointer', '&:hover .conn-name': { color: 'primary.main', textDecoration: 'underline' } }}
                  >
                    <Typography variant="caption" fontWeight="600" display="block" className="conn-name">
                      {other.name || 'Farmer'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {other.role?.charAt(0)?.toUpperCase()}{other.role?.slice(1) || 'Farmer'}
                      {other.profile?.location?.district ? ` • ${other.profile.location.district}` : ''}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => navigate(`/messages?user=${other._id}`)}>
                    <Message sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </>
  );
};

export default ProfileSidebar;
