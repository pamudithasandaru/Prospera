/**
 * NotificationsPage.js
 * Full notifications page with mark-read and delete.
 */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  IconButton,
  Button,
  Divider,
  Chip,
  Skeleton,
  alpha,
} from '@mui/material';
import {
  Favorite,
  ChatBubble,
  PersonAdd,
  Notifications,
  Delete,
  DoneAll,
} from '@mui/icons-material';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { resolveAvatar } from '../../utils/avatarUtils';

const ICON_MAP = {
  like: <Favorite sx={{ fontSize: 16, color: '#e53935' }} />,
  comment: <ChatBubble sx={{ fontSize: 16, color: '#1e88e5' }} />,
  follow: <PersonAdd sx={{ fontSize: 16, color: '#43a047' }} />,
  connection_request: <PersonAdd sx={{ fontSize: 16, color: '#43a047' }} />,
  message: <ChatBubble sx={{ fontSize: 16, color: '#8e24aa' }} />,
  story_view: <Notifications sx={{ fontSize: 16, color: '#fb8c00' }} />,
};

const NotificationsPage = () => {
  const { notifications: rtNotifs, setNotifications: setRtNotifs, clearUnread } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearUnread();
    api.get('/notifications')
      .then((res) => setNotifications(res.data.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  // Merge real-time notifications from socket context (dedup by _id)
  useEffect(() => {
    if (rtNotifs.length > 0) {
      setNotifications((prev) => {
        const ids = new Set(prev.map((n) => n._id));
        const fresh = rtNotifs.filter((n) => !ids.has(n._id));
        return [...fresh, ...prev];
      });
    }
  }, [rtNotifs]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    clearUnread();
  };

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}`).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" fontWeight="bold" flex={1}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} unread`} size="small" color="primary" />
          )}
          <Button
            size="small"
            startIcon={<DoneAll />}
            onClick={markAllRead}
            disabled={unreadCount === 0}
            sx={{ textTransform: 'none' }}
          >
            Mark all read
          </Button>
        </Box>

        {/* List */}
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Skeleton variant="circular" width={44} height={44} />
                <Box flex={1}>
                  <Skeleton width="70%" />
                  <Skeleton width="40%" />
                </Box>
              </Box>
            ))
          : notifications.length === 0
          ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Notifications sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">No notifications yet</Typography>
              </Box>
            )
          : notifications.map((notif) => (
              <React.Fragment key={notif._id}>
                <Box
                  onClick={() => !notif.read && markRead(notif._id)}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: !notif.read ? 'pointer' : 'default',
                    bgcolor: notif.read ? 'transparent' : alpha('#4CAF50', 0.04),
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: alpha('#000', 0.02) },
                  }}
                >
                  {/* Avatar + icon badge */}
                  <Box sx={{ position: 'relative' }}>
                    <Avatar src={resolveAvatar(notif)} sx={{ width: 44, height: 44 }}>
                      {notif.senderName?.charAt(0)}
                    </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {ICON_MAP[notif.type] || <Notifications sx={{ fontSize: 12 }} />}
                    </Box>
                  </Box>

                  <Box flex={1}>
                    <Typography variant="body2">
                      <strong>{notif.senderName}</strong> {notif.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                    </Typography>
                  </Box>

                  {!notif.read && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                  )}

                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}>
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                <Divider />
              </React.Fragment>
            ))}
      </Paper>
    </Container>
  );
};

export default NotificationsPage;
