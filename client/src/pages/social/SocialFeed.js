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
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import useRequireAuth from '../../hooks/useRequireAuth';
import api from '../../services/api';
import { MOCK_POSTS } from './mockData';

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
import GuestPrompt from './components/GuestPrompt';

const SocialFeed = () => {
  const { user, isGuest } = useAuth();
  // The feed reads fine signed out; posting, liking and commenting do not.
  const requireAuth = useRequireAuth();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Guests have no connections to load, and the endpoint needs a token.
    if (isGuest) {
      setConnectionIds([]);
      return;
    }
    api.get('/social/connections')
      .then((res) => {
        const conns = res.data.data || [];
        const ids = conns.map((c) => c.otherUser?._id).filter(Boolean);
        setConnectionIds(ids);
      })
      .catch(() => setConnectionIds([]));
  }, [isGuest]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (tab === 2) params.sortBy = 'trending';
      
      const response = await api.get('/social/posts', { params });
      const fetched = response.data.data || [];
      // Fall back to mock data so the feed is never empty in demo/dev mode
      setPosts(fetched.length > 0 ? fetched : MOCK_POSTS);
    } catch (error) {
      console.warn('API unavailable, using mock data:', error.message);
      setPosts(MOCK_POSTS);
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

  useEffect(() => {
    const postParam = new URLSearchParams(window.location.search).get('post');
    if (postParam && !loading && posts.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`post-${postParam}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.outline = '2px solid #1B5E20';
          setTimeout(() => {
            el.style.outline = 'none';
          }, 3500);
        }
      }, 450);
    }
  }, [loading, posts]);

  const handleSharePost = async (postId) => {
    const url = `${window.location.origin}/social?post=${postId}`;
    let shared = false;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prospera Agricultural Community',
          text: 'Check out this agricultural update on Prospera:',
          url,
        });
        shared = true;
      } catch (err) {
        // User cancelled share
      }
    }

    if (!shared) {
      try {
        await navigator.clipboard.writeText(url);
        setSnackbar({
          open: true,
          message: 'Post link copied to clipboard! Share it with fellow farmers.',
          severity: 'success',
        });
      } catch {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy'); // eslint-disable-line
        el.remove();
        setSnackbar({
          open: true,
          message: 'Post link copied to clipboard!',
          severity: 'success',
        });
      }
    }

    // Increment share count locally
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p))
    );
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
    if (!user?._id) return false; // a guest has liked nothing
    return post.likes?.some(like => like.user === user._id || like.user?._id === user._id);
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
    let result = tabPosts;
    if (selectedTag) {
      const norm = selectedTag.toLowerCase().replace(/^#/, '');
      result = result.filter((post) => {
        const inTags = (post.tags || []).some((t) => t.toLowerCase().replace(/^#/, '') === norm);
        const inCat = post.category && post.category.toLowerCase().replace('-', ' ') === norm.replace('-', ' ');
        const text = typeof post.content === 'string' ? post.content : (post.content?.text || '');
        return inTags || inCat || text.toLowerCase().includes(norm);
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((post) => {
        const text = typeof post.content === 'string' ? post.content : (post.content?.text || '');
        const authorName = post.author?.name || post.user?.name || '';
        const title = post.title || post.articleTitle || '';
        const inTags = (post.tags || []).some((t) => t.toLowerCase().includes(q));
        const inCat = post.category && post.category.toLowerCase().includes(q);
        return (
          text.toLowerCase().includes(q) ||
          authorName.toLowerCase().includes(q) ||
          title.toLowerCase().includes(q) ||
          inTags ||
          inCat
        );
      });
    }
    return result;
  }, [tabPosts, selectedTag, searchQuery]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Sidebar - Professional Profile */}
        <Grid item xs={12} md={3}>
          {isGuest ? (
            <GuestPrompt
              title="Join the conversation"
              body="Create a free account to post, comment and connect with growers across the island."
            />
          ) : (
            <ProfileSidebar 
              user={user} 
              onViewProfile={(author) => setProfileModalUser(author)} 
            />
          )}
        </Grid>

        {/* Main Feed */}
        <Grid item xs={12} md={6}>
          {/* Stories and the compose box both need an account — the feed
              below them does not, so only these two are swapped out. */}
          {!isGuest && (
            <>
              <StoriesBar />
              <CreatePostCard 
                user={user}
                onOpenDialog={() => setPostDialogOpen(true)}
                setPostType={setPostType}
              />
            </>
          )}

          {/* Quick Search Bar */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search posts by keyword, crop, topic, or farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')} edge="end">
                      <ClearIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  borderRadius: 3,
                  backgroundColor: '#ffffff',
                  boxShadow: 'inset 2px 2px 5px rgba(163,177,198,0.3), inset -2px -2px 5px rgba(255,255,255,0.7)',
                  '& fieldset': { border: 'none' },
                  fontSize: '0.88rem',
                },
              }}
            />
          </Box>

          {/* Feed Tabs */}
          <FeedTabs 
            value={tab} 
            onChange={(e, v) => setTab(v)}
            savedCount={savedPostIds.length}
          />

          {/* Active Tag & Search Filter Banner */}
          {(selectedTag || searchQuery) && (
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
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                {selectedTag && (
                  <Chip
                    label={`#${selectedTag}`}
                    color="primary"
                    size="small"
                    onDelete={() => setSelectedTag(null)}
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
                {searchQuery && (
                  <Chip
                    label={`Search: "${searchQuery}"`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    onDelete={() => setSearchQuery('')}
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
                <Typography variant="body2" color="text.secondary">
                  Showing {visiblePosts.length} post{visiblePosts.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Clear Filters ✕
              </Button>
            </Paper>
          )}

          {/* Posts Feed */}
          {loading ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography color="text.secondary">Loading posts...</Typography>
            </Paper>
          ) : visiblePosts.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 3, sm: 5 }, 
                textAlign: 'center',
                borderRadius: 3.5,
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                {tab === 1 
                  ? 'No posts from your network yet'
                  : tab === 3
                  ? 'No questions asked yet'
                  : tab === 4
                  ? 'No success stories shared yet'
                  : tab === 5
                  ? 'No saved bookmarks yet'
                  : searchQuery
                  ? `No posts matching "${searchQuery}"`
                  : selectedTag
                  ? `No posts tagged #${selectedTag}`
                  : 'Welcome to Prospera Community!'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: searchQuery ? 1.5 : 3 }}>
                {tab === 1 
                  ? 'Connect with fellow farmers to see their updates and farming tips in this tab.'
                  : tab === 3
                  ? 'Got a farming challenge, pest problem, or fertilizer question? Tap a prompt below to ask!'
                  : tab === 4
                  ? 'Share your harvest milestone, awards, or agricultural achievements!'
                  : tab === 5
                  ? 'Tap the bookmark icon on any post in the feed to save it for quick reference here.'
                  : searchQuery
                  ? 'Try searching with different terms or clear the search to view all community posts.'
                  : 'Start a conversation with thousands of farmers and agricultural specialists across the country:'}
              </Typography>

              {searchQuery && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => setSearchQuery('')}
                  sx={{ textTransform: 'none', mb: 3, borderRadius: 2 }}
                >
                  Clear Search Filter
                </Button>
              )}

              {/* Starter Prompt Templates */}
              <Box mb={3} textAlign="left">
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 1.5, textAlign: 'center' }}>
                  💡 OR PICK A COMMUNITY TEMPLATE TO START:
                </Typography>
                <Grid container spacing={1.5}>
                  {[
                    {
                      icon: '🌾',
                      title: 'Harvest Milestone',
                      desc: 'Share your crop yields or seasonal harvest update',
                      type: 'success-story',
                      category: 'crop-management',
                      text: 'Excited to share our harvest results this season! 🌾 Our yield increased thanks to proper soil preparation and timely irrigation.',
                      tags: ['harvest', 'organic', 'cropyield'],
                    },
                    {
                      icon: '🐛',
                      title: 'Ask for Agri Advice',
                      desc: 'Get pest, soil, or fertilizer suggestions from experts',
                      type: 'question',
                      category: 'crop-management',
                      text: 'Looking for advice on my crops: noticing unusual leaf curling/spots. Has anyone experienced this and what organic solution worked best? 🐛',
                      tags: ['pestcontrol', 'crops', 'farmingtips'],
                    },
                    {
                      icon: '🌦️',
                      title: 'Weather & Irrigation',
                      desc: 'Share rain preparation or irrigation channels news',
                      type: 'post',
                      category: 'weather',
                      text: 'Weather forecast update for our district: preparing irrigation channels ahead of expected rains! 🌧️ Stay prepared fellow farmers.',
                      tags: ['weather', 'irrigation', 'watermanagement'],
                    },
                    {
                      icon: '💡',
                      title: 'Farming Innovation',
                      desc: 'Discuss new equipment, drone spraying, or techniques',
                      type: 'post',
                      category: 'technology',
                      text: 'Testing out new organic soil amendments this month. Here are the key improvements observed in crop vitality: 💡',
                      tags: ['agritech', 'smartfarming', 'innovation'],
                    },
                  ].map((prompt) => (
                    <Grid item xs={12} sm={6} key={prompt.title}>
                      <Box
                        onClick={() => {
                          setPostType(prompt.type);
                          setPostCategory(prompt.category);
                          setNewPost(prompt.text);
                          setPostTags(prompt.tags);
                          setPostDialogOpen(true);
                        }}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          border: '1px solid rgba(27, 94, 32, 0.2)',
                          backgroundColor: 'rgba(255, 255, 255, 0.6)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(27, 94, 32, 0.08)',
                            transform: 'translateY(-2px)',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <span style={{ fontSize: '1.25rem' }}>{prompt.icon}</span>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {prompt.title}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {prompt.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Button 
                variant="contained" 
                onClick={() => {
                  if (tab === 3) setPostType('question');
                  else if (tab === 4) setPostType('success-story');
                  else setPostType('post');
                  setPostDialogOpen(true);
                }}
                sx={{ px: 4, py: 1, borderRadius: 50, fontWeight: 700 }}
              >
                {tab === 3 ? 'Ask Question' : tab === 4 ? 'Share Success Story' : 'Create Custom Post'}
              </Button>
            </Paper>
          ) : (
            visiblePosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                user={user}
                isLiked={isPostLiked(post)}
                onLike={requireAuth(() => handleLikePost(post._id))}
                onShare={() => handleSharePost(post._id)}
                onPostMenu={(e) => handlePostMenu(e, post._id)}
                isCommentsExpanded={expandedComments[post._id]}
                onToggleComments={() => toggleComments(post._id)}
                commentText={commentText[post._id] || ''}
                onCommentChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                onAddComment={requireAuth((customText) => handleAddComment(post._id, customText))}
                onViewProfile={(author) => setProfileModalUser(author)}
                onTagClick={(tag) => setSelectedTag(tag.replace(/^#/, ''))}
                isSaved={savedPostIds.includes(post._id)}
                onToggleSave={() => handleToggleSave(post._id)}
              />
            ))
          )}
        </Grid>

        {/* Right Sidebar — suggestions, notifications and connection state
            are all per-account, so a guest would only fire a row of 401s. */}
        <Grid item xs={12} md={3}>
          {isGuest ? (
            <GuestPrompt
              title="See who to follow"
              body="Sign in for suggested growers, trending topics in your district and your notifications."
            />
          ) : (
            <TrendingSidebar 
              onSelectTag={(tag) => setSelectedTag(tag.replace(/^#/, ''))}
              onViewProfile={(author) => setProfileModalUser(author)}
            />
          )}
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
