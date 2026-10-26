import React, { useState } from 'react';
import {
  Paper, Box, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip, Typography, Alert,
  Button, Chip, Avatar, LinearProgress,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import api from '../../services/api';
import { useAdminList, useToast, SearchBar, ListFooter, ConfirmDialog, FormDialog, EmptyRow, ActionCell, errMsg, usd } from './adminCommon';

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'category', label: 'Category', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'price', label: 'Price ($)', type: 'number', required: true },
  { name: 'originalPrice', label: 'Original price (optional, shows a discount)', type: 'number' },
  { name: 'stock', label: 'Stock', type: 'number', required: true, step: 1 },
  { name: 'image', label: 'Image URL (optional)' },
  { name: 'freeShipping', label: 'Free shipping', type: 'switch' },
];

const AdminProducts = () => {
  const list = useAdminList('/admin/products');
  const [toast, notify] = useToast();
  const [form, setForm] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const save = async (values) => {
    if (form.product) {
      await api.patch(`/admin/products/${form.product._id}`, values);
      notify('Product updated');
    } else {
      await api.post('/admin/products', values);
      notify('Product created');
    }
    setForm(null);
    list.reload();
  };

  const remove = async () => {
    const p = confirm;
    setConfirm(null);
    try {
      await api.delete(`/admin/products/${p._id}`);
      notify('Product deleted');
      list.reload();
    } catch (err) {
      notify(errMsg(err, 'Failed to delete product'), 'error');
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search name or category…">
        <Button variant="contained" startIcon={<Add />} onClick={() => setForm({ product: null })}>Add product</Button>
      </SearchBar>
      {list.error && <Alert severity="error" sx={{ mb: 2 }}>{list.error}</Alert>}
      {list.loading && <LinearProgress sx={{ mb: 1 }} />}

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell>Shipping</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.rows.map((p) => (
              <TableRow key={p._id} hover>
                <TableCell sx={{ minWidth: 220 }}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar variant="rounded" src={p.image} alt={p.name} sx={{ width: 40, height: 40 }}>{p.name?.[0]}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.category}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {usd(p.price)}
                  {p.originalPrice ? (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ textDecoration: 'line-through' }}>
                      {usd(p.originalPrice)}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell align="right">
                  <Chip size="small" label={p.stock} color={p.stock === 0 ? 'error' : p.stock < 5 ? 'warning' : 'default'} />
                </TableCell>
                <TableCell>{p.freeShipping ? 'Free' : '—'}</TableCell>
                <ActionCell>
                  <Tooltip title="Edit"><IconButton onClick={() => setForm({ product: p })}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton color="error" onClick={() => setConfirm(p)}><Delete /></IconButton></Tooltip>
                </ActionCell>
              </TableRow>
            ))}
            <EmptyRow show={!list.loading && list.rows.length === 0} cols={5}>No products found</EmptyRow>
          </TableBody>
        </Table>
      </Box>
      <ListFooter pagination={list.pagination} page={list.page} setPage={list.setPage} noun="products" />

      <FormDialog
        open={Boolean(form)}
        title={form?.product ? 'Edit product' : 'Add product'}
        fields={FIELDS}
        initial={form?.product}
        onClose={() => setForm(null)}
        onSubmit={save}
      />
      <ConfirmDialog open={Boolean(confirm)} title="Delete product?" confirmLabel="Delete" onCancel={() => setConfirm(null)} onConfirm={remove}>
        <strong>{confirm?.name}</strong> will be removed from the marketplace and from anyone's cart.
      </ConfirmDialog>
      {toast}
    </Paper>
  );
};

export default AdminProducts;
