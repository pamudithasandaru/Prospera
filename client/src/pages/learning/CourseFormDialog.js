import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close,
  Add,
  Delete,
  VideoLibrary,
  LibraryBooks,
} from '@mui/icons-material';

const CATEGORIES = [
  { value: 'crop-management', label: 'Crop Management' },
  { value: 'soil-science', label: 'Soil Science' },
  { value: 'pest-control', label: 'Pest Control' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'organic-farming', label: 'Organic Farming' },
  { value: 'business', label: 'Agri-Business' },
];

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const emptyForm = {
  title: '',
  description: '',
  category: 'crop-management',
  level: 'beginner',
  duration: '',
  thumbnail: '',
  videos: [],
  materials: [],
};

export default function CourseFormDialog({ open, onClose, onSave, course, saving }) {
  const isEdit = Boolean(course);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (course) {
      setForm({
        title: course.title || '',
        description: course.description || '',
        category: course.category || 'crop-management',
        level: course.level || 'beginner',
        duration: course.duration || '',
        thumbnail: course.thumbnail || course.image || '',
        videos: course.videos || [],
        materials: course.materials || [],
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [course, open]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // ── Videos management ──────────────────────────────────────────────────────
  const addVideo = () => {
    setForm((prev) => ({
      ...prev,
      videos: [...prev.videos, { videoId: '', title: '' }],
    }));
  };

  const updateVideo = (idx, field, value) => {
    setForm((prev) => {
      const videos = [...prev.videos];
      videos[idx] = { ...videos[idx], [field]: value };
      return { ...prev, videos };
    });
  };

  const removeVideo = (idx) => {
    setForm((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== idx),
    }));
  };

  // ── Materials management ───────────────────────────────────────────────────
  const addMaterial = () => {
    setForm((prev) => ({
      ...prev,
      materials: [...prev.materials, { title: '', format: 'PDF', size: '' }],
    }));
  };

  const updateMaterial = (idx, field, value) => {
    setForm((prev) => {
      const materials = [...prev.materials];
      materials[idx] = { ...materials[idx], [field]: value };
      return { ...prev, materials };
    });
  };

  const removeMaterial = (idx) => {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== idx),
    }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!form.title.trim()) return setError('Title is required');
    if (!form.description.trim()) return setError('Description is required');
    if (!form.duration || Number(form.duration) <= 0) return setError('Duration must be a positive number');
    setError('');
    onSave({
      ...form,
      duration: Number(form.duration),
      // Filter out empty video/material entries
      videos: form.videos.filter((v) => v.videoId && v.title),
      materials: form.materials.filter((m) => m.title),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          {isEdit ? '✏️ Edit Course' : '➕ Create New Course'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              label="Course Title"
              fullWidth
              required
              value={form.title}
              onChange={handleChange('title')}
              placeholder="e.g. Modern Crop Management Fundamentals"
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              required
              multiline
              rows={4}
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Describe what students will learn in this course..."
            />
          </Grid>

          {/* Category & Level */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Category"
              select
              fullWidth
              value={form.category}
              onChange={handleChange('category')}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Level"
              select
              fullWidth
              value={form.level}
              onChange={handleChange('level')}
            >
              {LEVELS.map((l) => (
                <MenuItem key={l.value} value={l.value}>
                  {l.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Duration (hours)"
              type="number"
              fullWidth
              required
              value={form.duration}
              onChange={handleChange('duration')}
              inputProps={{ min: 1 }}
            />
          </Grid>

          {/* Thumbnail */}
          <Grid item xs={12}>
            <TextField
              label="Thumbnail URL"
              fullWidth
              value={form.thumbnail}
              onChange={handleChange('thumbnail')}
              placeholder="https://images.unsplash.com/..."
              helperText="Paste an image URL for the course thumbnail"
            />
          </Grid>

          {/* ── Videos Section ── */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 1 }} />
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <VideoLibrary color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Videos
                </Typography>
                <Chip label={form.videos.length} size="small" color="primary" variant="outlined" />
              </Box>
              <Button size="small" startIcon={<Add />} onClick={addVideo}>
                Add Video
              </Button>
            </Box>

            {form.videos.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                No videos added yet. Click "Add Video" to add lesson videos.
              </Typography>
            ) : (
              form.videos.map((video, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    mb: 1.5,
                    p: 1.5,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>
                    {idx + 1}.
                  </Typography>
                  <TextField
                    label="Video Title"
                    size="small"
                    value={video.title}
                    onChange={(e) => updateVideo(idx, 'title', e.target.value)}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    label="YouTube Video ID"
                    size="small"
                    value={video.videoId}
                    onChange={(e) => updateVideo(idx, 'videoId', e.target.value)}
                    placeholder="e.g. dQw4w9WgXcQ"
                    sx={{ flex: 1 }}
                  />
                  <IconButton size="small" color="error" onClick={() => removeVideo(idx)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))
            )}
          </Grid>

          {/* ── Materials Section ── */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 1 }} />
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <LibraryBooks color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Reading Materials
                </Typography>
                <Chip label={form.materials.length} size="small" color="primary" variant="outlined" />
              </Box>
              <Button size="small" startIcon={<Add />} onClick={addMaterial}>
                Add Material
              </Button>
            </Box>

            {form.materials.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                No materials added yet. Click "Add Material" to attach resources.
              </Typography>
            ) : (
              form.materials.map((mat, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    mb: 1.5,
                    p: 1.5,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    label="Material Title"
                    size="small"
                    value={mat.title}
                    onChange={(e) => updateMaterial(idx, 'title', e.target.value)}
                    sx={{ flex: 2 }}
                  />
                  <TextField
                    label="Format"
                    size="small"
                    select
                    value={mat.format || 'PDF'}
                    onChange={(e) => updateMaterial(idx, 'format', e.target.value)}
                    sx={{ flex: 0.7 }}
                  >
                    {['PDF', 'XLSX', 'DOCX', 'PPTX', 'ZIP'].map((f) => (
                      <MenuItem key={f} value={f}>{f}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Size"
                    size="small"
                    value={mat.size || ''}
                    onChange={(e) => updateMaterial(idx, 'size', e.target.value)}
                    placeholder="e.g. 2.4 MB"
                    sx={{ flex: 0.8 }}
                  />
                  <IconButton size="small" color="error" onClick={() => removeMaterial(idx)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
          sx={{ px: 4, fontWeight: 700 }}
        >
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Course'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
