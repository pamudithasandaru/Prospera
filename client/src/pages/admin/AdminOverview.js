import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Chip, Skeleton, Alert, List, ListItem, ListItemText } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';

const STAT_CARDS = [
  { key: 'users', label: 'Total Users' },
  { key: 'newUsers7d', label: 'New This Week' },
  { key: 'posts', label: 'Posts' },
  { key: 'comments', label: 'Comments' },
  { key: 'courses', label: 'Courses' },
  { key: 'listings', label: 'Market Listings' },
  { key: 'products', label: 'Marketplace Products' },
  { key: 'openTickets', label: 'Open Tickets' },
  { key: 'pendingLoans', label: 'Pending Loans' },
  { key: 'pendingApplications', label: 'Pending Scheme Applications' },
  { key: 'restrictedUsers', label: 'Suspended / Banned Users' },
];

const ago = (d) => formatDistanceToNow(new Date(d), { addSuffix: true });

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/admin/stats')
      .then((res) => !cancelled && setData(res.data.data))
      .catch((err) => !cancelled && setError(err.response?.data?.message || 'Failed to load overview'));
    return () => { cancelled = true; };
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Grid container spacing={3}>
        {STAT_CARDS.map((c) => (
          <Grid item xs={6} md={3} key={c.key}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              {data ? (
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {data.totals[c.key]}
                </Typography>
              ) : (
                <Skeleton width={60} height={44} />
              )}
              <Typography variant="body2" color="text.secondary">{c.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>Users by role</Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {data
            ? Object.entries(data.usersByRole).map(([role, n]) => (
                <Chip key={role} label={`${role}: ${n}`} sx={{ textTransform: 'capitalize' }} />
              ))
            : <Skeleton width={260} height={32} />}
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold">Recent signups</Typography>
            <List dense>
              {(data?.recentUsers || []).map((u) => (
                <ListItem key={u._id} disableGutters>
                  <ListItemText
                    primary={`${u.name} · ${u.role}`}
                    secondary={`${u.email} — ${ago(u.createdAt)}`}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
              ))}
              {data && data.recentUsers.length === 0 && (
                <Typography variant="body2" color="text.secondary">No users yet.</Typography>
              )}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold">Recent posts</Typography>
            <List dense>
              {(data?.recentPosts || []).map((p) => (
                <ListItem key={p._id} disableGutters>
                  <ListItemText
                    primary={p.text || '(no text)'}
                    secondary={`${p.authorName} — ${ago(p.createdAt)}`}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
              ))}
              {data && data.recentPosts.length === 0 && (
                <Typography variant="body2" color="text.secondary">No posts yet.</Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default AdminOverview;
