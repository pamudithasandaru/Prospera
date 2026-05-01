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
  alpha,
} from '@mui/material';
import { Add, ChevronLeft, ChevronRight } from '@mui/icons-material';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import StoryViewer from './StoryViewer';
import CreateStoryDialog from './CreateStoryDialog';
import { resolveAvatar } from '../../../utils/avatarUtils';

const STORY_RING = {
  unviewed: 'linear-gradient(135deg, #4CAF50, #1B5E20)',
  viewed: 'linear-gradient(135deg, #bdbdbd, #9e9e9e)',
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
      setStoryGroups(res.data.data || []);
    } catch (err) {
      console.error('Stories fetch error:', err);
      setStoryGroups([]);
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
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        position: 'relative',
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
          bgcolor: 'background.paper',
          boxShadow: 2,
          '&:hover': { bgcolor: 'background.paper' },
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
            minWidth: 60,
            userSelect: 'none',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={resolveAvatar(user)}
              sx={{
                width: 56,
                height: 56,
                border: '2px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
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
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
              }}
            >
              <Add sx={{ fontSize: 12, color: 'white' }} />
            </Box>
          </Box>
          <Typography variant="caption" sx={{ fontSize: '0.65rem', textAlign: 'center', lineHeight: 1.2 }}>
            Add Story
          </Typography>
        </Box>

        {/* Story Groups */}
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 60 }}>
                <Skeleton variant="circular" width={56} height={56} />
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
                    minWidth: 60,
                    userSelect: 'none',
                  }}
                >
                  <Box
                    sx={{
                      p: '2px',
                      borderRadius: '50%',
                      background: isViewed ? STORY_RING.viewed : STORY_RING.unviewed,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  >
                    <Avatar
                      src={resolveAvatar(group.author)}
                      sx={{
                        width: 52,
                        height: 52,
                        border: '2px solid white',
                      }}
                    >
                      {group.author?.name?.charAt(0)}
                    </Avatar>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      maxWidth: 60,
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
          bgcolor: 'background.paper',
          boxShadow: 2,
          '&:hover': { bgcolor: 'background.paper' },
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
