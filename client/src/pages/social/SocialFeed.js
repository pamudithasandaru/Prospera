import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Import components
import ProfileSidebar from './components/ProfileSidebar';
import CreatePostCard from './components/CreatePostCard';
import PostCard from './components/PostCard';
import TrendingSidebar from './components/TrendingSidebar';
import CreatePostDialog from './components/CreatePostDialog';
import PostMenu from './components/PostMenu';
import FeedTabs from './components/FeedTabs';
import StoriesBar from './components/StoriesBar';

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
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  // ── Optimistic Like with Debounced API Sync ──────────────────────────────
  // UI updates instantly. The API call is sent 5 seconds after the last click
  // on each individual post (debounced per-post). If the API fails, UI reverts.
  const likeTimers = React.useRef({});     // postId → timer ID
  const likeSnapshot = React.useRef({});   // postId → likes array before optimistic update

  const handleLikePost = (postId) => {
    // 1. Update UI immediately (optimistic)
    setPosts((prev) => prev.map((post) => {
      if (post._id !== postId) return post;
      const isLiked = post.likes?.some(
        (l) => l.user === user._id || l.user?._id === user._id
      );
      // Save snapshot ONLY on the first click in this debounce window
      if (!likeTimers.current[postId]) {
        likeSnapshot.current[postId] = post.likes || [];
      }
      return {
        ...post,
        likes: isLiked
          ? post.likes.filter((l) => l.user !== user._id && l.user?._id !== user._id)
          : [...(post.likes || []), { user: user._id, date: new Date() }],
      };
    }));

    // 2. Reset the debounce timer for this post
    clearTimeout(likeTimers.current[postId]);
    likeTimers.current[postId] = setTimeout(async () => {
      delete likeTimers.current[postId];
      try {
        await api.post(`/social/post/${postId}/like`);
        // Success — clear snapshot, server state now matches UI
        delete likeSnapshot.current[postId];
      } catch (error) {
        console.error('Like sync failed, reverting:', error);
        // Revert to pre-click state
        const snapshot = likeSnapshot.current[postId];
        if (snapshot !== undefined) {
          setPosts((prev) => prev.map((post) =>
            post._id === postId ? { ...post, likes: snapshot } : post
          ));
          delete likeSnapshot.current[postId];
        }
      }
    }, 5000); // sync to DB after 5 s of no further clicks
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

  const handleSharePost = async (postId) => {
    const url = `${window.location.origin}/social?post=${postId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy'); // eslint-disable-line
      el.remove();
    }
    // Increment share count locally
    setPosts(posts.map(p =>
      p._id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p
    ));
  };

  const handlePostMenu = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/social/post/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
      setSnackbar({ open: true, message: 'Post deleted successfully', severity: 'success' });
    } catch {
      // remove locally even if server fails (for demo mode)
      setPosts(posts.filter(p => p._id !== postId));
      setSnackbar({ open: true, message: 'Post removed', severity: 'info' });
    }
    handleCloseMenu();
  };

  const isPostLiked = (post) => {
    return post.likes?.some(like => like.user === user._id || like.user._id === user._id);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Sidebar - Professional Profile */}
        <Grid item xs={12} md={3}>
          <ProfileSidebar user={user} />
        </Grid>

        {/* Main Feed */}
        <Grid item xs={12} md={6}>
          {/* Stories Bar */}
          <StoriesBar />

          {/* Create Post Card */}
          <CreatePostCard 
            user={user}
            onOpenDialog={() => setPostDialogOpen(true)}
            setPostType={setPostType}
          />

          {/* Feed Tabs */}
          <FeedTabs 
            value={tab} 
            onChange={(e, v) => setTab(v)} 
          />

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
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                user={user}
                isLiked={isPostLiked(post)}
                onLike={() => handleLikePost(post._id)}
                onShare={() => handleSharePost(post._id)}
                onPostMenu={(e) => handlePostMenu(e, post._id)}
                isCommentsExpanded={expandedComments[post._id]}
                onToggleComments={() => toggleComments(post._id)}
                commentText={commentText[post._id] || ''}
                onCommentChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                onAddComment={() => handleAddComment(post._id)}
              />
            ))
          )}
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={3}>
          <TrendingSidebar />
        </Grid>
      </Grid>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={postDialogOpen}
        onClose={() => setPostDialogOpen(false)}
        user={user}
        postType={postType}
        setPostType={setPostType}
        postCategory={postCategory}
        setPostCategory={setPostCategory}
        postVisibility={postVisibility}
        setPostVisibility={setPostVisibility}
        newPost={newPost}
        setNewPost={setNewPost}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        onCreatePost={handleCreatePost}
      />

      {/* Post Menu */}
      <PostMenu 
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        postId={selectedPostId}
        currentUserId={user?._id}
        posts={posts}
        onDelete={handleDeletePost}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SocialFeed;
