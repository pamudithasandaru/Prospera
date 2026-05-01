import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Paper, Typography, Box, Button, LinearProgress,
  Avatar, Chip, Card, CardContent, CardActionArea, Grid,
  IconButton, Collapse, Divider, TextField, InputAdornment,
} from '@mui/material';
import {
  Agriculture, ExpandMore, ExpandLess, Search, Person,
  Terrain, ArrowBack, Refresh,
} from '@mui/icons-material';
import api from '../../services/api';
import FarmInsightsPanel from './FarmInsightsPanel';

const ExpertFarmView = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFarmer, setExpandedFarmer] = useState(null);
  const [farmerFarms, setFarmerFarms] = useState({});
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingFarms, setLoadingFarms] = useState(null);
  const [search, setSearch] = useState('');

  const fetchFarmers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/farm/expert/farmers');
      setFarmers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching farmers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFarmers(); }, [fetchFarmers]);

  const handleExpandFarmer = async (farmerId) => {
    if (expandedFarmer === farmerId) {
      setExpandedFarmer(null);
      return;
    }
    setExpandedFarmer(farmerId);
    setSelectedFarm(null);
    setInsights(null);

    if (!farmerFarms[farmerId]) {
      setLoadingFarms(farmerId);
      try {
        const res = await api.get(`/farm/expert/farmers/${farmerId}/farms`);
        setFarmerFarms((prev) => ({ ...prev, [farmerId]: res.data.data || [] }));
      } catch (err) {
        console.error('Error fetching farmer farms:', err);
      } finally {
        setLoadingFarms(null);
      }
    }
  };

  const handleSelectFarm = async (farm) => {
    setSelectedFarm(farm);
    try {
      const res = await api.get(`/farm/${farm._id}/insights`);
      setInsights(res.data.data);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setInsights(null);
    }
  };

  const filteredFarmers = farmers.filter((f) =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase()) ||
    f.profile?.location?.district?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  // ── If a farm is selected, show insights view ──────────────────────────────
  if (selectedFarm) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => { setSelectedFarm(null); setInsights(null); }} sx={{ mb: 2 }}>
          Back to Farmer List
        </Button>

        <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Agriculture sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">{selectedFarm.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedFarm.location} • {selectedFarm.landSize} acres • Owner: {selectedFarm.ownerName || 'Unknown'}
            </Typography>
          </Box>
        </Paper>

        <FarmInsightsPanel insights={insights} farmName={selectedFarm.name} />

        {/* Crops Table (read-only) */}
        {selectedFarm.currentCrops?.length > 0 && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Crops</Typography>
            <Grid container spacing={2}>
              {selectedFarm.currentCrops.map((crop, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">{crop.cropName}</Typography>
                      <Typography variant="body2" color="text.secondary">{crop.variety || 'No variety'}</Typography>
                      <Box display="flex" gap={1} mt={1}>
                        <Chip label={`${crop.area} acres`} size="small" variant="outlined" />
                        <Chip
                          label={crop.status}
                          size="small"
                          color={crop.status === 'growing' ? 'success' : crop.status === 'harvested' ? 'info' : 'default'}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Container>
    );
  }

  // ── Main farmer list view ──────────────────────────────────────────────────
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Farm Overview</Typography>
          <Typography variant="body2" color="text.secondary">
            Browse all registered farmers and their farm insights
          </Typography>
        </Box>
        <IconButton onClick={fetchFarmers}><Refresh /></IconButton>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search farmers by name, email, or district..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><Search /></InputAdornment>
          ),
        }}
      />

      {/* Summary */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">{farmers.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Farmers</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {farmers.reduce((s, f) => s + (f.farmCount || 0), 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">Total Farms</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {new Set(farmers.map((f) => f.profile?.location?.district).filter(Boolean)).size}
            </Typography>
            <Typography variant="body2" color="text.secondary">Districts Covered</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Farmer List */}
      {filteredFarmers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">No farmers found</Typography>
        </Paper>
      ) : (
        filteredFarmers.map((farmer) => (
          <Paper key={farmer._id} sx={{ mb: 2, overflow: 'hidden' }}>
            <CardActionArea onClick={() => handleExpandFarmer(farmer._id)}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={farmer.avatar} sx={{ width: 48, height: 48 }}>
                    {farmer.name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{farmer.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{farmer.email}</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  {farmer.profile?.location?.district && (
                    <Chip icon={<Terrain />} label={farmer.profile.location.district} size="small" variant="outlined" />
                  )}
                  <Chip
                    icon={<Agriculture />}
                    label={`${farmer.farmCount || 0} farm${(farmer.farmCount || 0) !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  {expandedFarmer === farmer._id ? <ExpandLess /> : <ExpandMore />}
                </Box>
              </Box>
            </CardActionArea>

            <Collapse in={expandedFarmer === farmer._id}>
              <Divider />
              <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                {loadingFarms === farmer._id ? (
                  <LinearProgress sx={{ my: 2 }} />
                ) : farmerFarms[farmer._id]?.length > 0 ? (
                  <Grid container spacing={2}>
                    {farmerFarms[farmer._id].map((farm) => (
                      <Grid item xs={12} sm={6} md={4} key={farm._id}>
                        <Card>
                          <CardActionArea onClick={() => handleSelectFarm(farm)} sx={{ p: 2 }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Agriculture color="primary" />
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">{farm.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {farm.location} • {farm.landSize} acres
                                </Typography>
                              </Box>
                            </Box>
                            <Box display="flex" gap={1} mt={1}>
                              <Chip label={`${farm.currentCrops?.length || 0} crops`} size="small" />
                              <Chip label="View Insights →" size="small" color="primary" />
                            </Box>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No farms registered for this farmer.
                  </Typography>
                )}
              </Box>
            </Collapse>
          </Paper>
        ))
      )}
    </Container>
  );
};

export default ExpertFarmView;
