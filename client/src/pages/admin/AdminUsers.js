import React, { useState } from 'react';
import {
  Paper, Box, MenuItem, Select, Table, TableHead, TableRow, TableCell, TableBody, Avatar, IconButton,
  Tooltip, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, TextField, Chip, LinearProgress,
} from '@mui/material';
import { Delete, PauseCircle, Block, CheckCircle } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useAdminList, useToast, SearchBar, ListFooter, ConfirmDialog, ActionCell, errMsg } from './adminCommon';

const ROLES = ['farmer', 'buyer', 'consultant', 'expert', 'admin'];
const STATUS_COLOR = { active: 'success', suspended: 'warning', banned: 'error' };

const AdminUsers = () => {
  const { user: me } = useAuth();
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const list = useAdminList('/admin/users', { filters: { role, status } });
  const [toast, notify] = useToast();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [restrict, setRestrict] = useState(null); // { user, status: 'suspended' | 'banned' }
  const [reason, setReason] = useState('');

  const changeRole = async (u, newRole) => {
    try {
      await api.patch(`/admin/users/${u._id}/role`, { role: newRole });
      list.patchRow(u._id, { role: newRole });
      notify(`${u.name} is now ${newRole}`);
    } catch (err) {
      notify(errMsg(err, 'Failed to change role'), 'error');
    }
  };

  const setUserStatus = async (u, newStatus, why = '') => {
    try {
      const res = await api.patch(`/admin/users/${u._id}/status`, { status: newStatus, reason: why });
      list.patchRow(u._id, { status: res.data.data.status, statusReason: res.data.data.statusReason });
      notify(newStatus === 'active' ? `${u.name} reactivated` : `${u.name} ${newStatus}`);
    } catch (err) {
      notify(errMsg(err, 'Failed to update status'), 'error');
    }
  };

  const submitRestrict = async () => {
    const { user, status: s } = restrict;
    setRestrict(null);
    await setUserStatus(user, s, reason);
    setReason('');
  };

  const deleteUser = async () => {
    const u = confirmDelete;
    setConfirmDelete(null);
    try {
      await api.delete(`/admin/users/${u._id}`);
      notify(`${u.name} deleted`);
      list.reload();
    } catch (err) {
      notify(errMsg(err, 'Failed to delete user'), 'error');
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search name or email…">
        <Select size="small" displayEmpty value={role} onChange={(e) => setRole(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="">All roles</MenuItem>
          {ROLES.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>)}
        </Select>
        <Select size="small" displayEmpty value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="">Any status</MenuItem>
          {['active', 'suspended', 'banned'].map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
        </Select>
      </SearchBar>

      {list.error && <Alert severity="error" sx={{ mb: 2 }}>{list.error}</Alert>}
      {list.loading && <LinearProgress sx={{ mb: 1 }} />}

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Posts</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.rows.map((u) => {
              const isMe = u._id === me?._id;
              const isAdmin = u.role === 'admin';
              return (
                <TableRow key={u._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 200 }}>
                      <Avatar src={u.avatar} alt={u.name} sx={{ width: 36, height: 36 }}>{u.name?.[0]}</Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{u.name}{isMe ? ' (you)' : ''}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{u.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={u.role}
                      disabled={isMe}
                      onChange={(e) => changeRole(u, e.target.value)}
                      sx={{ minWidth: 130, textTransform: 'capitalize' }}
                    >
                      {ROLES.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>)}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={u.statusReason || ''} disableHoverListener={!u.statusReason}>
                      <Chip size="small" label={u.status} color={STATUS_COLOR[u.status]} variant={u.status === 'active' ? 'outlined' : 'filled'} sx={{ textTransform: 'capitalize' }} />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{u.postsCount}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(new Date(u.createdAt), 'dd MMM yyyy')}</TableCell>
                  <ActionCell>
                    {u.status === 'active' ? (
                      <>
                        <Tooltip title={isMe || isAdmin ? 'Admins must be demoted first' : 'Suspend'}>
                          <span>
                            <IconButton color="warning" disabled={isMe || isAdmin} onClick={() => setRestrict({ user: u, status: 'suspended' })}><PauseCircle /></IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={isMe || isAdmin ? 'Admins must be demoted first' : 'Ban'}>
                          <span>
                            <IconButton color="error" disabled={isMe || isAdmin} onClick={() => setRestrict({ user: u, status: 'banned' })}><Block /></IconButton>
                          </span>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Reactivate">
                        <IconButton color="success" onClick={() => setUserStatus(u, 'active')}><CheckCircle /></IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={isMe ? 'You cannot delete yourself' : 'Delete user'}>
                      <span>
                        <IconButton color="error" disabled={isMe} onClick={() => setConfirmDelete(u)}><Delete /></IconButton>
                      </span>
                    </Tooltip>
                  </ActionCell>
                </TableRow>
              );
            })}
            {!list.loading && list.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}><Typography color="text.secondary" align="center">No users found</Typography></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <ListFooter pagination={list.pagination} page={list.page} setPage={list.setPage} noun="users" />

      <Dialog open={Boolean(restrict)} onClose={() => setRestrict(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textTransform: 'capitalize' }}>{restrict?.status === 'banned' ? 'Ban' : 'Suspend'} {restrict?.user.name}?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {restrict?.status === 'banned'
              ? 'They will be signed out and will not be able to log in. You can reactivate them later.'
              : 'They will be signed out and blocked from logging in until you reactivate them.'}
          </DialogContentText>
          <TextField fullWidth size="small" label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} inputProps={{ maxLength: 500 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRestrict(null); setReason(''); }}>Cancel</Button>
          <Button color={restrict?.status === 'banned' ? 'error' : 'warning'} variant="contained" onClick={submitRestrict}>
            {restrict?.status === 'banned' ? 'Ban user' : 'Suspend user'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(confirmDelete)} title="Delete user?" confirmLabel="Delete" onCancel={() => setConfirmDelete(null)} onConfirm={deleteUser}>
        This permanently deletes <strong>{confirmDelete?.name}</strong> and everything they own: posts, comments,
        messages, farms and applications. This cannot be undone. To block someone without deleting their data, use suspend or ban.
      </ConfirmDialog>

      {toast}
    </Paper>
  );
};

export default AdminUsers;
