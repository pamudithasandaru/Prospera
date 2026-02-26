import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Paper, Typography, Avatar, Button, IconButton, Tab, Tabs,
  Grid, Divider, TextField, Chip, CircularProgress,
  Alert, Snackbar, Badge, Tooltip, alpha,
} from '@mui/material';
import {
  Edit, CameraAlt, ThumbUp, ChatBubbleOutline, Share,
  LocationOn, Work, Email, Lock, Save, Person, People, Article,
  Groups, Settings, Verified, PhotoCamera, Check,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const toBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

/* ─────────────────────────────────────────────
   Mini PostCard (reused inside profile)
───────────────────────────────────────────── */
const MiniPostCard = ({ post }) => {
  const content =
    typeof post.content === 'string' ? post.content : post.content?.text || '';
  const images = post.content?.images || post.images || [];
  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, mb: 2, border: '1px solid', borderColor: 'divider',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }, transition: 'box-shadow .3s' }}
    >
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </Typography>
      {post.category && post.category !== 'general' && (
        <Chip label={post.category.replaceAll('-', ' ')} size="small" sx={{ mb: 1, fontSize: '0.7rem', height: 20 }} />
      )}
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>{content}</Typography>
      {images.length > 0 && (
        <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 1.5 }}>
          <img src={images[0]} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }} />
        </Box>
      )}
      <Divider sx={{ my: 1 }} />
      <Box display="flex" gap={1}>
        {[
          { icon: <ThumbUp sx={{ fontSize: 16 }} />, label: `${post.likes?.length || 0} Likes` },
          { icon: <ChatBubbleOutline sx={{ fontSize: 16 }} />, label: `${post.comments?.length || 0} Comments` },
          { icon: <Share sx={{ fontSize: 16 }} />, label: 'Share' },
        ].map(({ icon, label }) => (
          <Button key={label} size="small" startIcon={icon}
            sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.75rem' }}>
            {label}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};

/* ─────────────────────────────────────────────
   Connection Card
───────────────────────────────────────────── */
const ConnectionCard = ({ farmer }) => (
  <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', borderRadius: 2 }}>
    <Avatar src={farmer.avatar} sx={{ width: 64, height: 64, mx: 'auto', mb: 1 }}>
      {farmer.name?.charAt(0)}
    </Avatar>
    <Typography variant="subtitle2" fontWeight="bold" noWrap>{farmer.name}</Typography>
    <Typography variant="caption" color="text.secondary" display="block" noWrap>
      {farmer.role?.charAt(0).toUpperCase()}{farmer.role?.slice(1)}
    </Typography>
    {farmer.profile?.location?.district && (
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
        <LocationOn sx={{ fontSize: 11, verticalAlign: 'middle' }} />
        {' '}{farmer.profile.location.district}
      </Typography>
    )}
    <Button fullWidth size="small" variant="outlined" sx={{ mt: 1.5, textTransform: 'none', borderRadius: 50, fontSize: '0.75rem' }}>
      Message
    </Button>
  </Paper>
);

/* ─────────────────────────────────────────────
   Group Card
───────────────────────────────────────────── */
const GroupCard = ({ group }) => (
  <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
    <Box display="flex" gap={1.5} alignItems="center">
      <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48, fontSize: '1.4rem' }}>
        {group.image || group.name?.charAt(0)}
      </Avatar>
      <Box flex={1}>
        <Typography variant="subtitle2" fontWeight="bold">{group.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {group.memberCount >= 1000 ? `${(group.memberCount / 1000).toFixed(1)}k` : group.memberCount} members
        </Typography>
      </Box>
      <Chip label="Joined" size="small" color="primary" variant="outlined" />
    </Box>
  </Paper>
);

/* ─────────────────────────────────────────────
   MAIN PROFILE PAGE
───────────────────────────────────────────── */
const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Settings form state
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.profile?.bio || '',
    district: user?.profile?.location?.district || '',
    profilePicture: user?.profile?.profilePicture || '',
    coverPhoto: user?.profile?.coverPhoto || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editMode, setEditMode] = useState(false);

  const avatarInputRef = useRef();
  const coverInputRef = useRef();

  useEffect(() => {
    if (!user) return;
    // Fetch only this user's own posts
    api.get('/social/posts', { params: { userId: user._id } })
      .then((r) => setPosts(r.data.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));

    // Fetch actual connections (enriched with otherUser profile)
    api.get('/social/connections')
      .then((r) => setConnections(r.data.data || []))
      .catch(() => setConnections([]))
      .finally(() => setLoadingConnections(false));

    // Fetch groups
    api.get('/social/groups')
      .then((r) => setGroups(r.data.data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoadingGroups(false));
  }, [user]);

  // Sync form when user changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        district: user.profile?.location?.district || '',
        profilePicture: user.profile?.profilePicture || '',
        coverPhoto: user.profile?.coverPhoto || '',
      });
    }
  }, [user]);

  /* ── Image helpers ── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setForm((f) => ({ ...f, profilePicture: b64 }));
    e.target.value = '';
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setForm((f) => ({ ...f, coverPhoto: b64 }));
    e.target.value = '';
  };

  /* ── Save profile ── */
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      const updated = res.data.data || res.data.user;
      if (updated) {
        // Deep-merge to properly update nested profile object
        const merged = {
          ...user,
          ...updated,
          profile: {
            ...(user?.profile || {}),
            ...(updated?.profile || {}),
          },
        };
        updateUser(merged);
      }
      setSnackbar({ open: true, message: 'Profile saved successfully!', severity: 'success' });
      setEditMode(false);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save profile.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  /* ── Save password ── */
  const handleSavePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setSnackbar({ open: true, message: 'New passwords do not match.', severity: 'error' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setSnackbar({ open: true, message: 'Password must be at least 6 characters.', severity: 'error' });
      return;
    }
    setSavingPw(true);
    try {
      await api.put('/auth/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setSnackbar({ open: true, message: 'Password updated!', severity: 'success' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to update password.', severity: 'error' });
    } finally {
      setSavingPw(false);
    }
  };

  /* ── Cover gradient fallback ── */
  const coverSrc = form.coverPhoto || user?.profile?.coverPhoto || null;
  const avatarSrc = form.profilePicture || user?.profile?.profilePicture || user?.avatar || null;

  return (
    <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', pb: 6 }}>
      {/* ── Cover + Avatar ── */}
      <Box sx={{ position: 'relative', maxWidth: 1100, mx: 'auto' }}>
        {/* Cover Photo */}
        <Box
          sx={{
            height: { xs: 160, sm: 240, md: 300 },
            borderRadius: { xs: 0, md: '0 0 16px 16px' },
            overflow: 'hidden',
            backgroundImage: coverSrc
              ? `url(${coverSrc})`
              : 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 60%, #8BC34A 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          <Box sx={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.35) 100%)',
          }} />
          <input type="file" hidden accept="image/*" ref={coverInputRef} onChange={handleCoverChange} />
          <Tooltip title="Change cover photo">
            <IconButton
              onClick={() => coverInputRef.current.click()}
              sx={{
                position: 'absolute', bottom: 12, right: 16,
                bgcolor: 'rgba(0,0,0,0.55)', color: 'white',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
              }}
            >
              <PhotoCamera />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Avatar + Name row */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 0, md: '0 0 16px 16px' },
            px: { xs: 2, sm: 4 },
            pt: 0,
            pb: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'center', sm: 'flex-end' }}
            gap={2}
            sx={{ mt: { xs: -7, sm: -10 } }}
          >
            {/* Avatar badge */}
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Tooltip title="Change profile photo">
                  <IconButton
                    size="small"
                    onClick={() => avatarInputRef.current.click()}
                    sx={{ bgcolor: 'background.paper', border: '2px solid white', width: 32, height: 32,
                      '&:hover': { bgcolor: 'grey.100' } }}
                  >
                    <CameraAlt sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              }
            >
              <Avatar
                src={avatarSrc}
                sx={{ width: { xs: 100, sm: 140 }, height: { xs: 100, sm: 140 },
                  border: '4px solid white', bgcolor: 'primary.main', fontSize: '3rem',
                  cursor: 'pointer' }}
                onClick={() => avatarInputRef.current?.click()}
              >
                {user?.name?.charAt(0)}
              </Avatar>
            </Badge>
            <input type="file" hidden accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} />

            {/* Name & meta */}
            <Box flex={1} sx={{ pb: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                <Typography variant="h5" fontWeight="bold">{user?.name}</Typography>
                {user?.profile?.verificationBadge && <Verified sx={{ color: 'primary.main' }} />}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
                {user?.profile?.location?.district && ` · ${user.profile.location.district}`}
              </Typography>
              {user?.profile?.bio && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 480 }}>
                  {user.profile.bio}
                </Typography>
              )}
              <Box display="flex" gap={3} mt={1} flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>{posts.length}</strong> Posts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>{connections.length}</strong> Connections
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>{groups.length}</strong> Groups
                </Typography>
              </Box>
            </Box>

            {/* Action buttons */}
            <Box display="flex" gap={1} pb={1}>
              <Button
                variant={editMode ? 'contained' : 'outlined'}
                startIcon={editMode ? <Check /> : <Edit />}
                onClick={() => (editMode ? handleSaveProfile() : setEditMode(true))}
                disabled={saving}
                sx={{ textTransform: 'none', borderRadius: 50, fontWeight: 600 }}
              >
                {saving ? <CircularProgress size={16} /> : editMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
              <Tooltip title="Settings">
                <IconButton onClick={() => setTab(3)}
                  sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mt: 1, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
          >
            <Tab icon={<Article sx={{ fontSize: 18 }} />} iconPosition="start" label="Posts" />
            <Tab icon={<People sx={{ fontSize: 18 }} />} iconPosition="start" label="Connections" />
            <Tab icon={<Groups sx={{ fontSize: 18 }} />} iconPosition="start" label="Groups" />
            <Tab icon={<Settings sx={{ fontSize: 18 }} />} iconPosition="start" label="Settings" />
          </Tabs>
        </Paper>
      </Box>

      {/* ── Tab Content ── */}
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* POSTS TAB */}
        {tab === 0 && (
          <Grid container spacing={3}>
            {/* Left: intro card */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Intro</Typography>
                {user?.profile?.bio && (
                  <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ fontStyle: 'italic' }}>
                    "{user.profile.bio}"
                  </Typography>
                )}
                {[
                  { icon: <Work sx={{ fontSize: 18 }} />, text: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
                  { icon: <LocationOn sx={{ fontSize: 18 }} />, text: user?.profile?.location?.district || 'Location not set' },
                  { icon: <Email sx={{ fontSize: 18 }} />, text: user?.email },
                ].map(({ icon, text }) => (
                  <Box key={text} display="flex" alignItems="center" gap={1} mb={1}>
                    <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
                    <Typography variant="body2" color="text.secondary">{text}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" gutterBottom>Photos</Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {posts.filter((p) => p.content?.images?.length > 0).slice(0, 9).map((p) => (
                    <Box key={p._id} sx={{ width: 70, height: 70, borderRadius: 1, overflow: 'hidden' }}>
                      <img src={p.content.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  ))}
                  {posts.filter((p) => p.content?.images?.length > 0).length === 0 && (
                    <Typography variant="caption" color="text.secondary">No photos yet</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Right: posts */}
            <Grid item xs={12} md={8}>
              {loadingPosts ? (
                <Box textAlign="center" py={4}><CircularProgress /></Box>
              ) : posts.length === 0 ? (
                <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Article sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">No posts yet. Share your first experience!</Typography>
                </Paper>
              ) : (
                posts.map((p) => <MiniPostCard key={p._id} post={p} />)
              )}
            </Grid>
          </Grid>
        )}

        {/* CONNECTIONS TAB */}
        {tab === 1 && (
          <>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Connections · <Typography component="span" color="text.secondary" variant="h6">{connections.length}</Typography>
            </Typography>
            {loadingConnections ? (
              <Box textAlign="center" py={4}><CircularProgress /></Box>
            ) : connections.length === 0 ? (
              <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <People sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No connections yet.</Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {connections.map((conn) => {
                  const other = conn.otherUser || {};
                  return (
                    <Grid item xs={6} sm={4} md={3} key={conn._id}>
                      <ConnectionCard farmer={other} />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </>
        )}

        {/* GROUPS TAB */}
        {tab === 2 && (
          <>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Groups · <Typography component="span" color="text.secondary" variant="h6">{groups.length}</Typography>
            </Typography>
            {loadingGroups ? (
              <Box textAlign="center" py={4}><CircularProgress /></Box>
            ) : groups.length === 0 ? (
              <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Groups sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">Not joined any groups yet.</Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {groups.map((g) => (
                  <Grid item xs={12} sm={6} md={4} key={g._id}>
                    <GroupCard group={g} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* SETTINGS TAB */}
        {tab === 3 && (
          <Grid container spacing={3}>
            {/* Profile Settings */}
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Person sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">Profile Information</Typography>
                </Box>

                {/* Avatar preview */}
                <Box display="flex" alignItems="center" gap={2} mb={3}
                  sx={{ p: 2, bgcolor: alpha('#4CAF50', 0.05), borderRadius: 2, border: '1px dashed', borderColor: 'primary.light' }}>
                  <Avatar
                    src={avatarSrc}
                    sx={{ width: 72, height: 72, border: '3px solid white', boxShadow: 2 }}
                  >
                    {user?.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">Profile Photo</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      JPG or PNG, max 5 MB
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      onClick={() => avatarInputRef.current.click()}
                      sx={{ textTransform: 'none', borderRadius: 50, fontSize: '0.75rem' }}
                    >
                      Upload Photo
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth label="Full Name" value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth label="Email Address" type="email" value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth multiline rows={3} label="Bio"
                      placeholder="Tell the community about yourself..."
                      value={form.bio}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth label="District / Location" value={form.district}
                      onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                      InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} /> }}
                    />
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" gap={1.5}>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <Save />}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    sx={{ textTransform: 'none', borderRadius: 50, px: 3, fontWeight: 600 }}
                  >
                    Save Profile
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setForm({
                      name: user?.name || '', email: user?.email || '',
                      bio: user?.profile?.bio || '', district: user?.profile?.location?.district || '',
                      profilePicture: user?.profile?.profilePicture || '',
                      coverPhoto: user?.profile?.coverPhoto || '',
                    })}
                    sx={{ textTransform: 'none', borderRadius: 50 }}
                  >
                    Reset
                  </Button>
                </Box>
              </Paper>

              {/* Change Password */}
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Lock sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">Change Password</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth label="Current Password" type="password"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth label="New Password" type="password"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                      helperText="Minimum 6 characters"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth label="Confirm New Password" type="password"
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      error={pwForm.confirmPassword !== '' && pwForm.newPassword !== pwForm.confirmPassword}
                      helperText={pwForm.confirmPassword !== '' && pwForm.newPassword !== pwForm.confirmPassword ? 'Passwords do not match' : ''}
                    />
                  </Grid>
                </Grid>
                <Box mt={3}>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={savingPw ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <Lock />}
                    onClick={handleSavePassword}
                    disabled={savingPw || !pwForm.currentPassword || !pwForm.newPassword}
                    sx={{ textTransform: 'none', borderRadius: 50, px: 3, fontWeight: 600 }}
                  >
                    Update Password
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Right: quick stats */}
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Account Overview</Typography>
                {[
                  { label: 'Total Posts', value: posts.length, icon: <Article sx={{ color: 'primary.main' }} /> },
                  { label: 'Total Likes Received', value: posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0), icon: <ThumbUp sx={{ color: 'secondary.main' }} /> },
                  { label: 'Total Comments', value: posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0), icon: <ChatBubbleOutline sx={{ color: 'info.main' }} /> },
                  { label: 'Connections', value: connections.length, icon: <People sx={{ color: 'success.main' }} /> },
                ].map(({ label, value, icon }) => (
                  <Box key={label} display="flex" justifyContent="space-between" alignItems="center"
                    sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      {icon}
                      <Typography variant="body2">{label}</Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">{value}</Typography>
                  </Box>
                ))}
              </Paper>

              <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2,
                bgcolor: alpha('#F44336', 0.04) }}>
                <Typography variant="subtitle2" fontWeight="bold" color="error.main" gutterBottom>
                  Danger Zone
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                  These actions are permanent and cannot be undone.
                </Typography>
                <Button variant="outlined" color="error" fullWidth
                  sx={{ textTransform: 'none', borderRadius: 50, fontSize: '0.8rem' }}>
                  Deactivate Account
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
