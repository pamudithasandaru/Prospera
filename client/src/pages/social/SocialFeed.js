import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  Box,
  Chip,
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
import FarmerProfileModal from './components/FarmerProfileModal';

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
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [connectionIds, setConnectionIds] = useState([]);
  const [postTags, setPostTags] = useState([]);
  const [articleTitle, setArticleTitle] = useState('');
  const [savedPostIds, setSavedPostIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('prospera_saved_posts') || '[]');
    } catch {
      return [];
    }
  });
  const [selectedTag, setSelectedTag] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tag') ? params.get('tag').replace(/^#/, '') : null;
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    api.get('/social/connections')
      .then((res) => {
        const conns = res.data.data || [];
        const ids = conns.map((c) => c.otherUser?._id).filter(Boolean);
        setConnectionIds(ids);
      })
      .catch(() => setConnectionIds([]));
  }, []);

  const fetchPosts = useCallback(async () => {
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
  }, [tab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedImage) return;

    try {
      const fullText = articleTitle ? `# ${articleTitle}\n\n${newPost}` : newPost;
      const postData = {
        content: { text: fullText },
        type: postType,
        category: postCategory,
        tags: postTags,
      };

      if (selectedImage) {
        postData.content.images = [selectedImage];
      }

      const response = await api.post('/social/post', postData);
      setPosts([response.data.data, ...posts]);
      
      // Reset form
      setNewPost('');
      setSelectedImage(null);
      setPostTags([]);
      setArticleTitle('');
      setPostDialogOpen(false);
      setPostType('post');
      setPostCategory('general');
      setSnackbar({ open: true, message: 'Post published successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error creating post:', error);
      setSnackbar({ open: true, message: 'Failed to publish post', severity: 'error' });
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

  const handleAddComment = async (postId, customText) => {
    const textToSubmit = customText || commentText[postId];
    if (!textToSubmit?.trim()) return;

    try {
      await api.post(`/social/post/${postId}/comment`, {
        text: textToSubmit.trim(),
      });
      
      if (!customText) {
        setCommentText({ ...commentText, [postId]: '' });
      }
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

  const handleToggleSave = (postId) => {
    setSavedPostIds((prev) => {
      const isSaved = prev.includes(postId);
      const next = isSaved ? prev.filter((id) => id !== postId) : [...prev, postId];
      try {
        localStorage.setItem('prospera_saved_posts', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to update saved posts:', err);
      }
      setSnackbar({
        open: true,
        message: isSaved ? 'Post removed from your bookmarks' : 'Post saved to your bookmarks!',
        severity: isSaved ? 'info' : 'success',
      });
      return next;
    });
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

  const tabPosts = useMemo(() => {
    let result = [...posts];
    if (tab === 1) {
      // Network tab: posts from author in connectionIds or user themselves
      result = result.filter((p) => {
        const authorId = p.author?._id || p.author?.id || p.user?._id || p.user?.id || p.authorId || p.userId;
        return connectionIds.includes(authorId) || (user?._id && authorId === user._id);
      });
    } else if (tab === 2) {
      // Trending: sort by likes + comments
      result.sort((a, b) => {
        const scoreA = (a.likes?.length || 0) + (a.comments?.length || 0) * 2;
        const scoreB = (b.likes?.length || 0) + (b.comments?.length || 0) * 2;
        return scoreB - scoreA;
      });
    } else if (tab === 3) {
      // Q&A / Questions
      result = result.filter((p) => p.type === 'question' || p.category === 'question');
    } else if (tab === 4) {
      // Success Stories
      result = result.filter((p) => p.type === 'success-story');
    } else if (tab === 5) {
      // Saved Posts
      result = result.filter((p) => savedPostIds.includes(p._id));
    }
    return result;
  }, [posts, tab, connectionIds, user?._id, savedPostIds]);

  const visiblePosts = useMemo(() => {
    if (!selectedTag) return tabPosts;
    const norm = selectedTag.toLowerCase().replace(/^#/, '');
    return tabPosts.filter((post) => {
      const inTags = (post.tags || []).some((t) => t.toLowerCase().replace(/^#/, '') === norm);
      const inCat = post.category && post.category.toLowerCase().replace('-', ' ') === norm.replace('-', ' ');
      const text = typeof post.content === 'string' ? post.content : (post.content?.text || '');
      return inTags || inCat || text.toLowerCase().includes(norm);
    });
  }, [tabPosts, selectedTag]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Sidebar - Professional Profile */}
        <Grid item xs={12} md={3}>
          <ProfileSidebar 
            user={user} 
            onViewProfile={(author) => setProfileModalUser(author)} 
          />
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
            savedCount={savedPostIds.length}
          />

          {/* Active Tag Filter Banner */}
          {selectedTag && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(27, 94, 32, 0.08)',
                border: '1px solid rgba(27, 94, 32, 0.25)',
                borderRadius: 2.5,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={`#${selectedTag}`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Showing {visiblePosts.length} post{visiblePosts.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <Button
                size="small"
                color="inherit"
                onClick={() => setSelectedTag(null)}
                sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Clear Filter ✕
              </Button>
            </Paper>
          )}

          {/* Posts Feed */}
          {loading ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Loading posts...</Typography>
            </Paper>
          ) : visiblePosts.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {tab === 1 
                  ? 'No posts from your network yet'
                  : tab === 3
                  ? 'No questions asked yet'
                  : tab === 4
                  ? 'No success stories shared yet'
                  : tab === 5
                  ? 'No saved posts'
                  : selectedTag
                  ? `No posts tagged #${selectedTag}`
                  : 'No posts yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {tab === 1 
                  ? 'Connect with more farmers to see their updates here!'
                  : tab === 3
                  ? 'Got a farming challenge or question? Ask the community!'
                  : tab === 4
                  ? 'Share your harvest milestone or farming achievement!'
                  : tab === 5
                  ? 'Bookmark posts you want to refer back to later!'
                  : 'Be the first to share something!'}
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => {
                  if (tab === 3) setPostType('question');
                  else if (tab === 4) setPostType('success-story');
                  else setPostType('post');
                  setPostDialogOpen(true);
                }}
                sx={{ mt: 2 }}
              >
                {tab === 3 ? 'Ask Question' : tab === 4 ? 'Share Success' : 'Create Post'}
              </Button>
            </Paper>
          ) : (
            visiblePosts.map((post) => (
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
                onAddComment={(customText) => handleAddComment(post._id, customText)}
                onViewProfile={(author) => setProfileModalUser(author)}
                onTagClick={(tag) => setSelectedTag(tag.replace(/^#/, ''))}
                isSaved={savedPostIds.includes(post._id)}
                onToggleSave={() => handleToggleSave(post._id)}
              />
            ))
          )}
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={3}>
          <TrendingSidebar 
            onSelectTag={(tag) => setSelectedTag(tag.replace(/^#/, ''))}
            onViewProfile={(author) => setProfileModalUser(author)}
          />
        </Grid>
      </Grid>

      {/* Farmer Profile Preview Modal */}
      <FarmerProfileModal
        open={Boolean(profileModalUser)}
        onClose={() => setProfileModalUser(null)}
        user={profileModalUser}
        currentUserId={user?._id}
      />

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
        postTags={postTags}
        setPostTags={setPostTags}
        articleTitle={articleTitle}
        setArticleTitle={setArticleTitle}
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
