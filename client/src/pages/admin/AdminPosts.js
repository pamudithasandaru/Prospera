import React, { useCallback, useEffect, useState } from 'react';
import {
  Paper, Box, TextField, Avatar, IconButton, Tooltip, Pagination, Typography, Alert, Snackbar, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, Button, InputAdornment, LinearProgress,
  Chip, Divider,
} from '@mui/material';
import { Delete, Search, ThumbUp, ChatBubble, Image as ImageIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/posts', { params: { page, limit: 10, search: debounced } });
      setPosts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page, debounced]);

  useEffect(() => { load(); }, [load]);

  const removePost = async () => {
    const p = confirm;
    setConfirm(null);
    try {
      await api.delete(`/admin/posts/${p._id}`);
      setToast({ open: true, message: 'Post removed', severity: 'success' });
      load();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.message || 'Failed to remove post', severity: 'error' });
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <TextField
        size="small"
        fullWidth
        placeholder="Search post text or author…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <LinearProgress sx={{ mb: 1 }} />}

      {posts.map((p, i) => (
        <React.Fragment key={p._id}>
          {i > 0 && <Divider sx={{ my: 1.5 }} />}
          <Box display="flex" gap={2} alignItems="flex-start">
            <Avatar src={p.author.avatar} alt={p.author.name}>{p.author.name?.[0]}</Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" fontWeight={700}>{p.author.name}</Typography>
                <Chip size="small" label={p.author.role} sx={{ textTransform: 'capitalize' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {p.text || <em>(no text)</em>}
              </Typography>
              <Box display="flex" gap={2} mt={1} color="text.secondary" alignItems="center">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ThumbUp sx={{ fontSize: 14 }} /><Typography variant="caption">{p.likesCount}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ChatBubble sx={{ fontSize: 14 }} /><Typography variant="caption">{p.commentsCount}</Typography>
                </Box>
                {p.images.length > 0 && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ImageIcon sx={{ fontSize: 14 }} /><Typography variant="caption">{p.images.length}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
            <Tooltip title="Remove post">
              <IconButton color="error" onClick={() => setConfirm(p)}><Delete /></IconButton>
            </Tooltip>
          </Box>
        </React.Fragment>
      ))}

      {!loading && posts.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 3 }}>No posts found</Typography>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} flexWrap="wrap" gap={1}>
        <Typography variant="caption" color="text.secondary">{pagination.total} posts</Typography>
        <Pagination count={pagination.pages} page={page} onChange={(_, v) => setPage(v)} size="small" />
      </Box>

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)}>
        <DialogTitle>Remove this post?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The post by <strong>{confirm?.author.name}</strong> and its likes and comments will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={removePost}>Remove</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AdminPosts;
