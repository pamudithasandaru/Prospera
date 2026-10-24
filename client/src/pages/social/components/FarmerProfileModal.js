import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  Box,
  Avatar,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  LocationOn,
  Message,
  PersonAdd,
  Check,
  Verified,
  OpenInNew,
} from '@mui/icons-material';
import { resolveAvatar } from '../../../utils/avatarUtils';
import { neuRaised, neuInset, raised } from '../../../neumorphic';
import api from '../../../services/api';

const FarmerProfileModal = ({ open, onClose, user, currentUserId }) => {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [connecting, setConnecting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const targetId = user?._id || user?.id;
  const isSelf = currentUserId && targetId && String(currentUserId) === String(targetId);

  useEffect(() => {
    if (!open || !targetId || isSelf) return;

    setLoadingStatus(true);
    api.get(`/social/connection-status/${targetId}`)
      .then((res) => {
        setConnectionStatus(res.data.status || 'none');
      })
      .catch(() => {
        setConnectionStatus('none');
      })
      .finally(() => {
        setLoadingStatus(false);
      });
  }, [open, targetId, isSelf]);

  if (!user) return null;

  const handleConnect = async () => {
    if (!targetId || connecting) return;
    setConnecting(true);
    try {
      if (connectionStatus === 'received') {
        await api.post(`/social/connect/${targetId}/accept`);
        setConnectionStatus('connected');
      } else {
        await api.post(`/social/connect/${targetId}`);
        setConnectionStatus('sent');
      }
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleMessage = () => {
    onClose();
    navigate(`/messages?user=${targetId}`);
  };

  const handleViewFullProfile = () => {
    onClose();
    if (isSelf) {
      navigate('/profile');
    } else {
      navigate(`/profile?userId=${targetId}`);
    }
  };

  const displayName = user.name || 'Community Member';
  const displayRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Farmer';
  const district = user.profile?.location?.district || user.district || '';
  const bio = user.profile?.bio || user.bio || 'Passionate about sustainable farming and sharing agricultural knowledge.';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3.5,
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header Banner */}
      <Box
        sx={{
          height: 90,
          ...neuInset('md'),
          position: 'relative',
        }}
      >
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            ...neuRaised('xs'),
            '&:hover': { boxShadow: raised('sm') },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, pb: 3, px: 3 }}>
        {/* Avatar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: -5, mb: 1.5 }}>
          <Avatar
            src={resolveAvatar(user)}
            sx={{
              width: 82,
              height: 82,
              ...neuRaised('sm'),
              border: '3px solid #e3e8f0',
            }}
          >
            {displayName.charAt(0)}
          </Avatar>

          <Chip
            label={displayRole}
            color="primary"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, height: 24, textTransform: 'capitalize' }}
          />
        </Box>

        {/* User Info */}
        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
          <Typography variant="h6" fontWeight="bold">
            {displayName}
          </Typography>
          {(user.profile?.verificationBadge || user.verificationBadge) && (
            <Verified sx={{ fontSize: 18, color: 'primary.main' }} />
          )}
        </Box>

        {district && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}
          >
            <LocationOn sx={{ fontSize: 14 }} />
            {district}
          </Typography>
        )}

        {/* Bio */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.5,
            ...neuInset('xs'),
            p: 1.5,
            borderRadius: 2,
            fontStyle: 'italic',
          }}
        >
          "{bio}"
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Box display="flex" flexDirection="column" gap={1.2}>
          {!isSelf && (
            <Box display="flex" gap={1}>
              <Button
                fullWidth
                variant={connectionStatus === 'connected' ? 'outlined' : 'contained'}
                color={connectionStatus === 'connected' ? 'success' : 'primary'}
                startIcon={
                  loadingStatus ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : connectionStatus === 'connected' ? (
                    <Check />
                  ) : (
                    <PersonAdd />
                  )
                }
                onClick={handleConnect}
                disabled={connecting || loadingStatus || connectionStatus === 'sent'}
                sx={{ textTransform: 'none', borderRadius: 50, fontWeight: 600 }}
              >
                {connectionStatus === 'connected'
                  ? 'Connected'
                  : connectionStatus === 'sent'
                  ? 'Request Sent'
                  : connectionStatus === 'received'
                  ? 'Accept Request'
                  : 'Connect'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<Message />}
                onClick={handleMessage}
                sx={{ textTransform: 'none', borderRadius: 50, fontWeight: 600, minWidth: 120 }}
              >
                Message
              </Button>
            </Box>
          )}

          <Button
            fullWidth
            variant="text"
            endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
            onClick={handleViewFullProfile}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}
          >
            {isSelf ? 'Go to My Profile' : 'View Full Profile & Posts'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FarmerProfileModal;
