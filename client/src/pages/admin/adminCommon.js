import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControlLabel, InputAdornment, MenuItem, Pagination, Select, Snackbar, Switch, TextField, Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import api from '../../services/api';

export const errMsg = (err, fallback) => err?.response?.data?.message || fallback;

export const money = (n) => `LKR ${Number(n || 0).toLocaleString()}`;

// Marketplace products are shown to customers in US dollars.
export const usd = (n) => `$${Number(n || 0).toLocaleString()}`;

export const useDebounced = (value, ms = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

/**
 * Paginated, searchable, filterable list backed by an /admin/* endpoint.
 * `filters` is a plain object of extra query params (e.g. { status: 'open' }).
 */
export const useAdminList = (path, { limit = 10, filters = {} } = {}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState({ rows: [], pagination: { page: 1, pages: 1, total: 0 }, loading: true, error: '' });
  const filtersKey = JSON.stringify(filters);

  useEffect(() => { setPage(1); }, [debounced, filtersKey]);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    api
      .get(path, { params: { page, limit, search: debounced, ...JSON.parse(filtersKey) } })
      .then((res) => {
        if (!cancelled) setState({ rows: res.data.data, pagination: res.data.pagination, loading: false, error: '' });
      })
      .catch((err) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: errMsg(err, 'Failed to load data') }));
      });
    return () => { cancelled = true; };
  }, [path, page, limit, debounced, filtersKey, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const patchRow = useCallback(
    (id, changes) => setState((s) => ({ ...s, rows: s.rows.map((r) => (r._id === id ? { ...r, ...changes } : r)) })),
    [],
  );

  return { ...state, page, setPage, search, setSearch, reload, patchRow };
};

/** Snackbar + notify(message, severity). Render `toast` once inside the component. */
export const useToast = () => {
  const [t, setT] = useState({ open: false, message: '', severity: 'success' });
  const notify = useCallback((message, severity = 'success') => setT({ open: true, message, severity }), []);
  const close = () => setT((x) => ({ ...x, open: false }));
  const toast = (
    <Snackbar open={t.open} autoHideDuration={4000} onClose={close}>
      <Alert severity={t.severity} onClose={close} sx={{ width: '100%' }}>{t.message}</Alert>
    </Snackbar>
  );
  return [toast, notify];
};

/** Search box plus any extra controls (filters, "Add" button) passed as children. */
export const SearchBar = ({ value, onChange, placeholder = 'Search…', children }) => (
  <Box display="flex" gap={2} flexWrap="wrap" mb={2} alignItems="center">
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ flex: '1 1 240px' }}
      InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
    />
    {children}
  </Box>
);

export const ListFooter = ({ pagination, page, setPage, noun }) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} flexWrap="wrap" gap={1}>
    <Typography variant="caption" color="text.secondary">{pagination.total} {noun}</Typography>
    <Pagination count={pagination.pages} page={page} onChange={(_, p) => setPage(p)} size="small" />
  </Box>
);

export const ConfirmDialog = ({ open, title, children, confirmLabel = 'Confirm', color = 'error', onCancel, onConfirm }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent><DialogContentText component="div">{children}</DialogContentText></DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button color={color} variant="contained" onClick={onConfirm}>{confirmLabel}</Button>
    </DialogActions>
  </Dialog>
);

/**
 * Generic create/edit dialog.
 * fields: [{ name, label, type: 'text'|'number'|'textarea'|'select'|'switch', options?, required?, helper? }]
 * onSubmit(values) may throw; the message is shown inline.
 */
export const FormDialog = ({ open, title, fields, initial, submitLabel = 'Save', onClose, onSubmit }) => {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(Object.fromEntries(fields.map((f) => [f.name, initial?.[f.name] ?? (f.type === 'switch' ? false : f.type === 'select' ? f.options[0].value : '')])));
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit(values);
    } catch (err) {
      setError(errMsg(err, 'Something went wrong'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <form onSubmit={submit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            {fields.map((f) =>
              f.type === 'switch' ? (
                <FormControlLabel
                  key={f.name}
                  label={f.label}
                  control={<Switch checked={Boolean(values[f.name])} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.checked }))} />}
                />
              ) : (
                <TextField
                  key={f.name}
                  size="small"
                  fullWidth
                  label={f.label}
                  required={f.required}
                  helperText={f.helper}
                  type={f.type === 'number' ? 'number' : 'text'}
                  select={f.type === 'select'}
                  multiline={f.type === 'textarea'}
                  minRows={f.type === 'textarea' ? 3 : undefined}
                  inputProps={f.type === 'number' ? { min: 0, step: f.step || 'any' } : undefined}
                  value={values[f.name] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                >
                  {f.type === 'select' && f.options.map((o) => (
                    <MenuItem key={o.value} value={o.value} sx={{ textTransform: 'capitalize' }}>{o.label}</MenuItem>
                  ))}
                </TextField>
              ),
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : submitLabel}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export const options = (list) => list.map((v) => ({ value: v, label: v }));

/** Compact status dropdown used in table rows. */
export const StatusSelect = ({ value, choices, onChange, disabled }) => (
  <Select size="small" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} sx={{ minWidth: 130, textTransform: 'capitalize' }}>
    {choices.map((c) => <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>)}
  </Select>
);

/** Shared "table inside a scrollable box" with an empty state. */
export const EmptyRow = ({ show, cols, children = 'Nothing found' }) =>
  show ? (
    <tr>
      <td colSpan={cols} style={{ padding: 24, textAlign: 'center', opacity: 0.6 }}>{children}</td>
    </tr>
  ) : null;
