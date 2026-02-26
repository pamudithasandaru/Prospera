import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  TrendingUp,
  Verified,
  ChatBubbleOutline,
} from '@mui/icons-material';
import api from '../../services/api';

const MarketListings = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchTerm, category, listings]);

  const fetchListings = async () => {
    try {
      const response = await api.get('/market/listings');
      setListings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = listings;

    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(listing => listing.product?.category === category);
    }

    setFilteredListings(filtered);
  };

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    setDialogOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Wholesale Market
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse fresh produce from local farmers
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="vegetables">Vegetables</MenuItem>
              <MenuItem value="fruits">Fruit</MenuItem>
              <MenuItem value="grains">Grain</MenuItem>
              <MenuItem value="spices">Spice</MenuItem>
              <MenuItem value="dairy">Dairy</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ height: 56 }}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Listings Grid */}
      <Grid container spacing={3}>
        {filteredListings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={listing._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="180"
                image={listing.product?.images?.[0] || 'https://via.placeholder.com/300x180?text=No+Image'}
                alt={listing.product?.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Typography variant="h6" fontWeight="bold">
                    {listing.product?.name}
                  </Typography>
                  {listing.seller?.verified && (
                    <Verified color="primary" fontSize="small" />
                  )}
                </Box>
                
                <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
                  LKR {listing.pricing?.pricePerUnit}/{listing.quantity?.unit}
                </Typography>

                <Box display="flex" gap={1} mb={1}>
                  <Chip
                    label={listing.type}
                    size="small"
                    color={listing.type === 'export' ? 'secondary' : 'default'}
                  />
                  <Chip
                    label={listing.quality?.grade || 'Standard'}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                  <LocationOn fontSize="small" />
                  <Typography variant="caption">
                    {listing.location?.district || 'Sri Lanka'}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" mt={1}>
                  Available: {listing.quantity?.amount} {listing.quantity?.unit}
                </Typography>
              </CardContent>

              <CardActions>
                <Button size="small" fullWidth onClick={() => handleViewDetails(listing)}>
                  View Details
                </Button>
                <Button size="small" variant="contained" fullWidth startIcon={<ChatBubbleOutline />}>
                  Inquire
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredListings.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No listings found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search filters
          </Typography>
        </Box>
      )}

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedListing?.product?.name}</DialogTitle>
        <DialogContent>
          {selectedListing && (
            <Box>
              <img
                src={selectedListing.product?.images?.[0] || 'https://via.placeholder.com/600x300'}
                alt={selectedListing.product?.name}
                style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Price</Typography>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    LKR {selectedListing.pricing?.pricePerUnit}/{selectedListing.quantity?.unit}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Available Quantity</Typography>
                  <Typography variant="h6">
                    {selectedListing.quantity?.amount} {selectedListing.quantity?.unit}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">
                    {selectedListing.product?.description || 'No description available'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained">Contact Seller</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MarketListings;
