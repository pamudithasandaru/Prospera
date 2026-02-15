import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  IconButton,
  TextField,
  Button,
  Divider,
  Chip,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  alpha,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Share,
  Send,
  Image as ImageIcon,
  People,
  Article,
  Event,
  MoreVert,
  Bookmark,
  BookmarkBorder,
  Public,
  Lock,
  Groups,
  Videocam,
  AttachFile,
  EmojiEmotions,
  Close,
  ChatBubbleOutline,
  TrendingUp,
  Verified,
  Message,
  PersonAdd,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SocialFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [postType, setPostType] = useState('post');
  const [postCategory, setPostCategory] = useState('general');
  const [postVisibility, setPostVisibility] = useState('public');
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [tab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (tab === 2) params.sortBy = 'trending';
      
      const response = await api.get('/social/posts', { params });
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
      const postData = {
        content: { text: newPost },
        type: postType,
        category: postCategory,
      };

      if (selectedImage) {
        postData.content.images = [selectedImage];
      }

      const response = await api.post('/social/post', postData);
      setPosts([response.data.data, ...posts]);
      
      // Reset form
      setNewPost('');
      setSelectedImage(null);
      setPostDialogOpen(false);
      setPostType('post');
      setPostCategory('general');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/social/post/${postId}/like`);
      
      // Update local state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes?.some(like => like.user === user._id);
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter(like => like.user !== user._id)
              : [...(post.likes || []), { user: user._id, date: new Date() }]
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;

    try {
      await api.post(`/social/post/${postId}/comment`, {
        text: commentText[postId],
      });
      
      setCommentText({ ...commentText, [postId]: '' });
      fetchPosts(); // Refresh to get new comments
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId],
    });
  };

  const handlePostMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
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

  const isPostLiked = (post) => {
    return post.likes?.some(like => like.user === user._id || like.user._id === user._id);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Sidebar - Professional Profile */}
        <Grid item xs={12} md={3}>
          {/* Profile Card */}
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 2, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Cover Image */}
            <Box
              sx={{
                height: 80,
                background: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)',
              }}
            />
            
            {/* Profile Info */}
            <Box sx={{ px: 2, pb: 2, mt: -5 }}>
              <Avatar
                src={user?.profile?.profilePicture}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  border: '4px solid white',
                  mb: 1,
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                  {user?.name}
                </Typography>
                {user?.profile?.verificationBadge && (
                  <Verified sx={{ fontSize: 18, color: 'primary.main' }} />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user?.role === 'farmer' ? 'Farmer' : user?.role}
                {user?.profile?.location?.district && ` • ${user.profile.location.district}`}
              </Typography>
              
              {user?.profile?.bio && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  {user.profile.bio}
                </Typography>
              )}
              
              <Divider sx={{ my: 1.5 }} />
              
              {/* Profile Stats */}
              <Box sx={{ py: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    Profile Viewers
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color="primary">
                    {Math.floor(Math.random() * 100) + 20}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Post Impressions
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color="primary">
                    {Math.floor(Math.random() * 500) + 100}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Quick Links */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Button 
              fullWidth 
              variant="text" 
              startIcon={<People />} 
              sx={{ 
                justifyContent: 'flex-start', 
                mb: 1,
                color: 'text.primary',
                '&:hover': { bgcolor: alpha('#4CAF50', 0.08) }
              }}
            >
              My Network
            </Button>
            <Button 
              fullWidth 
              variant="text" 
              startIcon={<Groups />} 
              sx={{ 
                justifyContent: 'flex-start', 
                mb: 1,
                color: 'text.primary',
                '&:hover': { bgcolor: alpha('#4CAF50', 0.08) }
              }}
            >
              My Groups
            </Button>
            <Button 
              fullWidth 
              variant="text" 
              startIcon={<Article />} 
              sx={{ 
                justifyContent: 'flex-start', 
                mb: 1,
                color: 'text.primary',
                '&:hover': { bgcolor: alpha('#4CAF50', 0.08) }
              }}
            >
              Knowledge Hub
            </Button>
            <Button 
              fullWidth 
              variant="text" 
              startIcon={<Event />} 
              sx={{ 
                justifyContent: 'flex-start',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha('#4CAF50', 0.08) }
              }}
            >
              Expert Sessions
            </Button>
          </Paper>

          {/* Recent Connections */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Recent Connections
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5} mt={1.5}>
              {['Pradeep Silva', 'Nimal Perera', 'Kamala Jayasinghe'].map((name, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {name.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="caption" fontWeight="600" display="block">
                      {name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Farmer
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <Message sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Main Feed */}
        <Grid item xs={12} md={6}>
          {/* Create Post Card */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box display="flex" gap={2} alignItems="center">
              <Avatar 
                src={user?.profile?.profilePicture}
                sx={{ width: 48, height: 48 }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setPostDialogOpen(true)}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  color: 'text.secondary',
                  borderRadius: 50,
                  px: 3,
                  py: 1.5,
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha('#4CAF50', 0.04),
                  },
                }}
              >
                Share your farming experience...
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box display="flex" justifyContent="space-around">
              <Button
                startIcon={<ImageIcon sx={{ color: '#2196F3' }} />}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
                onClick={() => {
                  setPostType('post');
                  setPostDialogOpen(true);
                }}
              >
                Photo
              </Button>
              <Button
                startIcon={<Videocam sx={{ color: '#4CAF50' }} />}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
                onClick={() => {
                  setPostType('post');
                  setPostDialogOpen(true);
                }}
              >
                Video
              </Button>
              <Button
                startIcon={<Article sx={{ color: '#FF9800' }} />}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
                onClick={() => {
                  setPostType('article');
                  setPostDialogOpen(true);
                }}
              >
                Article
              </Button>
            </Box>
          </Paper>

          {/* Feed Tabs */}
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Tabs 
              value={tab} 
              onChange={(e, v) => setTab(v)} 
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                },
              }}
            >
              <Tab label="For You" />
              <Tab label="Following" />
              <Tab label="Trending" />
            </Tabs>
          </Paper>

          {/* Posts Feed */}
          {loading ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
              <Typography color="text.secondary">Loading posts...</Typography>
            </Paper>
          ) : posts.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No posts yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Be the first to share something!
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setPostDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Create Post
              </Button>
            </Paper>
          ) : (
            posts.map((post) => {
              const liked = isPostLiked(post);
              const content = typeof post.content === 'string' ? post.content : post.content?.text || '';
              const images = post.content?.images || post.images || [];
              
              return (
                <Paper 
                  key={post._id} 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'box-shadow 0.3s',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  {/* Post Header */}
                  <Box display="flex" gap={1.5} mb={2}>
                    <Avatar 
                      src={post.author?.profile?.profilePicture || post.author?.profile?.avatar}
                      sx={{ width: 48, height: 48 }}
                    >
                      {post.author?.name?.charAt(0)}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {post.author?.name || 'Unknown User'}
                        </Typography>
                        {post.author?.profile?.verificationBadge && (
                          <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Farmer • {new Date(post.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Typography>
                      {post.category && post.category !== 'general' && (
                        <Chip 
                          label={post.category.replace('-', ' ')} 
                          size="small" 
                          sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    <IconButton size="small" onClick={handlePostMenu}>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  {/* Post Content */}
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                    }}
                  >
                    {content}
                  </Typography>

                  {/* Post Images */}
                  {images.length > 0 && (
                    <Box mb={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <img
                        src={images[0]}
                        alt="Post content"
                        style={{ 
                          width: '100%', 
                          maxHeight: 500, 
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </Box>
                  )}

                  {/* Post Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      {post.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={`#${tag}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            borderRadius: 1,
                            '&:hover': { 
                              bgcolor: alpha('#4CAF50', 0.08),
                              cursor: 'pointer',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Post Stats */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" py={1}>
                    <Typography variant="caption" color="text.secondary">
                      {post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.comments?.length || 0} comments • {post.shares || 0} shares
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Post Actions */}
                  <Box display="flex" gap={1}>
                    <Button
                      fullWidth
                      size="medium"
                      startIcon={liked ? <ThumbUp /> : <ThumbUpOutlined />}
                      onClick={() => handleLikePost(post._id)}
                      sx={{
                        color: liked ? 'primary.main' : 'text.secondary',
                        '&:hover': { bgcolor: alpha('#4CAF50', 0.08) },
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Like
                    </Button>
                    <Button
                      fullWidth
                      size="medium"
                      startIcon={<ChatBubbleOutline />}
                      onClick={() => toggleComments(post._id)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': { bgcolor: alpha('#2196F3', 0.08) },
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Comment
                    </Button>
                    <Button
                      fullWidth
                      size="medium"
                      startIcon={<Share />}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': { bgcolor: alpha('#FF9800', 0.08) },
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Share
                    </Button>
                    <IconButton 
                      size="small"
                      sx={{
                        color: 'text.secondary',
                        '&:hover': { bgcolor: alpha('#000', 0.04) },
                      }}
                    >
                      <BookmarkBorder />
                    </IconButton>
                  </Box>

                  {/* Comments Section */}
                  <Collapse in={expandedComments[post._id]} timeout="auto" unmountOnExit>
                    <Box mt={2}>
                      <Divider sx={{ mb: 2 }} />
                      
                      {/* Add Comment */}
                      <Box display="flex" gap={1.5} mb={2}>
                        <Avatar 
                          src={user?.profile?.profilePicture}
                          sx={{ width: 36, height: 36 }}
                        >
                          {user?.name?.charAt(0)}
                        </Avatar>
                        <Box flexGrow={1} display="flex" gap={1}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Add a comment..."
                            value={commentText[post._id] || ''}
                            onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 50,
                              },
                            }}
                          />
                          <IconButton 
                            color="primary"
                            disabled={!commentText[post._id]?.trim()}
                            onClick={() => handleAddComment(post._id)}
                          >
                            <Send />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 && (
                        <Box display="flex" flexDirection="column" gap={2}>
                          {post.comments.map((comment, idx) => (
                            <Box key={idx} display="flex" gap={1.5}>
                              <Avatar 
                                src={comment.user?.profile?.profilePicture}
                                sx={{ width: 36, height: 36 }}
                              >
                                {comment.user?.name?.charAt(0) || 'U'}
                              </Avatar>
                              <Box 
                                flexGrow={1} 
                                sx={{ 
                                  bgcolor: alpha('#000', 0.03),
                                  borderRadius: 2,
                                  p: 1.5,
                                }}
                              >
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                  {comment.user?.name || 'User'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {comment.text}
                                </Typography>
                                <Box display="flex" gap={2} mt={1}>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' },
                                    }}
                                  >
                                    Like
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      cursor: 'pointer',
                                      '&:hover': { textDecoration: 'underline' },
                                    }}
                                  >
                                    Reply
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(comment.date).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              );
            })
          )}
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={3}>
          {/* Trending Topics */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingUp sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Trending Topics
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {[
                { tag: '#RiceHarvest', posts: '2.5k posts' },
                { tag: '#OrganicFarming', posts: '1.8k posts' },
                { tag: '#PestControl', posts: '956 posts' },
                { tag: '#IrrigationTips', posts: '743 posts' },
                { tag: '#SoilHealth', posts: '623 posts' },
              ].map((item, index) => (
                <Box 
                  key={index}
                  sx={{
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha('#4CAF50', 0.08),
                    },
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
          </Paper>

          {/* Suggested Groups */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Suggested Groups
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              {[
                { name: 'Rice Farmers LK', members: '12.5k members', image: '🌾' },
                { name: 'Organic Farming', members: '8.3k members', image: '🌱' },
                { name: 'Tea Growers', members: '6.7k members', image: '🍵' },
              ].map((group, index) => (
                <Box key={index}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                      {group.image}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle2" fontWeight="600">
                        {group.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {group.members}
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    fullWidth 
                    size="small" 
                    variant="outlined"
                    sx={{
                      textTransform: 'none',
                      borderRadius: 50,
                      fontWeight: 600,
                    }}
                  >
                    Join Group
                  </Button>
                  {index < 2 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Farmer Network */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Connect with Farmers
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              {[
                { name: 'Sunil Bandara', role: 'Rice Farmer', location: 'Anuradhapura' },
                { name: 'Latha Fernando', role: 'Vegetable Farmer', location: 'Nuwara Eliya' },
                { name: 'Rajith Kumar', role: 'Dairy Farmer', location: 'Kurunegala' },
              ].map((farmer, index) => (
                <Box key={index}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {farmer.name.charAt(0)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle2" fontWeight="600">
                        {farmer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {farmer.role}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {farmer.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button 
                      fullWidth 
                      size="small" 
                      variant="outlined"
                      startIcon={<PersonAdd />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 50,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      Connect
                    </Button>
                    <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <Message sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                  {index < 2 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Create Post Dialog */}
      <Dialog 
        open={postDialogOpen} 
        onClose={() => setPostDialogOpen(false)}
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
            <IconButton onClick={() => setPostDialogOpen(false)} size="small">
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
          <Box display="flex" gap={1} mb={2}>
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
              <input type="file" hidden accept="image/*" />
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
          <Button onClick={() => setPostDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePost}
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

      {/* Post Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: { width: 200 },
          },
        }}
      >
        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <Bookmark fontSize="small" />
          </ListItemIcon>
          <ListItemText>Save Post</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCloseMenu}>
          <ListItemIcon>
            <Article fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCloseMenu}>
          <ListItemText>Report Post</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default SocialFeed;
