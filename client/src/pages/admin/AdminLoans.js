import React, { useState } from 'react';
import {
  Paper, Box, Table, TableHead, TableRow, TableCell, TableBody, Typography, Alert, Chip, LinearProgress,
  Select, MenuItem,
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAdminList, useToast, SearchBar, ListFooter, EmptyRow, StatusSelect, errMsg, money } from './adminCommon';

const STATUSES = ['pending', 'approved', 'active', 'rejected', 'closed'];
const COLOR = { pending: 'warning', approved: 'success', active: 'info', rejected: 'error', closed: 'default' };

const AdminLoans = () => {
  const [status, setStatus] = useState('');
  const list = useAdminList('/admin/loans', { filters: { status } });
  const [toast, notify] = useToast();

  const setLoanStatus = async (l, next) => {
    try {
      await api.patch(`/admin/loans/${l._id}`, { status: next });
      list.patchRow(l._id, { status: next });
      notify(`Loan marked ${next}`);
    } catch (err) {
      notify(errMsg(err, 'Failed to update loan'), 'error');
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search applicant or purpose…">
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
              <TableCell>Applicant</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Months</TableCell>
              <TableCell>Applied</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.rows.map((l) => (
              <TableRow key={l._id} hover>
                <TableCell sx={{ minWidth: 180 }}>
                  <Typography variant="body2" fontWeight={600}>{l.userName}</Typography>
                  <Typography variant="caption" color="text.secondary">{l.userEmail}</Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 160 }}>{l.purpose}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{money(l.amount)}</TableCell>
                <TableCell align="right">{l.duration}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(new Date(l.appliedAt), 'dd MMM yyyy')}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip size="small" color={COLOR[l.status]} label={l.status} sx={{ textTransform: 'capitalize', minWidth: 72 }} />
                    <StatusSelect value={l.status} choices={STATUSES} onChange={(v) => setLoanStatus(l, v)} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            <EmptyRow show={!list.loading && list.rows.length === 0} cols={6}>No loans found</EmptyRow>
          </TableBody>
        </Table>
      </Box>
      <ListFooter pagination={list.pagination} page={list.page} setPage={list.setPage} noun="loans" />
      {toast}
    </Paper>
  );
};

export default AdminLoans;
