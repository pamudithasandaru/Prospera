/**
 * CreateStoryDialog.js
 * Dialog to create a new story (text, image URL, or video URL).
 */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  CircularProgress,
  alpha,
} from '@mui/material';
import { Image, VideoLibrary, TextFields } from '@mui/icons-material';
import api from '../../../services/api';

const BG_COLORS = [
  '#1B5E20', '#0D47A1', '#4A148C', '#B71C1C',
  '#E65100', '#004D40', '#1A237E', '#880E4F',
];

const CreateStoryDialog = ({ open, onClose, onCreated, user }) => {
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setMediaUrl('');
    setText('');
    setBgColor(BG_COLORS[0]);
    setError('');
    setMediaType('image');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (mediaType !== 'text' && !mediaUrl.trim()) {
      setError('Please enter a media URL');
      return;
    }
    if (mediaType === 'text' && !text.trim()) {
      setError('Please enter text for your story');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        mediaType,
        mediaUrl: mediaType === 'text' ? `data:text/${text}` : mediaUrl.trim(),
        text: text.trim(),
        backgroundColor: bgColor,
      };
      const res = await api.post('/stories', payload);
      const newStory = res.data.data;
      const group = {
        author: { _id: user?._id, name: user?.name, avatar: user?.profile?.profilePicture || '' },
        stories: [newStory],
      };
      onCreated(group);
      reset();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  // Live preview background
  const previewStyle = mediaType === 'text'
    ? { background: `linear-gradient(135deg, ${bgColor}, #000)` }
    : { bgcolor: 'background.default' };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight="bold">Create Story</DialogTitle>
      <DialogContent>
        {/* Type Selector */}
        <ToggleButtonGroup
          value={mediaType}
          exclusive
          onChange={(_, v) => v && setMediaType(v)}
          size="small"
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="image"><Image sx={{ mr: 0.5 }} />Image</ToggleButton>
          <ToggleButton value="video"><VideoLibrary sx={{ mr: 0.5 }} />Video</ToggleButton>
          <ToggleButton value="text"><TextFields sx={{ mr: 0.5 }} />Text</ToggleButton>
        </ToggleButtonGroup>

        {/* Media URL */}
        {mediaType !== 'text' && (
          <TextField
            label={`${mediaType === 'image' ? 'Image' : 'Video'} URL`}
            fullWidth
            size="small"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://..."
            sx={{ mb: 2 }}
          />
        )}

        {/* Text */}
        <TextField
          label={mediaType === 'text' ? 'Story text' : 'Caption (optional)'}
          fullWidth
          multiline
          rows={3}
          size="small"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          helperText={`${text.length}/500`}
          sx={{ mb: 2 }}
        />

        {/* Background color picker (for text stories) */}
        {mediaType === 'text' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Background Color
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {BG_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setBgColor(c)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: c,
                    cursor: 'pointer',
                    border: bgColor === c ? '3px solid' : '2px solid transparent',
                    borderColor: bgColor === c ? 'primary.main' : 'transparent',
                    transition: 'transform 0.15s',
                    '&:hover': { transform: 'scale(1.15)' },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Preview */}
        {(mediaUrl || text) && (
          <Box
            sx={{
              height: 160,
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...previewStyle,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {mediaType === 'image' && mediaUrl ? (
              <Box component="img" src={mediaUrl} alt="preview" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : mediaType === 'text' && text ? (
              <Typography color="white" fontWeight="bold" textAlign="center" px={2}>
                {text}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">Preview</Typography>
            )}
          </Box>
        )}

        {error && (
          <Typography color="error" variant="caption" display="block" mt={1}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Posting...' : 'Share Story'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateStoryDialog;
