import React, { useState } from 'react';
import {
  Paper, Box, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip, Typography, Alert,
  Chip, Switch, Select, MenuItem, LinearProgress,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAdminList, useToast, SearchBar, ListFooter, ConfirmDialog, EmptyRow, errMsg, money } from './adminCommon';

const AdminListings = () => {
  const [type, setType] = useState('');
  const list = useAdminList('/admin/listings', { filters: { type } });
  const [toast, notify] = useToast();
  const [confirm, setConfirm] = useState(null);

  const toggleVerified = async (l) => {
    try {
      await api.patch(`/admin/listings/${l._id}`, { sellerVerified: !l.sellerVerified });
      list.patchRow(l._id, { sellerVerified: !l.sellerVerified });
      notify(l.sellerVerified ? 'Seller verification removed' : 'Seller verified');
    } catch (err) {
      notify(errMsg(err, 'Failed to update listing'), 'error');
    }
  };

  const remove = async () => {
    const l = confirm;
    setConfirm(null);
    try {
      await api.delete(`/admin/listings/${l._id}`);
      notify('Listing deleted');
      list.reload();
    } catch (err) {
      notify(errMsg(err, 'Failed to delete listing'), 'error');
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search product, category or seller…">
        <Select size="small" displayEmpty value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="">All types</MenuItem>
          <MenuItem value="domestic">Domestic</MenuItem>
          <MenuItem value="export">Export</MenuItem>
        </Select>
      </SearchBar>
      {list.error && <Alert severity="error" sx={{ mb: 2 }}>{list.error}</Alert>}
      {list.loading && <LinearProgress sx={{ mb: 1 }} />}

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Listing</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Price / unit</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Seller</TableCell>
              <TableCell align="center">Verified</TableCell>
              <TableCell>Listed</TableCell>
              <TableCell align="right">Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.rows.map((l) => (
              <TableRow key={l._id} hover>
                <TableCell sx={{ minWidth: 180 }}>
                  <Typography variant="body2" fontWeight={600}>{l.productName}</Typography>
                  <Typography variant="caption" color="text.secondary">{l.category}{l.district ? ` · ${l.district}` : ''}</Typography>
                </TableCell>
                <TableCell><Chip size="small" label={l.type} sx={{ textTransform: 'capitalize' }} /></TableCell>
                <TableCell align="right">{money(l.pricePerUnit)}</TableCell>
                <TableCell>{l.quantity}</TableCell>
                <TableCell>{l.sellerName}</TableCell>
                <TableCell align="center">
                  <Tooltip title={l.sellerVerified ? 'Remove verification' : 'Mark seller as verified'}>
                    <Switch size="small" checked={l.sellerVerified} onChange={() => toggleVerified(l)} />
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(new Date(l.createdAt), 'dd MMM yyyy')}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Delete listing"><IconButton color="error" onClick={() => setConfirm(l)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            <EmptyRow show={!list.loading && list.rows.length === 0} cols={8}>No listings found</EmptyRow>
          </TableBody>
        </Table>
      </Box>
      <ListFooter pagination={list.pagination} page={list.page} setPage={list.setPage} noun="listings" />

      <ConfirmDialog open={Boolean(confirm)} title="Delete listing?" confirmLabel="Delete" onCancel={() => setConfirm(null)} onConfirm={remove}>
        The listing <strong>{confirm?.productName}</strong> will be removed from the wholesale market.
      </ConfirmDialog>
      {toast}
    </Paper>
  );
};

export default AdminListings;
