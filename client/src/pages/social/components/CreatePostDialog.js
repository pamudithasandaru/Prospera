import React from 'react';
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
} from '@mui/material';
import {
  Close,
  Public,
  People,
  Lock,
  Image as ImageIcon,
  Videocam,
  AttachFile,
  EmojiEmotions,
} from '@mui/icons-material';

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
  onCreatePost,
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSelectedImage(ev.target.result);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };
  const postTypes = [
    { value: 'post', label: 'General Post' },
    { value: 'question', label: 'Ask Question' },
    { value: 'success-story', label: 'Success Story' },
    { value: 'alert', label: 'Alert/Warning' },
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'crop-management', label: 'Crop Management' },
    { value: 'livestock', label: 'Livestock' },
    { value: 'technology', label: 'Technology' },
    { value: 'market-news', label: 'Market News' },
    { value: 'weather', label: 'Weather' },
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
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Create Post
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
          <Avatar src={user?.profile?.profilePicture} sx={{ width: 48, height: 48 }}>
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
              sx={{ fontSize: '0.875rem', fontWeight: 500 }}
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
                  Connections
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
              sx={{ fontWeight: 600 }}
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

        {/* Post Content */}
        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="Share your thoughts, experiences, or questions about farming..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              fontSize: '1rem',
            },
          }}
        />

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
              style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'background.paper' },
              }}
              onClick={() => setSelectedImage(null)}
            >
              <Close />
            </IconButton>
          </Box>
        )}

        {/* Media Options */}
        <Box 
          display="flex" 
          gap={1} 
          sx={{ 
            p: 2, 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <IconButton color="primary" component="label">
            <ImageIcon />
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </IconButton>
          <IconButton color="primary">
            <Videocam />
          </IconButton>
          <IconButton color="primary">
            <AttachFile />
          </IconButton>
          <IconButton color="primary">
            <EmojiEmotions />
          </IconButton>
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
          disabled={!newPost.trim()}
          sx={{
            textTransform: 'none',
            px: 3,
            fontWeight: 600,
          }}
        >
          Post
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostDialog;
