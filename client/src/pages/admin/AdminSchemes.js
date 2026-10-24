import React, { useState } from 'react';
import {
  Paper, Box, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip, Typography, Alert,
  Button, Chip, LinearProgress, ToggleButton, ToggleButtonGroup, Select, MenuItem,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';
import {
  useAdminList, useToast, SearchBar, ListFooter, ConfirmDialog, FormDialog, EmptyRow, StatusSelect, errMsg, money, options,
} from './adminCommon';

const FIELDS = [
  { name: 'name', label: 'Scheme name', required: true },
  { name: 'type', label: 'Type', type: 'select', options: options(['subsidy', 'loan', 'training', 'insurance']) },
  { name: 'category', label: 'Category', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'benefitAmount', label: 'Benefit amount in LKR (optional)', type: 'number' },
  { name: 'benefitDescription', label: 'Benefit description (optional)' },
  { name: 'eligibility', label: 'Eligibility', type: 'textarea', helper: 'One requirement per line' },
];

const APP_STATUS_COLOR = { pending: 'warning', approved: 'success', rejected: 'error' };

const SchemesTable = () => {
  const list = useAdminList('/admin/schemes');
  const [toast, notify] = useToast();
  const [form, setForm] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const save = async (values) => {
    if (form.scheme) {
      await api.patch(`/admin/schemes/${form.scheme._id}`, values);
      notify('Scheme updated');
    } else {
      await api.post('/admin/schemes', values);
      notify('Scheme created');
    }
    setForm(null);
    list.reload();
  };

  const remove = async () => {
    const s = confirm;
    setConfirm(null);
    try {
      await api.delete(`/admin/schemes/${s._id}`);
      notify('Scheme deleted');
      list.reload();
    } catch (err) {
      notify(errMsg(err, 'Failed to delete scheme'), 'error');
    }
  };

  return (
    <>
      <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search name or category…">
        <Button variant="contained" startIcon={<Add />} onClick={() => setForm({ scheme: null })}>Add scheme</Button>
      </SearchBar>
      {list.error && <Alert severity="error" sx={{ mb: 2 }}>{list.error}</Alert>}
      {list.loading && <LinearProgress sx={{ mb: 1 }} />}

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Scheme</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Benefit</TableCell>
              <TableCell align="right">Applications</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.rows.map((s) => (
              <TableRow key={s._id} hover>
                <TableCell sx={{ minWidth: 240 }}>
                  <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.category}</Typography>
                </TableCell>
                <TableCell><Chip size="small" label={s.type} sx={{ textTransform: 'capitalize' }} /></TableCell>
                <TableCell align="right">{s.benefitAmount != null ? money(s.benefitAmount) : '—'}</TableCell>
                <TableCell align="right">{s.applicationsCount}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Edit"><IconButton onClick={() => setForm({ scheme: { ...s, eligibility: s.eligibility.join('\n') } })}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton color="error" onClick={() => setConfirm(s)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            <EmptyRow show={!list.loading && list.rows.length === 0} cols={5}>No schemes found</EmptyRow>
          </TableBody>
        </Table>
      </Box>
      <ListFooter pagination={list.pagination} page={list.page} setPage={list.setPage} noun="schemes" />

      <FormDialog
        open={Boolean(form)}
        title={form?.scheme ? 'Edit scheme' : 'Add scheme'}
        fields={FIELDS}
        initial={form?.scheme}
        onClose={() => setForm(null)}
        onSubmit={save}
      />
      <ConfirmDialog open={Boolean(confirm)} title="Delete scheme?" confirmLabel="Delete" onCancel={() => setConfirm(null)} onConfirm={remove}>
        <strong>{confirm?.name}</strong> and all {confirm?.applicationsCount} application(s) for it will be permanently deleted.
      </ConfirmDialog>
      {toast}
    </>
  );
};

const ApplicationsTable = () => {
  const [status, setStatus] = useState('');
  const list = useAdminList('/admin/scheme-applications', { filters: { status } });
  const [toast, notify] = useToast();

  const setAppStatus = async (a, next) => {
    try {
      await api.patch(`/admin/scheme-applications/${a._id}`, { status: next });
      list.patchRow(a._id, { status: next });
      notify(`Application ${next}`);
    } catch (err) {
      notify(errMsg(err, 'Failed to update application'), 'error');
    }
  };

  return (
    <>
      <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search applicant or scheme…">
        <Select size="small" displayEmpty value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Any status</MenuItem>
          {['pending', 'approved', 'rejected'].map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
        </Select>
      </SearchBar>
      {list.error && <Alert severity="error" sx={{ mb: 2 }}>{list.error}</Alert>}
      {list.loading && <LinearProgress sx={{ mb: 1 }} />}

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Applicant</TableCell>
              <TableCell>Scheme</TableCell>
              <TableCell>Applied</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.rows.map((a) => (
              <TableRow key={a._id} hover>
                <TableCell sx={{ minWidth: 200 }}>
                  <Typography variant="body2" fontWeight={600}>{a.userName}</Typography>
                  <Typography variant="caption" color="text.secondary">{a.userEmail}</Typography>
                </TableCell>
                <TableCell>{a.schemeName}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(new Date(a.appliedAt), 'dd MMM yyyy')}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip size="small" color={APP_STATUS_COLOR[a.status]} label={a.status} sx={{ textTransform: 'capitalize', minWidth: 80 }} />
                    <StatusSelect value={a.status} choices={['pending', 'approved', 'rejected']} onChange={(v) => setAppStatus(a, v)} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            <EmptyRow show={!list.loading && list.rows.length === 0} cols={4}>No applications found</EmptyRow>
          </TableBody>
        </Table>
      </Box>
      <ListFooter pagination={list.pagination} page={list.page} setPage={list.setPage} noun="applications" />
      {toast}
    </>
  );
};

const AdminSchemes = () => {
  const [view, setView] = useState('schemes');
  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={view}
        onChange={(_, v) => v && setView(v)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="schemes" sx={{ textTransform: 'none', px: 2 }}>Schemes</ToggleButton>
        <ToggleButton value="applications" sx={{ textTransform: 'none', px: 2 }}>Applications</ToggleButton>
      </ToggleButtonGroup>
      {view === 'schemes' ? <SchemesTable /> : <ApplicationsTable />}
    </Paper>
  );
};

export default AdminSchemes;
