/**
 * StoriesBar.js
 * Horizontal scrollable row of story avatars, shown above the post feed.
 * Clicking a story group opens StoryViewer.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Paper,
  Skeleton,
} from '@mui/material';
import { Add, ChevronLeft, ChevronRight } from '@mui/icons-material';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import StoryViewer from './StoryViewer';
import CreateStoryDialog from './CreateStoryDialog';
import { resolveAvatar } from '../../../utils/avatarUtils';
import { neuRaised, raised, neuColors } from '../../../neumorphic';
import { MOCK_FARMERS } from '../mockData';

const MOCK_STORY_GROUPS = MOCK_FARMERS.map((f, i) => ({
  author: f,
  stories: [{
    _id: `story_${f._id}`,
    content: { text: ['Just finished planting this season\'s paddy crop! 🌾', 'Cinnamon harvest is on! Amazing aroma this year ☕', 'Field inspection done — crops looking healthy! 🌱', 'New IoT sensors installed across the farm 📱', 'Tea flush season is here! First pick tomorrow ✨'][i] },
    type: 'text',
    createdAt: new Date(Date.now() - i * 3600000 * 2),
    expiresAt: new Date(Date.now() + 86400000),
  }],
  viewed: i > 2,
}));

const STORY_RING = {
  unviewed: 'linear-gradient(135deg, #4CAF50, #1B5E20)',
  viewed: neuColors.dark,
};

const StoriesBar = () => {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewedGroups, setViewedGroups] = useState({});
  const scrollRef = useRef(null);

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories');
      const fetched = res.data.data || [];
      setStoryGroups(fetched.length > 0 ? fetched : MOCK_STORY_GROUPS);
    } catch (err) {
      console.warn('Stories API unavailable, using mock:', err.message);
      setStoryGroups(MOCK_STORY_GROUPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const openViewer = (index) => {
    setViewerGroupIndex(index);
    setViewerOpen(true);
    setViewedGroups((prev) => ({
      ...prev,
      [storyGroups[index]?.author?._id]: true,
    }));
  };

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  };

  const handleStoryCreated = (newGroup) => {
    setStoryGroups((prev) => [newGroup, ...prev]);
    setCreateOpen(false);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        overflow: 'hidden',
        position: 'relative',
        ...neuRaised('md'),
        borderRadius: 3,
      }}
    >
      {/* Scroll Left */}
      <IconButton
        size="small"
        onClick={() => scroll(-1)}
        sx={{
          position: 'absolute',
          left: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          ...neuRaised('xs'),
          '&:hover': { boxShadow: raised('sm') },
          display: storyGroups.length > 5 ? 'flex' : 'none',
        }}
      >
        <ChevronLeft />
      </IconButton>

      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {/* Add Your Story */}
        <Box
          onClick={() => setCreateOpen(true)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            minWidth: 64,
            userSelect: 'none',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'scale(1.05)' },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={resolveAvatar(user)}
              sx={{
                width: 58,
                height: 58,
                ...neuRaised('sm'),
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: raised('md') },
              }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: raised('xs'),
                border: '2px solid white',
              }}
            >
              <Add sx={{ fontSize: 13, color: 'white' }} />
            </Box>
          </Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
            Your Story
          </Typography>
        </Box>

        {/* Story Groups */}
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 60 }}>
                <Skeleton variant="circular" width={58} height={58} />
                <Skeleton width={48} height={12} />
              </Box>
            ))
          : storyGroups.map((group, index) => {
              const isViewed = viewedGroups[group.author?._id];
              return (
                <Box
                  key={group.author?._id}
                  onClick={() => openViewer(index)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    minWidth: 64,
                    userSelect: 'none',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scale(1.06)' },
                  }}
                >
                  <Box
                    sx={{
                      p: '3px',
                      borderRadius: '50%',
                      background: isViewed ? STORY_RING.viewed : STORY_RING.unviewed,
                      boxShadow: isViewed ? 'none' : '0 0 8px rgba(76, 175, 80, 0.45)',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <Avatar
                      src={resolveAvatar(group.author)}
                      sx={{
                        width: 52,
                        height: 52,
                        border: `2px solid ${neuColors.base}`,
                      }}
                    >
                      {group.author?.name?.charAt(0)}
                    </Avatar>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      maxWidth: 64,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {group.author?.name?.split(' ')[0]}
                  </Typography>
                </Box>
              );
            })}
      </Box>

      {/* Scroll Right */}
      <IconButton
        size="small"
        onClick={() => scroll(1)}
        sx={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          ...neuRaised('xs'),
          '&:hover': { boxShadow: raised('sm') },
          display: storyGroups.length > 5 ? 'flex' : 'none',
        }}
      >
        <ChevronRight />
      </IconButton>

      {/* Story Viewer Modal */}
      <StoryViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        storyGroups={storyGroups}
        initialGroupIndex={viewerGroupIndex}
        currentUser={user}
      />

      {/* Create Story Dialog */}
      <CreateStoryDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleStoryCreated}
        user={user}
      />
    </Paper>
  );
};

export default StoriesBar;
