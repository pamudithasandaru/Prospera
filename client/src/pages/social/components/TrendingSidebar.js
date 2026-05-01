import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Skeleton,
  Badge,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  Message,
  PersonAdd,
  Notifications,
  Check,
  Close,
  Search,
} from '@mui/icons-material';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const SkeletonRows = ({ count, height }) =>
  Array.from({ length: count }).map((_, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <Skeleton key={i} height={height} sx={{ mb: 0.5 }} />
  ));

const renderSection = (loading, emptyMsg, content) => {
  if (loading) return <SkeletonRows count={3} height={60} />;
  if (!content || content.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        {emptyMsg}
      </Typography>
    );
  }
  return content;
};

const TrendingSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joinedGroups, setJoinedGroups] = useState({});
  // farmerId -> 'none' | 'sent' | 'received' | 'connected'
  const [connectionStatus, setConnectionStatus] = useState({});
  const [groups, setGroups] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [connectingId, setConnectingId] = useState(null);
  const [peopleSearch, setPeopleSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounce = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/social/notifications');
      setNotifications(res.data.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  }, [user]);

  // ── Live full-DB search across all members ────────────────────────────────
  useEffect(() => {
    clearTimeout(searchDebounce.current);
    const q = peopleSearch.trim();
    if (!q) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await api.get('/search', { params: { q, type: 'users' } });
        const found = res.data.data?.users || [];
        // Fetch connection status for each result on-demand
        const newStatuses = {};
        await Promise.allSettled(
          found.map(async (u) => {
            if (connectionStatus[u._id]) {
              newStatuses[u._id] = connectionStatus[u._id];
              return;
            }
            try {
              const r = await api.get(`/social/connection-status/${u._id}`);
              newStatuses[u._id] = r.data.status || 'none';
            } catch {
              newStatuses[u._id] = 'none';
            }
          })
        );
        setConnectionStatus((prev) => ({ ...prev, ...newStatuses }));
        setSearchResults(found);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(searchDebounce.current);
  }, [peopleSearch]); // eslint-disable-line

  useEffect(() => {
    api.get('/social/groups')
      .then((res) => setGroups(res.data.data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoadingGroups(false));

    // ── People You May Know — mutual-connections algorithm ──────────────────
    // Call the /suggestions endpoint which scores & sorts users by shared
    // connections, excludes already-connected and pending-request users,
    // and returns the top 10.
    api.get('/social/suggestions')
      .then(async (res) => {
        const fetchedUsers = res.data.data || [];
        // Fetch connection status for each suggested user
        const statuses = {};
        await Promise.allSettled(
          fetchedUsers.map(async (f) => {
            try {
              const r = await api.get(`/social/connection-status/${f._id}`);
              statuses[f._id] = r.data.status || 'none';
            } catch {
              statuses[f._id] = 'none';
            }
          })
        );
        setConnectionStatus(statuses);
        // Filter out already-connected (double-safety)
        setFarmers(fetchedUsers.filter((f) => statuses[f._id] !== 'connected'));
      })
      .catch(() => setFarmers([]))
      .finally(() => setLoadingFarmers(false));

    api.get('/social/posts')
      .then((res) => {
        const posts = res.data.data || [];
        const counts = {};
        const addCount = (key) => { counts[key] = (counts[key] || 0) + 1; };
        posts.forEach((p) => {
          if (p.category && p.category !== 'general') addCount(p.category);
          (p.tags || []).forEach((tag) => addCount('#' + tag));
        });
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag, count]) => ({
            tag: tag.startsWith('#') ? tag : '#' + tag.replaceAll('-', ''),
            posts: count === 1 ? '1 post' : count + ' posts',
          }));
        setTrendingTopics(sorted);
      })
      .catch(() => setTrendingTopics([]))
      .finally(() => setLoadingTopics(false));

    fetchNotifications();
  }, [fetchNotifications]);

  const toggleJoinGroup = (id) =>
    setJoinedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleConnect = async (farmerId) => {
    setConnectingId(farmerId);
    try {
      await api.post(`/social/connect/${farmerId}`);
      setConnectionStatus((prev) => ({ ...prev, [farmerId]: 'sent' }));
    } catch (err) {
      const msg = err?.response?.data?.message || '';
      if (msg === 'Already connected') {
        // Remove from suggestions if already connected
        setFarmers((prev) => prev.filter((f) => f._id !== farmerId));
      } else if (msg === 'Request already sent') {
        setConnectionStatus((prev) => ({ ...prev, [farmerId]: 'sent' }));
      }
    } finally {
      setConnectingId(null);
    }
  };

  const handleAccept = async (senderId) => {
    try {
      await api.post(`/social/connect/${senderId}/accept`);
      setNotifications((prev) => prev.filter((n) => n.senderId !== senderId));
      // Remove from suggestions since now connected
      setFarmers((prev) => prev.filter((f) => f._id !== senderId));
      setConnectionStatus((prev) => ({ ...prev, [senderId]: 'connected' }));
    } catch (err) {
      console.error('Accept connection error:', err);
    }
  };

  const handleDecline = async (senderId) => {
    try {
      await api.post(`/social/connect/${senderId}/decline`);
      setNotifications((prev) => prev.filter((n) => n.senderId !== senderId));
    } catch (err) {
      console.error('Decline connection error:', err);
    }
  };

  const getConnectLabel = (status, isLoading) => {
    if (isLoading) return 'Sending...';
    switch (status) {
      case 'connected': return 'Connected ✓';
      case 'sent':      return 'Requested';
      case 'received':  return 'Accept Request';
      default:          return 'Connect';
    }
  };

  const getConnectVariant = (status) =>
    status === 'connected' || status === 'received' ? 'contained' : 'outlined';

  const getConnectColor = (status) => {
    if (status === 'connected') return 'success';
    if (status === 'received') return 'primary';
    return 'inherit';
  };

  const formatMembers = (count) => {
    if (count === undefined || count === null) return '';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k members';
    return count + ' members';
  };

  const topicsContent = trendingTopics.length > 0 && (
    <Box display="flex" flexDirection="column" gap={1.5}>
      {trendingTopics.map((item) => (
        <Box
          key={item.tag}
          sx={{
            cursor: 'pointer',
            p: 1,
            borderRadius: 1.5,
            transition: 'all 0.2s',
            '&:hover': { bgcolor: alpha('#4CAF50', 0.08) },
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
  );

  const groupsContent = groups.length > 0 && (
    <Box display="flex" flexDirection="column" gap={2} mt={2}>
      {groups.map((group, index) => (
        <Box key={group._id}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
              {group.image || group.name?.charAt(0)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight="600">{group.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatMembers(group.memberCount)}
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            size="small"
            variant={joinedGroups[group._id] ? 'contained' : 'outlined'}
            color={joinedGroups[group._id] ? 'primary' : 'inherit'}
            onClick={() => toggleJoinGroup(group._id)}
            sx={{ textTransform: 'none', borderRadius: 50, fontWeight: 600 }}
          >
            {joinedGroups[group._id] ? '✓ Joined' : 'Join Group'}
          </Button>
          {index < groups.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}
    </Box>
  );

  const farmersContent = farmers.length > 0 && (
    <Box display="flex" flexDirection="column" gap={2} mt={1}>
      {farmers.map((farmer, index) => {
        const status = connectionStatus[farmer._id] || 'none';
        const isLoading = connectingId === farmer._id;
        const mutualCount = farmer.mutualCount || 0;
        return (
        <Box key={farmer._id}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Avatar
              src={resolveAvatar(farmer)}
              sx={{ width: 42, height: 42 }}
            >
              {farmer.name?.charAt(0)}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography variant="subtitle2" fontWeight="600" noWrap>
                {farmer.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {farmer.role?.charAt(0).toUpperCase()}{farmer.role?.slice(1)}
              </Typography>
              {/* Mutual connections badge */}
              {mutualCount > 0 ? (
                <Tooltip title={`You share ${mutualCount} connection${mutualCount !== 1 ? 's' : ''}`} placement="top">
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '0.68rem',
                      cursor: 'default',
                    }}
                  >
                    👥 {mutualCount} mutual connection{mutualCount !== 1 ? 's' : ''}
                  </Typography>
                </Tooltip>
              ) : (
                farmer.profile?.location?.district && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                    📍 {farmer.profile.location.district}
                  </Typography>
                )
              )}
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              fullWidth
              size="small"
              variant={getConnectVariant(status)}
              color={getConnectColor(status)}
              startIcon={status === 'none' || status === 'received' ? <PersonAdd /> : null}
              onClick={() => {
                if (status === 'received') handleAccept(farmer._id);
                else if (status === 'none') handleConnect(farmer._id);
              }}
              disabled={isLoading || status === 'connected' || status === 'sent'}
              sx={{ textTransform: 'none', borderRadius: 50, fontWeight: 600, fontSize: '0.75rem' }}
            >
              {getConnectLabel(status, isLoading)}
            </Button>
            <IconButton
              size="small"
              sx={{ border: '1px solid', borderColor: 'divider' }}
              onClick={() => navigate(`/messages?user=${farmer._id}`)}
            >
              <Message sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          {index < farmers.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
        );
      })}
    </Box>
  );

  return (
    <>
      {/* Connection Requests Notification Panel */}
      {!loadingNotifs && notifications.length > 0 && (
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, border: '2px solid', borderColor: 'warning.light', bgcolor: alpha('#FF9800', 0.04) }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Badge badgeContent={notifications.length} color="error">
              <Notifications sx={{ color: 'warning.main' }} />
            </Badge>
            <Typography variant="subtitle2" fontWeight="bold">
              Connection Requests
            </Typography>
            <Chip label={notifications.length} size="small" color="warning" sx={{ ml: 'auto' }} />
          </Box>
          <Box display="flex" flexDirection="column" gap={1.5}>
            {notifications.map((notif) => (
              <Box key={notif._id}>
                <Box display="flex" alignItems="center" gap={1.5} mb={0.75}>
                  <Avatar src={notif.senderAvatar} sx={{ width: 36, height: 36 }}>
                    {notif.senderName?.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="caption" fontWeight="600" display="block">
                      {notif.senderName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      wants to connect with you
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<Check />}
                    onClick={() => handleAccept(notif.senderId)}
                    sx={{ textTransform: 'none', borderRadius: 50, fontWeight: 600, fontSize: '0.7rem', flex: 1 }}
                  >
                    Accept
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<Close />}
                    onClick={() => handleDecline(notif.senderId)}
                    sx={{ textTransform: 'none', borderRadius: 50, fontWeight: 600, fontSize: '0.7rem', flex: 1 }}
                  >
                    Decline
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TrendingUp sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight="bold">Trending Topics</Typography>
        </Box>
        {loadingTopics
          ? <SkeletonRows count={4} height={40} />
          : renderSection(false, 'No trending topics yet.', topicsContent)}
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Suggested Groups</Typography>
        {renderSection(loadingGroups, 'No groups available.', groupsContent)}
      </Paper>

      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle1" fontWeight="bold">People You May Know</Typography>
          {!peopleSearch && !loadingFarmers && farmers.length > 0 && (
            <Chip
              label={`${farmers.length} suggestions`}
              size="small" color="primary" variant="outlined"
              sx={{ fontSize: '0.68rem', height: 20 }}
            />
          )}
          {peopleSearch && !searchLoading && (
            <Chip
              label={`${searchResults.length} found`}
              size="small" color="success" variant="outlined"
              sx={{ fontSize: '0.68rem', height: 20 }}
            />
          )}
        </Box>

        {/* Always-visible search box */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search all members..."
          value={peopleSearch}
          onChange={(e) => setPeopleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 16, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: searchLoading ? (
              <InputAdornment position="end">
                <Skeleton variant="circular" width={14} height={14} />
              </InputAdornment>
            ) : null,
          }}
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': { borderRadius: 99, fontSize: '0.82rem' },
          }}
        />

        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          {peopleSearch
            ? `Searching all members for "${peopleSearch}"…`
            : 'Top 5 suggestions — sorted by mutual connections'}
        </Typography>

        {/* Render list */}
        {(() => {
          const isSearchMode = peopleSearch.trim().length > 0;
          const isListLoading = isSearchMode ? searchLoading : loadingFarmers;
          const list = isSearchMode ? searchResults : farmers;

          if (isListLoading) return <SkeletonRows count={3} height={60} />;

          if (isSearchMode && searchResults.length === 0) {
            return (
              <Typography variant="caption" color="text.secondary">
                No members found for "{peopleSearch}"
              </Typography>
            );
          }
          if (!isSearchMode && farmers.length === 0) {
            return (
              <Typography variant="caption" color="text.secondary">
                No suggestions yet. Connect with others!
              </Typography>
            );
          }

          return (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              {list.map((farmer, index) => {
                const status = connectionStatus[farmer._id] || 'none';
                const isLoading = connectingId === farmer._id;
                const mutualCount = farmer.mutualCount || 0;
                return (
                  <Box key={farmer._id}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                      <Avatar
                        src={resolveAvatar(farmer) || undefined}
                        imgProps={{
                          onError: (e) => { e.target.style.display = 'none'; }
                        }}
                        sx={{ width: 42, height: 42 }}
                      >
                        {farmer.name?.charAt(0)}
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="subtitle2" fontWeight="600" noWrap>
                          {farmer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {farmer.role?.charAt(0).toUpperCase()}{farmer.role?.slice(1)}
                        </Typography>
                        {!isSearchMode && mutualCount > 0 ? (
                          <Tooltip
                            title={`You share ${mutualCount} connection${mutualCount !== 1 ? 's' : ''}`}
                            placement="top"
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.68rem', cursor: 'default' }}
                            >
                              👥 {mutualCount} mutual connection{mutualCount !== 1 ? 's' : ''}
                            </Typography>
                          </Tooltip>
                        ) : (
                          farmer.profile?.location?.district && (
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                              📍 {farmer.profile.location.district}
                            </Typography>
                          )
                        )}
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Button
                        fullWidth size="small"
                        variant={getConnectVariant(status)}
                        color={getConnectColor(status)}
                        startIcon={status === 'none' || status === 'received' ? <PersonAdd /> : null}
                        onClick={() => {
                          if (status === 'received') handleAccept(farmer._id);
                          else if (status === 'none') handleConnect(farmer._id);
                        }}
                        disabled={isLoading || status === 'connected' || status === 'sent'}
                        sx={{ textTransform: 'none', borderRadius: 50, fontWeight: 600, fontSize: '0.75rem' }}
                      >
                        {getConnectLabel(status, isLoading)}
                      </Button>
                      <IconButton
                        size="small"
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                        onClick={() => navigate(`/messages?user=${farmer._id}`)}
                      >
                        <Message sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                    {index < list.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                );
              })}
            </Box>
          );
        })()}
      </Paper>
    </>
  );
};

export default TrendingSidebar;
