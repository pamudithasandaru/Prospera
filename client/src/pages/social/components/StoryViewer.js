/**
 * StoryViewer.js
 * Full-screen modal viewer for stories with animated progress bar,
 * navigation between story groups, and view tracking.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  Box,
  Avatar,
  Typography,
  IconButton,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  Close,
  ChevronLeft,
  ChevronRight,
  Delete,
} from '@mui/icons-material';
import api from '../../../services/api';

const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewer = ({ open, onClose, storyGroups, initialGroupIndex, currentUser }) => {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex || 0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);

  const currentGroup = storyGroups?.[groupIndex];
  const currentStory = currentGroup?.stories?.[storyIndex];

  // ── View tracking ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentStory?._id) {
      api.post(`/stories/${currentStory._id}/view`).catch(() => {});
    }
  }, [currentStory]);

  // ── Auto-advance timer ────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTimeRef.current = Date.now() - elapsedRef.current;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= STORY_DURATION) {
        elapsedRef.current = 0;
        goNext();
      }
    }, 50);
  }, [groupIndex, storyIndex]); // eslint-disable-line

  useEffect(() => {
    if (open && currentStory) {
      elapsedRef.current = 0;
      setProgress(0);
      startTimer();
    }
    return () => clearInterval(intervalRef.current);
  }, [open, groupIndex, storyIndex]); // eslint-disable-line

  const goNext = useCallback(() => {
    const group = storyGroups?.[groupIndex];
    if (!group) return;
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < storyGroups.length - 1) {
      setGroupIndex((g) => g + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [groupIndex, storyIndex, storyGroups, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      setGroupIndex((g) => g - 1);
      setStoryIndex(0);
    }
  }, [groupIndex, storyIndex]);

  useEffect(() => {
    setGroupIndex(initialGroupIndex || 0);
    setStoryIndex(0);
  }, [initialGroupIndex, open]);

  const handlePause = () => {
    setPaused(true);
    elapsedRef.current = Date.now() - startTimeRef.current;
    clearInterval(intervalRef.current);
  };

  const handleResume = () => {
    setPaused(false);
    startTimer();
  };

  const handleDelete = async () => {
    if (!currentStory) return;
    try {
      await api.delete(`/stories/${currentStory._id}`);
      goNext();
    } catch (err) {
      console.error('Delete story error:', err);
    }
  };

  const isOwn = currentStory?.author?._id === currentUser?._id;
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    return `${h}h ago`;
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          m: 0,
        },
      }}
      sx={{ '& .MuiBackdrop-root': { bgcolor: 'rgba(0,0,0,0.9)' } }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: '100vw', sm: 400 },
          height: { xs: '100vh', sm: 700 },
          borderRadius: { sm: 3 },
          overflow: 'hidden',
          bgcolor: currentStory.backgroundColor || '#1B5E20',
        }}
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        {/* Story Media */}
        {currentStory.mediaType === 'image' && (
          <Box
            component="img"
            src={currentStory.mediaUrl}
            alt="Story"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        )}
        {currentStory.mediaType === 'video' && (
          <Box
            component="video"
            src={currentStory.mediaUrl}
            autoPlay
            muted
            playsInline
            sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
          />
        )}
        {currentStory.mediaType === 'text' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              background: `linear-gradient(135deg, ${currentStory.backgroundColor || '#1B5E20'}, #000)`,
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              color="white"
              textAlign="center"
              sx={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)', lineHeight: 1.4 }}
            >
              {currentStory.text}
            </Typography>
          </Box>
        )}

        {/* Dark gradient overlays */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', pointerEvents: 'none' }} />

        {/* Progress Bars */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', gap: 0.5, zIndex: 10 }}>
          {currentGroup.stories.map((s, i) => (
            <Box key={s._id || i} sx={{ flex: 1, height: 3, borderRadius: 99, overflow: 'hidden', bgcolor: alpha('#fff', 0.35) }}>
              <Box
                sx={{
                  height: '100%',
                  bgcolor: 'white',
                  width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%',
                  transition: i === storyIndex ? 'none' : 'width 0.1s',
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Author Header */}
        <Box sx={{ position: 'absolute', top: 24, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 1, zIndex: 10 }}>
          <Avatar src={currentGroup.author.avatar} sx={{ width: 36, height: 36, border: '2px solid white' }}>
            {currentGroup.author.name?.charAt(0)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="caption" fontWeight="bold" color="white" display="block">
              {currentGroup.author.name}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.75), fontSize: '0.65rem' }}>
              {timeAgo(currentStory.createdAt)}
            </Typography>
          </Box>

          {isOwn && (
            <IconButton size="small" onClick={handleDelete} sx={{ color: 'white' }}>
              <Delete sx={{ fontSize: 18 }} />
            </IconButton>
          )}

          <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Story text overlay */}
        {currentStory.text && currentStory.mediaType !== 'text' && (
          <Box sx={{ position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 10 }}>
            <Typography variant="body2" color="white" sx={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              {currentStory.text}
            </Typography>
          </Box>
        )}

        {/* Tap zones for navigation */}
        <Box
          onClick={goPrev}
          sx={{ position: 'absolute', left: 0, top: 0, width: '33%', height: '100%', zIndex: 5, cursor: 'pointer' }}
        />
        <Box
          onClick={goNext}
          sx={{ position: 'absolute', right: 0, top: 0, width: '33%', height: '100%', zIndex: 5, cursor: 'pointer' }}
        />
      </Box>

      {/* Prev / Next Group arrows */}
      {groupIndex > 0 && (
        <IconButton
          onClick={() => { setGroupIndex((g) => g - 1); setStoryIndex(0); }}
          sx={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.15)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
        >
          <ChevronLeft />
        </IconButton>
      )}
      {groupIndex < storyGroups.length - 1 && (
        <IconButton
          onClick={() => { setGroupIndex((g) => g + 1); setStoryIndex(0); }}
          sx={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.15)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
        >
          <ChevronRight />
        </IconButton>
      )}
    </Dialog>
  );
};

export default StoryViewer;
