import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  IconButton,
  TextField,
  Button,
  Divider,
  Chip,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ThumbUp,
  Comment,
  Share,
  Send,
  Image as ImageIcon,
  People,
  Article,
  Event,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SocialFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/social/posts');
      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      const response = await api.post('/social/posts', {
        content: newPost,
      });
      setPosts([response.data.data, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/social/posts/${postId}/like`);
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                src={user?.profile?.profilePicture}
                sx={{ width: 60, height: 60 }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Button fullWidth variant="outlined" startIcon={<People />} sx={{ mb: 1 }}>
                My Groups
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Article />} sx={{ mb: 1 }}>
                Knowledge Hub
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Event />}>
                Expert Sessions
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Main Feed */}
        <Grid item xs={12} md={6}>
          {/* Create Post */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" gap={2}>
              <Avatar src={user?.profile?.profilePicture}>
                {user?.name?.charAt(0)}
              </Avatar>
              <Box flexGrow={1}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Share your farming experience..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  variant="outlined"
                />
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <IconButton color="primary">
                    <ImageIcon />
                  </IconButton>
                  <Button
                    variant="contained"
                    endIcon={<Send />}
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                  >
                    Post
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ mb: 2 }}>
            <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
              <Tab label="For You" />
              <Tab label="Following" />
              <Tab label="Trending" />
            </Tabs>
          </Paper>

          {/* Posts */}
          {posts.map((post) => (
            <Paper key={post._id} sx={{ p: 3, mb: 2 }}>
              <Box display="flex" gap={2} mb={2}>
                <Avatar src={post.author?.profile?.profilePicture}>
                  {post.author?.name?.charAt(0)}
                </Avatar>
                <Box flexGrow={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {post.author?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(post.createdAt).toLocaleDateString()} • {post.author?.profile?.location?.district}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" paragraph>
                {post.content}
              </Typography>

              {post.images && post.images.length > 0 && (
                <Box mb={2}>
                  <img
                    src={post.images[0]}
                    alt="Post"
                    style={{ width: '100%', borderRadius: 8, maxHeight: 400, objectFit: 'cover' }}
                  />
                </Box>
              )}

              {post.tags && post.tags.length > 0 && (
                <Box display="flex" gap={1} mb={2}>
                  {post.tags.map((tag, index) => (
                    <Chip key={index} label={`#${tag}`} size="small" />
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" gap={2}>
                <Button
                  size="small"
                  startIcon={<ThumbUp />}
                  onClick={() => handleLikePost(post._id)}
                  color={post.likes?.includes(user?._id) ? 'primary' : 'inherit'}
                >
                  {post.likes?.length || 0} Likes
                </Button>
                <Button size="small" startIcon={<Comment />}>
                  {post.comments?.length || 0} Comments
                </Button>
                <Button size="small" startIcon={<Share />}>
                  Share
                </Button>
              </Box>
            </Paper>
          ))}

          {posts.length === 0 && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No posts yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be the first to share something!
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Trending Topics
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Chip label="#RiceHarvest" color="primary" variant="outlined" />
              <Chip label="#OrganicFarming" color="primary" variant="outlined" />
              <Chip label="#PestControl" color="primary" variant="outlined" />
              <Chip label="#IrrigationTips" color="primary" variant="outlined" />
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Suggested Groups
            </Typography>
            <Box>
              {['Rice Farmers LK', 'Organic Farming', 'Tea Growers'].map((group, index) => (
                <Box key={index} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2">{group}</Typography>
                  <Button size="small" variant="outlined">
                    Join
                  </Button>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SocialFeed;
