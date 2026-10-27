import React, { useState, useEffect, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Badge,
  Divider,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  Verified,
  ChatBubbleOutline,
  ExpandLess,
  ExpandMore,
  Inventory2,
  WorkspacePremium,
  CalendarMonth,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { neuColors } from '../../neumorphic';
import { money, NO_IMAGE, onImageError } from '../../utils/catalogue';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruit' },
  { value: 'grains', label: 'Grain' },
  { value: 'spices', label: 'Spice' },
  { value: 'dairy', label: 'Dairy' },
];

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'quantity-desc', label: 'Largest quantity' },
];

/** Everything "More Filters" controls, so one spread resets the panel. */
const BLANK_FILTERS = { type: 'all', district: 'all', grade: 'all', minPrice: '', maxPrice: '', sort: 'newest' };

const listedOn = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

/** One label/value row in the details dialog. */
const Fact = ({ icon, label, children }) => (
  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
    <Box sx={{ color: 'text.secondary', mt: 0.25, display: 'flex' }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{children}</Typography>
    </Box>
  </Box>
);

const MarketListings = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [filters, setFilters] = useState(BLANK_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedListing, setSelectedListing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [inquiry, setInquiry] = useState(null); // { listing, text }
  const [sending, setSending] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setSnack({ open: true, message, severity });

  useEffect(() => {
    api.get('/market/listings')
      .then((res) => setListings(res.data.data || []))
      .catch((err) => {
        console.error('Error fetching listings:', err);
        setListings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Districts and grades come from the data rather than a hard-coded list, so
  // the dropdowns can never offer a filter that matches nothing.
  const districts = useMemo(
    () => [...new Set(listings.map((l) => l.location?.district).filter(Boolean))].sort(),
    [listings]
  );
  const grades = useMemo(
    () => [...new Set(listings.map((l) => l.quality?.grade).filter(Boolean))].sort(),
    [listings]
  );

  // Sort order is not a filter — counting it would badge the button for a
  // choice that hides nothing.
  const activeFilterCount = useMemo(
    () => Object.keys(BLANK_FILTERS).filter((k) => k !== 'sort' && filters[k] !== BLANK_FILTERS[k]).length,
    [filters]
  );

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const visibleListings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const min = parseFloat(filters.minPrice);
    const max = parseFloat(filters.maxPrice);

    const rows = listings.filter((l) => {
      if (term) {
        const haystack = `${l.product?.name || ''} ${l.product?.description || ''} ${l.location?.district || ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (category !== 'all' && l.product?.category !== category) return false;
      if (filters.type !== 'all' && l.type !== filters.type) return false;
      if (filters.district !== 'all' && l.location?.district !== filters.district) return false;
      if (filters.grade !== 'all' && l.quality?.grade !== filters.grade) return false;

      const price = Number(l.pricing?.pricePerUnit ?? 0);
      if (!Number.isNaN(min) && price < min) return false;
      if (!Number.isNaN(max) && price > max) return false;
      return true;
    });

    const price = (l) => Number(l.pricing?.pricePerUnit ?? 0);
    const amount = (l) => Number(l.quantity?.amount ?? 0);
    const sorters = {
      'price-asc': (a, b) => price(a) - price(b),
      'price-desc': (a, b) => price(b) - price(a),
      'quantity-desc': (a, b) => amount(b) - amount(a),
      newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    };
    return [...rows].sort(sorters[filters.sort] || sorters.newest);
  }, [listings, searchTerm, category, filters]);

  const clearAll = () => {
    setFilters(BLANK_FILTERS);
    setCategory('all');
    setSearchTerm('');
  };

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    setDialogOpen(true);
  };

  /**
   * "Inquire" opens a DM with the seller. Browsing the market is public, so
   * the signed-out and own-listing cases have to be handled here rather than
   * assumed away.
   */
  const handleInquire = (listing) => {
    const sellerId = listing?.seller?._id;

    if (isGuest) {
      notify('Sign in to contact sellers.', 'info');
      setTimeout(() => navigate('/login?next=/market'), 900);
      return;
    }
    if (!sellerId) {
      notify('This listing has no seller account to contact.', 'warning');
      return;
    }
    if (sellerId === user?._id) {
      notify('This is your own listing.', 'info');
      return;
    }

    const { product, quantity, pricing, location } = listing;
    setInquiry({
      listing,
      text:
        `Hi, I'm interested in your listing "${product?.name}" — ` +
        `${quantity?.amount} ${quantity?.unit} at ${money(pricing?.pricePerUnit)}/${quantity?.unit}` +
        `${location?.district ? ` in ${location.district}` : ''}. Is it still available?`,
    });
  };

  const sendInquiry = async () => {
    const sellerId = inquiry?.listing?.seller?._id;
    const text = inquiry?.text?.trim();
    if (!sellerId || !text) return;

    setSending(true);
    try {
      // The DM is created on demand, then the first message goes into it — the
      // seller sees a real thread rather than an empty conversation.
      const conv = await api.get(`/messages/conversation/${sellerId}`);
      await api.post(`/messages/${conv.data.data._id}`, { text });
      setInquiry(null);
      setDialogOpen(false);
      notify('Inquiry sent — opening your messages.');
      setTimeout(() => navigate(`/messages?user=${sellerId}`), 700);
    } catch (err) {
      console.error('Send inquiry error:', err);
      notify(err?.response?.data?.message || 'Could not send your inquiry.', 'error');
    } finally {
      setSending(false);
    }
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
              placeholder="Search by product, description or district…"
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
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Badge badgeContent={activeFilterCount} color="primary" sx={{ width: '100%' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setShowFilters((v) => !v)}
                sx={{ height: 56 }}
              >
                More Filters
              </Button>
            </Badge>
          </Grid>
        </Grid>

        <Collapse in={showFilters}>
          <Divider sx={{ my: 2.5 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth size="small" label="Listing type" value={filters.type} onChange={setFilter('type')}>
                <MenuItem value="all">Any type</MenuItem>
                <MenuItem value="domestic">Domestic</MenuItem>
                <MenuItem value="export">Export</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth size="small" label="District" value={filters.district} onChange={setFilter('district')}>
                <MenuItem value="all">Any district</MenuItem>
                {districts.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth size="small" label="Quality grade" value={filters.grade} onChange={setFilter('grade')}>
                <MenuItem value="all">Any grade</MenuItem>
                {grades.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth size="small" label="Sort by" value={filters.sort} onChange={setFilter('sort')}>
                {SORTS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Min price"
                value={filters.minPrice}
                onChange={setFilter('minPrice')}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Max price"
                value={filters.maxPrice}
                onChange={setFilter('maxPrice')}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', alignItems: 'center', justifyContent: { sm: 'flex-end' } }}>
              <Button onClick={clearAll} disabled={!activeFilterCount && category === 'all' && !searchTerm}>
                Clear all filters
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {!loading && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          {visibleListings.length} of {listings.length} listings
        </Typography>
      )}

      {/* Listings Grid */}
      <Grid container spacing={3}>
        {visibleListings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={listing._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="180"
                image={listing.product?.images?.[0] || NO_IMAGE}
                alt={listing.product?.name}
                onError={onImageError}
                sx={{ objectFit: 'cover', bgcolor: neuColors.baseDeep }}
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
                  {money(listing.pricing?.pricePerUnit)}/{listing.quantity?.unit}
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
                <Button
                  size="small"
                  variant="contained"
                  fullWidth
                  startIcon={<ChatBubbleOutline />}
                  onClick={() => handleInquire(listing)}
                >
                  Inquire
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading && (
        <Box textAlign="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {visibleListings.length === 0 && !loading && (
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
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="h6" fontWeight="bold" component="span">
              {selectedListing?.product?.name}
            </Typography>
            {selectedListing?.seller?.verified && <Verified color="primary" fontSize="small" />}
            <Chip
              size="small"
              label={selectedListing?.type}
              color={selectedListing?.type === 'export' ? 'secondary' : 'default'}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedListing && (
            <Grid container spacing={3}>
              {/* The image used to be a full-width <img> with no height cap, so
                  a tall photo pushed every fact below the fold. */}
              <Grid item xs={12} sm={5}>
                <Box
                  component="img"
                  src={selectedListing.product?.images?.[0] || NO_IMAGE}
                  alt={selectedListing.product?.name}
                  onError={onImageError}
                  sx={{
                    width: '100%',
                    height: { xs: 200, sm: 240 },
                    objectFit: 'cover',
                    borderRadius: 3,
                    bgcolor: neuColors.baseDeep,
                    display: 'block',
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={7}>
                <Typography variant="caption" color="text.secondary">Price</Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold" lineHeight={1.2}>
                  {money(selectedListing.pricing?.pricePerUnit)}
                  <Typography component="span" variant="h6" color="text.secondary"> /{selectedListing.quantity?.unit}</Typography>
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr' }, gap: 2, mt: 2.5 }}>
                  <Fact icon={<Inventory2 fontSize="small" />} label="Available">
                    {selectedListing.quantity?.amount} {selectedListing.quantity?.unit}
                  </Fact>
                  <Fact icon={<WorkspacePremium fontSize="small" />} label="Quality grade">
                    {selectedListing.quality?.grade || 'Standard'}
                  </Fact>
                  <Fact icon={<LocationOn fontSize="small" />} label="District">
                    {selectedListing.location?.district || 'Sri Lanka'}
                  </Fact>
                  <Fact icon={<CalendarMonth fontSize="small" />} label="Listed">
                    {listedOn(selectedListing.createdAt)}
                  </Fact>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar src={selectedListing.seller?.avatar || undefined} sx={{ width: 40, height: 40 }}>
                    {(selectedListing.seller?.name || '?').charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">Seller</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedListing.seller?.name || 'Unlisted seller'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedListing.product?.description || 'No description available'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ChatBubbleOutline />}
            onClick={() => handleInquire(selectedListing)}
          >
            Contact Seller
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inquiry composer */}
      <Dialog open={Boolean(inquiry)} onClose={() => !sending && setInquiry(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Inquire about {inquiry?.listing?.product?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This starts a private conversation with {inquiry?.listing?.seller?.name || 'the seller'}.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Your message"
            value={inquiry?.text || ''}
            onChange={(e) => setInquiry((q) => ({ ...q, text: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInquiry(null)} disabled={sending}>Cancel</Button>
          <Button variant="contained" onClick={sendInquiry} disabled={sending || !inquiry?.text?.trim()}>
            {sending ? 'Sending…' : 'Send inquiry'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default MarketListings;
