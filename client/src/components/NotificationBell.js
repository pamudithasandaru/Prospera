/**
 * NotificationBell.js
 * Navbar icon with unread badge + dropdown preview.
 */
import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  alpha,
} from '@mui/material';
import { Notifications, DoneAll } from '@mui/icons-material';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import { resolveAvatar } from '../utils/avatarUtils';

const NotificationBell = () => {
  const { notifications, unreadCount, clearUnread, setNotifications } = useSocket();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    clearUnread();
  };

  const handleClose = () => setAnchorEl(null);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const recent = notifications.slice(0, 5);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount || 0} color="error" max={99}>
          <Notifications />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 340, maxHeight: 480, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold" flex={1}>Notifications</Typography>
          <Button size="small" startIcon={<DoneAll sx={{ fontSize: 14 }} />} onClick={markAllRead} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
            Mark all read
          </Button>
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {recent.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
            </Box>
          ) : (
            recent.map((notif) => (
              <React.Fragment key={notif._id}>
                <Box
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start',
                    bgcolor: notif.read ? 'transparent' : alpha('#4CAF50', 0.05),
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha('#000', 0.03) },
                  }}
                >
                  <Avatar src={resolveAvatar(notif)} sx={{ width: 36, height: 36 }}>
                    {notif.senderName?.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="caption" display="block">
                      <strong>{notif.senderName}</strong> {notif.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                    </Typography>
                  </Box>
                  {!notif.read && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.5, flexShrink: 0 }} />
                  )}
                </Box>
                <Divider />
              </React.Fragment>
            ))
          )}
        </Box>

        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            fullWidth
            size="small"
            onClick={() => { handleClose(); navigate('/notifications'); }}
            sx={{ textTransform: 'none' }}
          >
            See all notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
