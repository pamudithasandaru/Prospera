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

const CROP_STATUS_OPTIONS = ['growing', 'harvested', 'failed', 'planned'];

const CropFormDialog = ({ open, onClose, onSubmit, crop = null }) => {
  const isEdit = Boolean(crop);
  const [formData, setFormData] = useState({
    cropName: '',
    variety: '',
    area: '',
    plantedDate: '',
    status: 'growing',
    expectedYield: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (crop) {
      setFormData({
        cropName: crop.cropName || '',
        variety: crop.variety || '',
        area: crop.area || '',
        plantedDate: crop.plantedDate
          ? new Date(crop.plantedDate).toISOString().split('T')[0]
          : '',
        status: crop.status || 'growing',
        expectedYield: crop.expectedYield || '',
      });
    } else {
      setFormData({
        cropName: '',
        variety: '',
        area: '',
        plantedDate: new Date().toISOString().split('T')[0],
        status: 'growing',
        expectedYield: '',
      });
    }
    setErrors({});
  }, [crop, open]);

  const validate = () => {
    const errs = {};
    if (!formData.cropName.trim()) errs.cropName = 'Crop name is required';
    if (!formData.area || Number(formData.area) <= 0)
      errs.area = 'Area must be greater than 0';
    if (!formData.plantedDate) errs.plantedDate = 'Planted date is required';
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
        cropName: formData.cropName.trim(),
        variety: formData.variety.trim(),
        area: Number(formData.area),
        plantedDate: new Date(formData.plantedDate).toISOString(),
        status: formData.status,
        expectedYield: formData.expectedYield ? Number(formData.expectedYield) : 0,
      });
      onClose();
    } catch (err) {
      console.error('Crop form error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {isEdit ? 'Edit Crop' : 'Add Crop'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
          <TextField
            label="Crop Name"
            name="cropName"
            value={formData.cropName}
            onChange={handleChange}
            error={Boolean(errors.cropName)}
            helperText={errors.cropName}
            fullWidth
            placeholder="e.g. Paddy, Chilli, Maize"
          />
          <TextField
            label="Variety"
            name="variety"
            value={formData.variety}
            onChange={handleChange}
            fullWidth
            placeholder="e.g. BG 360, MI Green"
          />
          <Box display="flex" gap={2}>
            <TextField
              label="Area (acres)"
              name="area"
              type="number"
              value={formData.area}
              onChange={handleChange}
              error={Boolean(errors.area)}
              helperText={errors.area}
              fullWidth
              inputProps={{ min: 0.1, step: 0.1 }}
            />
            <TextField
              label="Expected Yield (kg)"
              name="expectedYield"
              type="number"
              value={formData.expectedYield}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>
          <Box display="flex" gap={2}>
            <TextField
              label="Planted Date"
              name="plantedDate"
              type="date"
              value={formData.plantedDate}
              onChange={handleChange}
              error={Boolean(errors.plantedDate)}
              helperText={errors.plantedDate}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
            >
              {CROP_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update Crop' : 'Add Crop'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CropFormDialog;
