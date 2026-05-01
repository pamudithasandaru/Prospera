/**
 * SearchPage.js
 * Search users, posts, and hashtags with tab-based results.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Tab,
  Tabs,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  InputAdornment,
  alpha,
  Button,
} from '@mui/material';
import { Search, TrendingUp, Person, Article } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { resolveAvatar } from '../../utils/avatarUtils';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tab, setTab] = useState(0);
  const [results, setResults] = useState({ users: [], posts: [], hashtags: [] });
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const typeMap = ['all', 'users', 'posts', 'hashtags'];

  const doSearch = async (q, type) => {
    if (!q.trim()) { setResults({ users: [], posts: [], hashtags: [] }); return; }
    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q, type } });
      setResults(res.data.data || { users: [], posts: [], hashtags: [] });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams(query ? { q: query } : {});
      doSearch(query, typeMap[tab]);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, tab]); // eslint-disable-line

  const handleMessageUser = (userId) => {
    navigate(`/messages?user=${userId}`);
  };

  const PostResult = ({ post }) => {
    const text = typeof post.content === 'string' ? post.content : post.content?.text || '';
    return (
      <Paper elevation={0} sx={{ p: 2, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.07)' } }}>
        <Box display="flex" gap={1.5} alignItems="center" mb={1}>
          <Avatar sx={{ width: 32, height: 32 }}>{post.author?.name?.charAt(0) || post.user?.name?.charAt(0)}</Avatar>
          <Typography variant="caption" fontWeight="bold">{post.author?.name || post.user?.name}</Typography>
        </Box>
        <Typography variant="body2" noWrap>{text}</Typography>
        {post.category && post.category !== 'general' && (
          <Chip label={`#${post.category}`} size="small" sx={{ mt: 1 }} />
        )}
      </Paper>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Search Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="medium"
          autoFocus
          placeholder="Search users, posts, hashtags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99 } }}
        />
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab label="All" icon={<Search sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label={`People (${results.users.length})`} icon={<Person sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label={`Posts (${results.posts.length})`} icon={<Article sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label={`Hashtags (${results.hashtags.length})`} icon={<TrendingUp sx={{ fontSize: 16 }} />} iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {!query.trim() && (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Search sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">Start typing to search</Typography>
            </Box>
          )}

          {loading && query && (
            <Box>
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Skeleton variant="circular" width={44} height={44} />
                  <Box flex={1}><Skeleton width="60%" /><Skeleton width="40%" /></Box>
                </Box>
              ))}
            </Box>
          )}

          {!loading && query && (
            <>
              {/* Users */}
              {(tab === 0 || tab === 1) && results.users.length > 0 && (
                <Box mb={3}>
                  {tab === 0 && <Typography variant="subtitle2" fontWeight="bold" mb={1} color="text.secondary">PEOPLE</Typography>}
                  <List disablePadding>
                    {results.users.map((u) => (
                      <ListItem
                        key={u._id}
                        sx={{ px: 0, borderRadius: 2, '&:hover': { bgcolor: alpha('#4CAF50', 0.05) } }}
                        secondaryAction={
                          u._id !== user?._id && (
                            <Button size="small" variant="outlined" sx={{ borderRadius: 99, textTransform: 'none' }} onClick={() => handleMessageUser(u._id)}>
                              Message
                            </Button>
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar src={resolveAvatar(u)}>{u.name?.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight="600">{u.name}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">{u.role} {u.profile?.location?.district ? `• ${u.profile.location.district}` : ''}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Posts */}
              {(tab === 0 || tab === 2) && results.posts.length > 0 && (
                <Box mb={3}>
                  {tab === 0 && <Typography variant="subtitle2" fontWeight="bold" mb={1} color="text.secondary">POSTS</Typography>}
                  {results.posts.map((p) => <PostResult key={p._id} post={p} />)}
                </Box>
              )}

              {/* Hashtags */}
              {(tab === 0 || tab === 3) && results.hashtags.length > 0 && (
                <Box>
                  {tab === 0 && <Typography variant="subtitle2" fontWeight="bold" mb={1} color="text.secondary">HASHTAGS</Typography>}
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {results.hashtags.map((h) => (
                      <Chip
                        key={h.tag}
                        label={`${h.tag} · ${h.posts} posts`}
                        onClick={() => setQuery(h.tag.replace('#', ''))}
                        sx={{ borderRadius: 99, '&:hover': { bgcolor: alpha('#4CAF50', 0.1) } }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* No results */}
              {!loading && results.users.length === 0 && results.posts.length === 0 && results.hashtags.length === 0 && (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">No results for "{query}"</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default SearchPage;
