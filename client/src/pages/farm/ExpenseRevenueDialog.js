import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Box, IconButton, Typography,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { Close, TrendingUp, TrendingDown } from '@mui/icons-material';

const EXPENSE_CATS = [
  'Fertilizer','Labor','Irrigation','Machinery','Pesticides',
  'Seeds','Transport','Storage','Packaging','Other',
];

const ExpenseRevenueDialog = ({ open, onClose, onSubmit, type: initType = 'expense' }) => {
  const [entryType, setEntryType] = useState(initType);
  const [form, setForm] = useState({ category:'', amount:'', description:'', date: new Date().toISOString().split('T')[0], label:'', totalAmount:'' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEntryType(initType);
    setForm({ category:'', amount:'', description:'', date: new Date().toISOString().split('T')[0], label:'', totalAmount:'' });
    setErrors({});
  }, [initType, open]);

  const validate = () => {
    const e = {};
    if (entryType === 'expense') {
      if (!form.category) e.category = 'Required';
      if (!form.amount || Number(form.amount) <= 0) e.amount = 'Must be > 0';
    } else {
      if (!form.label.trim()) e.label = 'Required';
      if (!form.totalAmount || Number(form.totalAmount) <= 0) e.totalAmount = 'Must be > 0';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (entryType === 'expense') {
        await onSubmit('expense', { category: form.category, amount: Number(form.amount), description: form.description.trim(), date: form.date });
      } else {
        await onSubmit('revenue', { label: form.label.trim(), totalAmount: Number(form.totalAmount), description: form.description.trim(), date: form.date });
      }
      onClose();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {entryType === 'expense' ? 'Add Expense' : 'Record Revenue'}
          </Typography>
          <IconButton onClick={onClose} size="small"><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
          <ToggleButtonGroup value={entryType} exclusive onChange={(_, v) => v && setEntryType(v)} fullWidth size="small">
            <ToggleButton value="expense" sx={{ gap: 1 }}><TrendingDown fontSize="small" /> Expense</ToggleButton>
            <ToggleButton value="revenue" sx={{ gap: 1 }}><TrendingUp fontSize="small" /> Revenue</ToggleButton>
          </ToggleButtonGroup>

          {entryType === 'expense' ? (
            <>
              <TextField select label="Category" name="category" value={form.category} onChange={handleChange} error={!!errors.category} helperText={errors.category} fullWidth>
                {EXPENSE_CATS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <TextField label="Amount (LKR)" name="amount" type="number" value={form.amount} onChange={handleChange} error={!!errors.amount} helperText={errors.amount} fullWidth inputProps={{ min: 1 }} />
            </>
          ) : (
            <>
              <TextField label="Revenue Source" name="label" value={form.label} onChange={handleChange} error={!!errors.label} helperText={errors.label} fullWidth placeholder="e.g. Paddy, Maize" />
              <TextField label="Total Amount (LKR)" name="totalAmount" type="number" value={form.totalAmount} onChange={handleChange} error={!!errors.totalAmount} helperText={errors.totalAmount} fullWidth inputProps={{ min: 1 }} />
            </>
          )}

          <TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Description (optional)" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={2} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving} color={entryType === 'expense' ? 'error' : 'success'}>
          {saving ? 'Saving...' : entryType === 'expense' ? 'Add Expense' : 'Record Revenue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseRevenueDialog;
