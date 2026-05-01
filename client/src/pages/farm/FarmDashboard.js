import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Button, LinearProgress,
  Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow,
  Tab, Tabs, Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Tooltip,
} from '@mui/material';
import {
  Add, Edit, Delete, Terrain, Refresh, Agriculture,
} from '@mui/icons-material';
import api from '../../services/api';
import FarmFormDialog from './FarmFormDialog';
import CropFormDialog from './CropFormDialog';
import ExpenseRevenueDialog from './ExpenseRevenueDialog';
import FarmInsightsPanel from './FarmInsightsPanel';

const FarmDashboard = () => {
  const [farms, setFarms] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [farmDialog, setFarmDialog] = useState({ open: false, farm: null });
  const [cropDialog, setCropDialog] = useState({ open: false, crop: null, index: -1 });
  const [financeDialog, setFinanceDialog] = useState({ open: false, type: 'expense' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, farmId: null });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const selectedFarm = farms[selectedIdx] || null;

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

  useEffect(() => { fetchFarms(); }, []);

  useEffect(() => {
    if (selectedFarm?._id) fetchInsights(selectedFarm._id);
    else setInsights(null);
  }, [selectedFarm?._id, fetchInsights]);

  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  };

  // ── Create Farm ────────────────────────────────────────────────────────────
  const handleCreateFarm = async (data) => {
    const res = await api.post('/farm', data);
    if (res.data.success) {
      showSnack('Farm created successfully!');
      await fetchFarms();
      setSelectedIdx(farms.length); // Select newly created
    }
  };

  // ── Update Farm ────────────────────────────────────────────────────────────
  const handleUpdateFarm = async (data) => {
    const res = await api.put(`/farm/${selectedFarm._id}`, data);
    if (res.data.success) {
      showSnack('Farm updated successfully!');
      await fetchFarms();
    }
  };

  // ── Delete Farm ────────────────────────────────────────────────────────────
  const handleDeleteFarm = async () => {
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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────────────
  if (farms.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Terrain sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>No Farms Registered</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Register your farm to start managing crops, tracking expenses, and boosting productivity.
        </Typography>
        <Button variant="contained" size="large" startIcon={<Add />} onClick={() => setFarmDialog({ open: true, farm: null })}>
          Register Farm
        </Button>
        <FarmFormDialog
          open={farmDialog.open}
          onClose={() => setFarmDialog({ open: false, farm: null })}
          onSubmit={handleCreateFarm}
          farm={null}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Farm Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your farms, crops, finances and view insights
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchFarms}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => setFarmDialog({ open: true, farm: null })}>
            Add Farm
          </Button>
        </Box>
      </Box>

      {/* Farm Tabs */}
      {farms.length > 1 && (
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={selectedIdx}
            onChange={(_, v) => setSelectedIdx(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {farms.map((f, i) => (
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
                <Typography variant="h6" fontWeight="bold">{selectedFarm.name}</Typography>
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
                Delete
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
                            <IconButton size="small" onClick={() => setCropDialog({ open: true, crop, index: idx })}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteCrop(idx)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                </Paper>
              </Grid>
            )}

            {/* Revenue Table */}
            {selectedFarm.revenue?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>Revenue Records</Typography>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, farmId: null })}>
        <DialogTitle>Delete Farm?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this farm? This action cannot be undone. All crops, expenses, and revenue data will be permanently lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, farmId: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteFarm}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FarmDashboard;
