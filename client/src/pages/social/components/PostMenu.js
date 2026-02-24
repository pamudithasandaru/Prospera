import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Bookmark,
  BookmarkBorder,
  ContentCopy,
  Delete,
  Flag,
} from '@mui/icons-material';

const PostMenu = ({ anchorEl, onClose, postId, currentUserId, posts, onDelete }) => {
  const [saved, setSaved] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const post = posts?.find((p) => p._id === postId);
  const isOwner =
    post &&
    currentUserId &&
    (post.author?._id === currentUserId ||
      post.user?._id === currentUserId ||
      post.author === currentUserId ||
      post.user === currentUserId);

  const handleSave = () => {
    setSaved((prev) => !prev);
    setSnackbar({ open: true, message: saved ? 'Post unsaved' : 'Post saved!', severity: 'success' });
    onClose();
  };

  const handleCopyLink = async () => {
    const url = postId
      ? `${window.location.origin}/social?post=${postId}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
    onClose();
  };

  const handleReport = () => {
    setSnackbar({ open: true, message: 'Post reported. Thank you for your feedback.', severity: 'info' });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && postId) onDelete(postId);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { width: 220 },
          },
        }}
      >
        <MenuItem onClick={handleSave}>
          <ListItemIcon>
            {saved ? <Bookmark fontSize="small" color="primary" /> : <BookmarkBorder fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{saved ? 'Unsave Post' : 'Save Post'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <Divider />
        {isOwner && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Post</ListItemText>
          </MenuItem>
        )}
        {!isOwner && (
          <MenuItem onClick={handleReport}>
            <ListItemIcon>
              <Flag fontSize="small" />
            </ListItemIcon>
            <ListItemText>Report Post</ListItemText>
          </MenuItem>
        )}
      </Menu>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PostMenu;
