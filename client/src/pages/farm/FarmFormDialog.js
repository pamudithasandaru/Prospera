import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

const FarmFormDialog = ({ open, onClose, onSubmit, farm = null }) => {
  const isEdit = Boolean(farm);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    landSize: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || '',
        location: farm.location || '',
        landSize: farm.landSize || '',
      });
    } else {
      setFormData({ name: '', location: '', landSize: '' });
    }
    setErrors({});
  }, [farm, open]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Farm name is required';
    if (!formData.location) errs.location = 'Location is required';
    if (!formData.landSize || Number(formData.landSize) <= 0)
      errs.landSize = 'Land size must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        location: formData.location,
        landSize: Number(formData.landSize),
      });
      onClose();
    } catch (err) {
      console.error('Farm form error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {isEdit ? 'Edit Farm' : 'Register New Farm'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
          <TextField
            label="Farm Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
            placeholder="e.g. Green Valley Farms"
          />
          <TextField
            select
            label="Location (District)"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={Boolean(errors.location)}
            helperText={errors.location}
            fullWidth
          >
            {SRI_LANKA_DISTRICTS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Land Size (acres)"
            name="landSize"
            type="number"
            value={formData.landSize}
            onChange={handleChange}
            error={Boolean(errors.landSize)}
            helperText={errors.landSize}
            fullWidth
            inputProps={{ min: 0.1, step: 0.1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Farm' : 'Create Farm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FarmFormDialog;
