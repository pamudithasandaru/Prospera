import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Divider,
  IconButton,
  Skeleton,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  Message,
  PersonAdd,
} from '@mui/icons-material';
import api from '../../../services/api';

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
  const [joinedGroups, setJoinedGroups] = useState({});
  const [connectedFarmers, setConnectedFarmers] = useState({});
  const [groups, setGroups] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);

  useEffect(() => {
    api.get('/social/groups')
      .then((res) => setGroups(res.data.data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoadingGroups(false));

    api.get('/social/farmers')
      .then((res) => setFarmers(res.data.data || []))
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
  }, []);

  const toggleJoinGroup = (id) =>
    setJoinedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleConnect = (id) =>
    setConnectedFarmers((prev) => ({ ...prev, [id]: !prev[id] }));

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
            {joinedGroups[group._id] ? 'Joined checkmark' : 'Join Group'}
          </Button>
          {index < groups.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}
    </Box>
  );

  const farmersContent = farmers.length > 0 && (
    <Box display="flex" flexDirection="column" gap={2} mt={2}>
      {farmers.map((farmer, index) => (
        <Box key={farmer._id}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Avatar src={farmer.avatar} sx={{ width: 40, height: 40 }}>
              {farmer.name?.charAt(0)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight="600">{farmer.name}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {farmer.role?.charAt(0).toUpperCase()}{farmer.role?.slice(1)}
              </Typography>
              {farmer.profile?.location?.district && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {farmer.profile.location.district}
                </Typography>
              )}
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              fullWidth
              size="small"
              variant={connectedFarmers[farmer._id] ? 'contained' : 'outlined'}
              color={connectedFarmers[farmer._id] ? 'primary' : 'inherit'}
              startIcon={<PersonAdd />}
              onClick={() => toggleConnect(farmer._id)}
              sx={{ textTransform: 'none', borderRadius: 50, fontWeight: 600, fontSize: '0.75rem' }}
            >
              {connectedFarmers[farmer._id] ? 'Connected' : 'Connect'}
            </Button>
            <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <Message sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          {index < farmers.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}
    </Box>
  );

  return (
    <>
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
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Connect with Farmers</Typography>
        {renderSection(loadingFarmers, 'No farmers to suggest yet.', farmersContent)}
      </Paper>
    </>
  );
};

export default TrendingSidebar;
