import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Avatar,
  IconButton,
  TextField,
  Button,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Collapse,
} from '@mui/material';
import {
  Close,
  Public,
  People,
  Lock,
  Image as ImageIcon,
  Videocam,
  EmojiEmotions,
  LocalOffer,
  Add,
} from '@mui/icons-material';
import { resolveAvatar } from '../../../utils/avatarUtils';
import { neuRaised, neuInset, raised } from '../../../neumorphic';

const AGRI_EMOJIS = ['🌾', '🌽', '🍅', '🥔', '🌱', '🚜', '☀️', '🌧️', '🐛', '💡', '👏', '❤️'];

const CreatePostDialog = ({ 
  open, 
  onClose, 
  user,
  postType,
  setPostType,
  postCategory,
  setPostCategory,
  postVisibility,
  setPostVisibility,
  newPost,
  setNewPost,
  selectedImage,
  setSelectedImage,
  postTags = [],
  setPostTags,
  articleTitle = '',
  setArticleTitle,
  onCreatePost,
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInputText, setTagInputText] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSelectedImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddTag = () => {
    const clean = tagInputText.trim().replace(/^#/, '').toLowerCase();
    if (!clean) return;
    if (setPostTags && !postTags.includes(clean)) {
      setPostTags([...postTags, clean]);
    }
    setTagInputText('');
  };

  const handleRemoveTag = (tagToRemove) => {
    if (setPostTags) {
      setPostTags(postTags.filter((t) => t !== tagToRemove));
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewPost((prev) => (prev ? `${prev} ${emoji}` : emoji));
  };

  const postTypes = [
    { value: 'post', label: 'General Post' },
    { value: 'question', label: 'Ask Question' },
    { value: 'success-story', label: 'Success Story' },
    { value: 'article', label: 'Agri Article' },
    { value: 'alert', label: 'Alert / Advisory' },
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'crop-management', label: 'Crop Management' },
    { value: 'livestock', label: 'Livestock & Dairy' },
    { value: 'technology', label: 'Agri-Tech & Drones' },
    { value: 'market-news', label: 'Market Prices & News' },
    { value: 'weather', label: 'Weather & Climate' },
    { value: 'organic', label: 'Organic Farming' },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3.5,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {postType === 'article'
              ? 'Publish Knowledge Article'
              : postType === 'question'
              ? 'Ask the Farming Community'
              : postType === 'success-story'
              ? 'Share a Success Story'
              : 'Create Post'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 2 }}>
        {/* Author Info */}
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Avatar src={resolveAvatar(user)} sx={{ width: 48, height: 48 }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {user?.name}
            </Typography>
            <Select
              value={postVisibility}
              onChange={(e) => setPostVisibility(e.target.value)}
              size="small"
              variant="standard"
              disableUnderline
              sx={{ fontSize: '0.85rem', fontWeight: 500 }}
            >
              <MenuItem value="public">
                <Box display="flex" alignItems="center" gap={1}>
                  <Public sx={{ fontSize: 16 }} />
                  Public
                </Box>
              </MenuItem>
              <MenuItem value="connections">
                <Box display="flex" alignItems="center" gap={1}>
                  <People sx={{ fontSize: 16 }} />
                  My Network
                </Box>
              </MenuItem>
              <MenuItem value="private">
                <Box display="flex" alignItems="center" gap={1}>
                  <Lock sx={{ fontSize: 16 }} />
                  Only Me
                </Box>
              </MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Post Type Selection */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          {postTypes.map((type) => (
            <Chip
              key={type.value}
              label={type.label}
              onClick={() => setPostType(type.value)}
              color={postType === type.value ? 'primary' : 'default'}
              variant={postType === type.value ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, fontSize: '0.78rem' }}
            />
          ))}
        </Box>

        {/* Category Selection */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={postCategory}
            onChange={(e) => setPostCategory(e.target.value)}
            label="Category"
          >
            {categories.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Article Title Field (Shown when in article mode) */}
        {postType === 'article' && (
          <TextField
            fullWidth
            size="small"
            placeholder="Article Headline / Title..."
            value={articleTitle}
            onChange={(e) => setArticleTitle && setArticleTitle(e.target.value)}
            variant="outlined"
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { fontWeight: 600 } }}
          />
        )}

        {/* Post Content */}
        <TextField
          fullWidth
          multiline
          rows={postType === 'article' ? 7 : 5}
          placeholder={
            postType === 'question'
              ? 'What farming challenge or crop advice do you need help with? Describe your issue...'
              : postType === 'success-story'
              ? 'Share your milestone, harvest yield, or sustainable farming achievement!'
              : postType === 'article'
              ? 'Write comprehensive farming insights, soil preparation steps, or guide details...'
              : 'Share your thoughts, harvest updates, or farming advice...'
          }
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          variant="outlined"
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              fontSize: '0.95rem',
            },
          }}
        />

        {/* Quick Emoji Bar */}
        <Collapse in={showEmojis}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              p: 1.2,
              mb: 1.5,
              borderRadius: 2,
              ...neuInset('xs'),
            }}
          >
            {AGRI_EMOJIS.map((emoji) => (
              <Box
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                sx={{
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: 1,
                  userSelect: 'none',
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'scale(1.25)' },
                }}
              >
                {emoji}
              </Box>
            ))}
          </Box>
        </Collapse>

        {/* Video Link Input */}
        <Collapse in={showVideoInput}>
          <Box display="flex" gap={1} mb={1.5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Paste YouTube or video link (optional)..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              variant="outlined"
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                if (videoUrl.trim()) {
                  setNewPost((prev) => (prev ? `${prev}\n\n🎥 Video: ${videoUrl.trim()}` : `🎥 Video: ${videoUrl.trim()}`));
                  setVideoUrl('');
                  setShowVideoInput(false);
                }
              }}
            >
              Add
            </Button>
          </Box>
        </Collapse>

        {/* Tag Input and Active Tags */}
        <Box mb={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              Tags:
            </Typography>
            <Button
              size="small"
              startIcon={<LocalOffer sx={{ fontSize: 14 }} />}
              onClick={() => setShowTagInput((prev) => !prev)}
              sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0 }}
            >
              {showTagInput ? 'Close' : '+ Add Hashtags'}
            </Button>
          </Box>

          <Collapse in={showTagInput}>
            <Box display="flex" gap={1} mb={1}>
              <TextField
                size="small"
                fullWidth
                placeholder="Type tag (e.g. harvest, organic)..."
                value={tagInputText}
                onChange={(e) => setTagInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">#</InputAdornment>,
                }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddTag}
                startIcon={<Add />}
                sx={{ textTransform: 'none' }}
              >
                Add
              </Button>
            </Box>
          </Collapse>

          {postTags.length > 0 && (
            <Box display="flex" gap={0.8} flexWrap="wrap" mt={0.5}>
              {postTags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{ borderRadius: 1.5, fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Image Preview */}
        {selectedImage && (
          <Box 
            sx={{ 
              position: 'relative', 
              mb: 2,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <img
              src={selectedImage}
              alt="Preview"
              style={{ width: '100%', maxHeight: 260, objectFit: 'cover' }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                ...neuRaised('xs'),
                '&:hover': { boxShadow: raised('sm') },
              }}
              onClick={() => setSelectedImage(null)}
            >
              <Close />
            </IconButton>
          </Box>
        )}

        {/* Media Toolbar */}
        <Box 
          display="flex" 
          alignItems="center"
          justifyContent="space-between"
          sx={{ 
            p: 1.5, 
            ...neuInset('sm'),
            borderRadius: 2,
          }}
        >
          <Box display="flex" gap={1}>
            <IconButton color="primary" component="label" title="Add Image">
              <ImageIcon />
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </IconButton>
            <IconButton 
              color={showVideoInput ? 'secondary' : 'primary'} 
              onClick={() => setShowVideoInput((prev) => !prev)}
              title="Add Video Link"
            >
              <Videocam />
            </IconButton>
            <IconButton 
              color={showEmojis ? 'secondary' : 'primary'} 
              onClick={() => setShowEmojis((prev) => !prev)}
              title="Quick Emojis"
            >
              <EmojiEmotions />
            </IconButton>
            <IconButton 
              color={showTagInput ? 'secondary' : 'primary'} 
              onClick={() => setShowTagInput((prev) => !prev)}
              title="Add Hashtags"
            >
              <LocalOffer />
            </IconButton>
          </Box>

          <Typography variant="caption" color="text.secondary">
            {newPost.length} chars
          </Typography>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onCreatePost}
          disabled={!newPost.trim() && !selectedImage}
          sx={{
            textTransform: 'none',
            px: 3,
            fontWeight: 600,
          }}
        >
          {postType === 'article' ? 'Publish Article' : 'Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostDialog;
