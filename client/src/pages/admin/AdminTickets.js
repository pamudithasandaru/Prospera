import React, { useState } from 'react';
import {
  Paper, Box, Table, TableHead, TableRow, TableCell, TableBody, Typography, Alert, Chip, LinearProgress,
  Select, MenuItem, Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAdminList, useToast, SearchBar, ListFooter, EmptyRow, StatusSelect, errMsg } from './adminCommon';

const STATUSES = ['open', 'pending', 'resolved', 'closed'];
const COLOR = { open: 'error', pending: 'warning', resolved: 'success', closed: 'default' };

const AdminTickets = () => {
  const [status, setStatus] = useState('');
  const list = useAdminList('/admin/tickets', { filters: { status } });
  const [toast, notify] = useToast();

  const setTicketStatus = async (t, next) => {
    try {
      await api.patch(`/admin/tickets/${t._id}`, { status: next });
      list.patchRow(t._id, { status: next });
      notify(`Ticket marked ${next}`);
    } catch (err) {
      notify(errMsg(err, 'Failed to update ticket'), 'error');
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search subject or user…">
        <Select size="small" displayEmpty value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Any status</MenuItem>
          {STATUSES.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
        </Select>
      </SearchBar>
      {list.error && <Alert severity="error" sx={{ mb: 2 }}>{list.error}</Alert>}
      {list.loading && <LinearProgress sx={{ mb: 1 }} />}

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ticket</TableCell>
              <TableCell>From</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.rows.map((t) => (
              <TableRow key={t._id} hover>
                <TableCell sx={{ minWidth: 260, maxWidth: 420 }}>
                  <Typography variant="body2" fontWeight={600}>{t.subject}</Typography>
                  {t.description && (
                    <Tooltip title={t.description} placement="bottom-start">
                      <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {t.description}
                      </Typography>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell sx={{ minWidth: 170 }}>
                  <Typography variant="body2">{t.userName}</Typography>
                  <Typography variant="caption" color="text.secondary">{t.userEmail}</Typography>
                </TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{t.category}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(new Date(t.createdAt), 'dd MMM yyyy')}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip size="small" color={COLOR[t.status]} label={t.status} sx={{ textTransform: 'capitalize', minWidth: 72 }} />
                    <StatusSelect value={t.status} choices={STATUSES} onChange={(v) => setTicketStatus(t, v)} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            <EmptyRow show={!list.loading && list.rows.length === 0} cols={5}>No tickets found</EmptyRow>
          </TableBody>
        </Table>
      </Box>
      <ListFooter pagination={list.pagination} page={list.page} setPage={list.setPage} noun="tickets" />
      {toast}
    </Paper>
  );
};

export default AdminTickets;
