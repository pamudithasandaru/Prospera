import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Button, LinearProgress,
  Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow,
  Tab, Tabs, Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Tooltip, CircularProgress,
} from '@mui/material';
import {
  Add, Edit, Delete, Terrain, Refresh, Agriculture, AutoAwesome,
  Visibility, AddCircleOutline, Close,
} from '@mui/icons-material';
import api from '../../services/api';
import FarmFormDialog from './FarmFormDialog';
import CropFormDialog from './CropFormDialog';
import ExpenseRevenueDialog from './ExpenseRevenueDialog';
import FarmInsightsPanel from './FarmInsightsPanel';
import { DUMMY_FARMS, computeFarmInsights } from './dummyFarms';
import DummyFarmCard from './DummyFarmCard';
import { neuColors, raised } from '../../neumorphic';

const FarmDashboard = () => {
  const [farms, setFarms] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // Preview & Dummy Farms state
  const [previewFarm, setPreviewFarm] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [importingId, setImportingId] = useState(null);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);

  // Dialog states
  const [farmDialog, setFarmDialog] = useState({ open: false, farm: null });
  const [cropDialog, setCropDialog] = useState({ open: false, crop: null, index: -1 });
  const [financeDialog, setFinanceDialog] = useState({ open: false, type: 'expense' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, farmId: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  // Currently viewed farm: preview farm takes precedence over real farm
  const selectedFarm = previewFarm || farms[selectedIdx] || null;

  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  };

  // ── Fetch farms ────────────────────────────────────────────────────────────
  const fetchFarms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/farm');
      const data = res.data.data || [];
      setFarms(data);
      if (data.length > 0 && selectedIdx >= data.length) setSelectedIdx(0);
    } catch (err) {
      console.error('Error fetching farms:', err);
      showSnack('Failed to load farms', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedIdx]);

  // ── Fetch insights ─────────────────────────────────────────────────────────
  const fetchInsights = useCallback(async (farmId) => {
    try {
      const res = await api.get(`/farm/${farmId}/insights`);
      setInsights(res.data.data);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setInsights(null);
    }
  }, []);

  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    if (previewFarm) {
      setInsights(computeFarmInsights(previewFarm));
    } else if (selectedFarm?._id) {
      fetchInsights(selectedFarm._id);
    } else {
      setInsights(null);
    }
  }, [previewFarm, selectedFarm?._id, fetchInsights]);

  // ── Create Farm ────────────────────────────────────────────────────────────
  const handleCreateFarm = async (data) => {
    try {
      const res = await api.post('/farm', data);
      if (res.data.success) {
        showSnack('Farm created successfully!');
        setPreviewFarm(null);
        await fetchFarms();
        setSelectedIdx(farms.length); // Select newly created
      }
    } catch (err) {
      showSnack(err.response?.data?.message || 'Failed to create farm', 'error');
    }
  };

  // ── Update Farm ────────────────────────────────────────────────────────────
  const handleUpdateFarm = async (data) => {
    if (previewFarm) {
      const updated = { ...previewFarm, ...data };
      setPreviewFarm(updated);
      setInsights(computeFarmInsights(updated));
      showSnack('Updated preview farm!');
      return;
    }

    try {
      const res = await api.put(`/farm/${selectedFarm._id}`, data);
      if (res.data.success) {
        showSnack('Farm updated successfully!');
        await fetchFarms();
      }
    } catch (err) {
      showSnack('Failed to update farm', 'error');
    }
  };

  // ── Delete Farm ────────────────────────────────────────────────────────────
  const handleDeleteFarm = async () => {
    if (previewFarm) {
      setPreviewFarm(null);
      setDeleteDialog({ open: false, farmId: null });
      showSnack('Exited preview mode');
      return;
    }

    try {
      const res = await api.delete(`/farm/${deleteDialog.farmId}`);
      if (res.data.success) {
        showSnack('Farm deleted successfully!');
        setDeleteDialog({ open: false, farmId: null });
        setSelectedIdx(0);
        await fetchFarms();
      }
    } catch (err) {
      showSnack('Failed to delete farm', 'error');
    }
  };

  // ── Add/Edit Crop ──────────────────────────────────────────────────────────
  const handleCropSubmit = async (cropData) => {
    if (previewFarm) {
      const crops = [...(previewFarm.currentCrops || [])];
      if (cropDialog.index >= 0) {
        crops[cropDialog.index] = cropData;
      } else {
        crops.push(cropData);
      }
      const updated = { ...previewFarm, currentCrops: crops };
      setPreviewFarm(updated);
      setInsights(computeFarmInsights(updated));
      showSnack(cropDialog.index >= 0 ? 'Crop updated in preview!' : 'Crop added to preview!');
      return;
    }

    const crops = [...(selectedFarm.currentCrops || [])];
    if (cropDialog.index >= 0) {
      crops[cropDialog.index] = cropData;
    } else {
      crops.push(cropData);
    }
    const res = await api.put(`/farm/${selectedFarm._id}`, { currentCrops: crops });
    if (res.data.success) {
      showSnack(cropDialog.index >= 0 ? 'Crop updated!' : 'Crop added!');
      await fetchFarms();
      fetchInsights(selectedFarm._id);
    }
  };

  // ── Delete Crop ────────────────────────────────────────────────────────────
  const handleDeleteCrop = async (index) => {
    if (previewFarm) {
      const crops = [...(previewFarm.currentCrops || [])];
      crops.splice(index, 1);
      const updated = { ...previewFarm, currentCrops: crops };
      setPreviewFarm(updated);
      setInsights(computeFarmInsights(updated));
      showSnack('Crop removed from preview!');
      return;
    }

    const crops = [...(selectedFarm.currentCrops || [])];
    crops.splice(index, 1);
    const res = await api.put(`/farm/${selectedFarm._id}`, { currentCrops: crops });
    if (res.data.success) {
      showSnack('Crop removed!');
      await fetchFarms();
      fetchInsights(selectedFarm._id);
    }
  };

  // ── Add Expense/Revenue ────────────────────────────────────────────────────
  const handleFinanceSubmit = async (type, entry) => {
    if (previewFarm) {
      let updated;
      if (type === 'expense') {
        const expenses = [...(previewFarm.expenses || []), entry];
        updated = { ...previewFarm, expenses };
      } else {
        const revenue = [...(previewFarm.revenue || []), entry];
        updated = { ...previewFarm, revenue };
      }
      setPreviewFarm(updated);
      setInsights(computeFarmInsights(updated));
      showSnack(type === 'expense' ? 'Expense added in preview!' : 'Revenue recorded in preview!');
      return;
    }

    if (type === 'expense') {
      const expenses = [...(selectedFarm.expenses || []), entry];
      await api.put(`/farm/${selectedFarm._id}`, { expenses });
    } else {
      const revenue = [...(selectedFarm.revenue || []), entry];
      await api.put(`/farm/${selectedFarm._id}`, { revenue });
    }
    showSnack(type === 'expense' ? 'Expense added!' : 'Revenue recorded!');
    await fetchFarms();
    fetchInsights(selectedFarm._id);
  };

  // ── Import a Dummy Farm Template to Account ────────────────────────────────
  const handleImportFarm = async (farmTemplate) => {
    try {
      setImportingId(farmTemplate._id);
      const res = await api.post('/farm', {
        name: farmTemplate.name,
        location: farmTemplate.location,
        landSize: farmTemplate.landSize,
      });

      if (res.data.success && res.data.data?._id) {
        const newFarmId = res.data.data._id;
        // Populate crops, expenses, and revenues
        try {
          await api.put(`/farm/${newFarmId}`, {
            currentCrops: farmTemplate.currentCrops || [],
            expenses: farmTemplate.expenses || [],
            revenue: farmTemplate.revenue || [],
          });
        } catch (seedErr) {
          console.warn('Could not populate initial crops/finances:', seedErr);
        }

        showSnack(`Successfully imported "${farmTemplate.name}" to your account!`, 'success');
        setPreviewFarm(null);
        setTemplatesModalOpen(false);
        const updatedRes = await api.get('/farm');
        const updatedFarms = updatedRes.data.data || [];
        setFarms(updatedFarms);
        const createdIdx = updatedFarms.findIndex((f) => f._id === newFarmId);
        setSelectedIdx(createdIdx >= 0 ? createdIdx : 0);
      }
    } catch (err) {
      console.error('Error importing farm template:', err);
      showSnack(err.response?.data?.message || 'Failed to import farm template', 'error');
    } finally {
      setImportingId(null);
    }
  };

  // ── Batch Import All Demo Farms ────────────────────────────────────────────
  const handleImportAllDemoFarms = async () => {
    try {
      setImportingId('all');
      for (const tpl of DUMMY_FARMS) {
        const res = await api.post('/farm', {
          name: tpl.name,
          location: tpl.location,
          landSize: tpl.landSize,
        });
        if (res.data.success && res.data.data?._id) {
          await api.put(`/farm/${res.data.data._id}`, {
            currentCrops: tpl.currentCrops || [],
            expenses: tpl.expenses || [],
            revenue: tpl.revenue || [],
          });
        }
      }
      showSnack('All 4 sample farms successfully imported to your account!', 'success');
      setPreviewFarm(null);
      setTemplatesModalOpen(false);
      await fetchFarms();
      setSelectedIdx(0);
    } catch (err) {
      console.error('Error importing all dummy farms:', err);
      showSnack(err.response?.data?.message || 'Failed to import all sample farms', 'error');
    } finally {
      setImportingId(null);
    }
  };

  const filteredDummyFarms = DUMMY_FARMS.filter(
    (f) => selectedDistrict === 'All' || f.location === selectedDistrict
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  // ── Empty State: No Farms Registered & Not in Preview Mode ─────────────────
  if (farms.length === 0 && !previewFarm) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        {/* Top Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
              Farm Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your agricultural holdings, crop cycles, financial health, and agronomic insights
            </Typography>
          </Box>
          <Box display="flex" gap={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchFarms}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={importingId === 'all' ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
              onClick={handleImportAllDemoFarms}
              disabled={Boolean(importingId)}
            >
              {importingId === 'all' ? 'Importing Samples...' : 'Import All Samples'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFarmDialog({ open: true, farm: null })}
            >
              Register Custom Farm
            </Button>
          </Box>
        </Box>

        {/* Hero Notice & Callout Banner */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.08) 0%, rgba(46, 125, 50, 0.04) 100%)',
            border: '1px solid rgba(46, 125, 50, 0.18)',
            boxShadow: raised('sm'),
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Chip
                  label="Sample Farm Showcase"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                />
                <Typography variant="caption" color="text.secondary">
                  No registered farms found yet
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: neuColors.text }}>
                Explore Curated Sri Lankan Farm Templates
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mb: 2.5, lineHeight: 1.6 }}>
                Your farm section is currently empty. To help you experience Prospera's agronomic capabilities, we have
                provided rich sample farm cards below. You can <strong>Preview</strong> any farm's full interactive
                dashboard (with real-time analytics, crop tracking, and financial ledgers) or click{' '}
                <strong>Use Template</strong> to clone it directly into your account!
              </Typography>

              <Box display="flex" gap={1.5} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setFarmDialog({ open: true, farm: null })}
                  sx={{ borderRadius: 2.5 }}
                >
                  Register Custom Farm
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => setPreviewFarm(DUMMY_FARMS[0])}
                  sx={{ borderRadius: 2.5 }}
                >
                  Preview {DUMMY_FARMS[0].name}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  width: 130,
                  height: 130,
                  mx: 'auto',
                  borderRadius: '50%',
                  bgcolor: 'rgba(46, 125, 50, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: raised('md'),
                }}
              >
                <Agriculture sx={{ fontSize: 68, color: 'primary.main' }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* District Filter Chips */}
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mb={3}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
              Filter by District:
            </Typography>
            {['All', ...new Set(DUMMY_FARMS.map((f) => f.location))].map((district) => (
              <Chip
                key={district}
                label={district}
                clickable
                onClick={() => setSelectedDistrict(district)}
                color={selectedDistrict === district ? 'primary' : 'default'}
                variant={selectedDistrict === district ? 'filled' : 'outlined'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Showing {filteredDummyFarms.length} sample farm templates
          </Typography>
        </Box>

        {/* Dummy Farm Cards Grid */}
        <Grid container spacing={3} mb={4}>
          {filteredDummyFarms.map((farm) => (
            <Grid item xs={12} md={6} key={farm._id}>
              <DummyFarmCard
                farm={farm}
                onPreview={setPreviewFarm}
                onImport={handleImportFarm}
                isImporting={importingId === farm._id}
              />
            </Grid>
          ))}
        </Grid>

        {/* Custom Farm CTA Box */}
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px dashed rgba(0,0,0,0.18)',
            bgcolor: neuColors.baseDeep,
          }}
        >
          <Terrain sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" fontWeight="bold">Have Your Own Land?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}>
            Register your custom farm with your district and exact acreage to start monitoring your personal crops,
            recording daily expenses, and accessing precision AI tools.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setFarmDialog({ open: true, farm: null })}>
            Register Your Custom Farm
          </Button>
        </Paper>

        {/* Register Farm Modal */}
        <FarmFormDialog
          open={farmDialog.open}
          onClose={() => setFarmDialog({ open: false, farm: null })}
          onSubmit={handleCreateFarm}
          farm={null}
        />

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  // ── Main Dashboard View (Real Farms OR Active Demo Preview Mode) ───────────
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Demo Preview Floating Alert Banner */}
      {previewFarm && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            bgcolor: 'rgba(46, 125, 50, 0.08)',
            border: '1px solid rgba(46, 125, 50, 0.25)',
            boxShadow: raised('sm'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Visibility fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                Interactive Preview: {previewFarm.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You are currently viewing a simulated demo farm template ({previewFarm.location} • {previewFarm.landSize} acres).
                Explore crop analytics, test logging entries, or save it permanently to your account.
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={importingId === previewFarm._id ? <CircularProgress size={16} color="inherit" /> : <AddCircleOutline />}
              onClick={() => handleImportFarm(previewFarm)}
              disabled={Boolean(importingId)}
            >
              {importingId === previewFarm._id ? 'Saving...' : 'Save to My Account'}
            </Button>
            <Button size="small" variant="outlined" onClick={() => setPreviewFarm(null)}>
              Exit Preview
            </Button>
          </Box>
        </Paper>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mb={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
            Farm Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your farms, crops, finances and view insights
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Tooltip title="Explore Farm Templates">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AutoAwesome />}
              onClick={() => setTemplatesModalOpen(true)}
            >
              Farm Templates
            </Button>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchFarms}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => setFarmDialog({ open: true, farm: null })}>
            Add Farm
          </Button>
        </Box>
      </Box>

      {/* Farm Tabs (Real Farms) */}
      {!previewFarm && farms.length > 1 && (
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={selectedIdx}
            onChange={(_, v) => setSelectedIdx(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {farms.map((f) => (
              <Tab key={f._id} label={f.name} icon={<Agriculture />} iconPosition="start" />
            ))}
          </Tabs>
        </Paper>
      )}

      {selectedFarm && (
        <>
          {/* Farm Info Bar */}
          <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Agriculture sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" fontWeight="bold">{selectedFarm.name}</Typography>
                  {selectedFarm.isDummy && (
                    <Chip label="Demo Preview" size="small" color="success" variant="outlined" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {selectedFarm.location} • {selectedFarm.landSize} acres
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Button size="small" startIcon={<Edit />} onClick={() => setFarmDialog({ open: true, farm: selectedFarm })}>
                Edit
              </Button>
              <Button size="small" color="error" startIcon={<Delete />} onClick={() => setDeleteDialog({ open: true, farmId: selectedFarm._id })}>
                {selectedFarm.isDummy ? 'Exit Preview' : 'Delete'}
              </Button>
            </Box>
          </Paper>

          {/* Insights Panel */}
          <Box mb={3}>
            <FarmInsightsPanel insights={insights} farmName={selectedFarm.name} />
          </Box>

          <Grid container spacing={3}>
            {/* Current Crops */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">Current Crops</Typography>
                  <Button size="small" startIcon={<Add />} onClick={() => setCropDialog({ open: true, crop: null, index: -1 })}>
                    Add Crop
                  </Button>
                </Box>
                {selectedFarm.currentCrops?.length > 0 ? (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Crop Name</TableCell>
                          <TableCell>Variety</TableCell>
                          <TableCell>Area (acres)</TableCell>
                          <TableCell>Planted Date</TableCell>
                          <TableCell>Expected Yield</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedFarm.currentCrops.map((crop, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{crop.cropName}</TableCell>
                            <TableCell>{crop.variety || '—'}</TableCell>
                            <TableCell>{crop.area}</TableCell>
                            <TableCell>{crop.plantedDate ? new Date(crop.plantedDate).toLocaleDateString() : '—'}</TableCell>
                            <TableCell>{crop.expectedYield ? `${crop.expectedYield} kg` : '—'}</TableCell>
                            <TableCell>
                              <Chip
                                label={crop.status}
                                size="small"
                                color={crop.status === 'growing' ? 'success' : crop.status === 'harvested' ? 'info' : crop.status === 'failed' ? 'error' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                <IconButton size="small" onClick={() => setCropDialog({ open: true, crop, index: idx })}>
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteCrop(idx)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No crops added yet. Click "Add Crop" to get started.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Quick Actions</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="outlined" fullWidth sx={{ py: 2 }} onClick={() => setFinanceDialog({ open: true, type: 'expense' })}>
                      💸 Add Expense
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="outlined" fullWidth sx={{ py: 2 }} onClick={() => setFinanceDialog({ open: true, type: 'revenue' })}>
                      💰 Record Revenue
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="outlined" fullWidth sx={{ py: 2 }} onClick={() => setCropDialog({ open: true, crop: null, index: -1 })}>
                      🌱 Add Crop
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button variant="outlined" fullWidth sx={{ py: 2 }} onClick={() => setFarmDialog({ open: true, farm: selectedFarm })}>
                      ✏️ Edit Farm
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Expenses Table */}
            {selectedFarm.expenses?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>Recent Expenses</Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedFarm.expenses.slice(-10).reverse().map((exp, i) => (
                          <TableRow key={i}>
                            <TableCell>{exp.category}</TableCell>
                            <TableCell>LKR {exp.amount?.toLocaleString()}</TableCell>
                            <TableCell>{exp.date ? new Date(exp.date).toLocaleDateString() : '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Revenue Table */}
            {selectedFarm.revenue?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>Revenue Records</Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Source</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedFarm.revenue.slice(-10).reverse().map((rev, i) => (
                          <TableRow key={i}>
                            <TableCell>{rev.label}</TableCell>
                            <TableCell>LKR {rev.totalAmount?.toLocaleString()}</TableCell>
                            <TableCell>{rev.date ? new Date(rev.date).toLocaleDateString() : '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}
      <FarmFormDialog
        open={farmDialog.open}
        onClose={() => setFarmDialog({ open: false, farm: null })}
        onSubmit={farmDialog.farm ? handleUpdateFarm : handleCreateFarm}
        farm={farmDialog.farm}
      />
      <CropFormDialog
        open={cropDialog.open}
        onClose={() => setCropDialog({ open: false, crop: null, index: -1 })}
        onSubmit={handleCropSubmit}
        crop={cropDialog.crop}
      />
      <ExpenseRevenueDialog
        open={financeDialog.open}
        onClose={() => setFinanceDialog({ open: false, type: 'expense' })}
        onSubmit={handleFinanceSubmit}
        type={financeDialog.type}
      />

      {/* Farm Templates Modal (Available even when user already has farms) */}
      <Dialog
        open={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <AutoAwesome color="primary" />
              <Typography variant="h6" fontWeight="bold">Sample Farm Templates</Typography>
            </Box>
            <IconButton onClick={() => setTemplatesModalOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Explore and clone pre-configured Sri Lankan agricultural scenarios into your account with complete crop rotations,
            soil telemetry, and revenue histories.
          </Typography>
          <Grid container spacing={3}>
            {DUMMY_FARMS.map((farm) => (
              <Grid item xs={12} md={6} key={farm._id}>
                <DummyFarmCard
                  farm={farm}
                  onPreview={(f) => {
                    setPreviewFarm(f);
                    setTemplatesModalOpen(false);
                  }}
                  onImport={handleImportFarm}
                  isImporting={importingId === farm._id}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplatesModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, farmId: null })}>
        <DialogTitle>{selectedFarm?.isDummy ? 'Exit Demo Preview?' : 'Delete Farm?'}</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedFarm?.isDummy
              ? 'Are you sure you want to exit the demo farm preview mode?'
              : 'Are you sure you want to delete this farm? This action cannot be undone. All crops, expenses, and revenue data will be permanently lost.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, farmId: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteFarm}>
            {selectedFarm?.isDummy ? 'Exit Preview' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FarmDashboard;
