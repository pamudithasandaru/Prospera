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
  InputAdornment,
  MenuItem,
  Chip,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  FavoriteBorder,
  FilterList,
  LocalShipping,
  Inventory2,
  Category,
  LocalOffer,
} from '@mui/icons-material';
import { neuRaised } from '../../neumorphic';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useRequireAuth from '../../hooks/useRequireAuth';
import { useCart } from '../../context/CartContext';
import { money, NO_IMAGE, onImageError } from '../../utils/catalogue';
import { neuColors } from '../../neumorphic';

/** One label/value row in the details dialog. */
const Fact = ({ icon, label, children }) => (
  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
    <Box sx={{ color: 'text.secondary', mt: 0.25, display: 'flex' }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>{children}</Typography>
    </Box>
  </Box>
);

const EquipmentCatalog = () => {
  const navigate = useNavigate();
  const requireAuth = useRequireAuth();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adding, setAdding] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const { count: cartCount, addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, category, products]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/marketplace/products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (productId) => {
    setAdding(productId);
    try {
      await addItem(productId, 1);
      setSnack({ open: true, message: 'Added to your cart.', severity: 'success' });
    } catch (error) {
      setSnack({
        open: true,
        message: error?.response?.data?.message || 'Could not add that to your cart.',
        severity: 'error',
      });
    } finally {
      setAdding(null);
    }
  };

  const openDetails = (product) => {
    setSelected(product);
    setDetailsOpen(true);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            International Marketplace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Premium agricultural equipment and machinery
          </Typography>
        </Box>
        <IconButton color="primary" onClick={() => navigate('/marketplace/cart')}>
          <Badge badgeContent={cartCount} color="error">
            <ShoppingCart />
          </Badge>
        </IconButton>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search equipment..."
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
              <MenuItem value="tractors">Tractors</MenuItem>
              <MenuItem value="harvesters">Harvesters</MenuItem>
              <MenuItem value="irrigation">Irrigation Systems</MenuItem>
              <MenuItem value="tools">Hand Tools</MenuItem>
              <MenuItem value="sprayers">Sprayers</MenuItem>
              <MenuItem value="processing">Processing Equipment</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="outlined" startIcon={<FilterList />} sx={{ height: 56 }}>
              More
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box position="relative">
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images?.[0] || NO_IMAGE}
                  alt={product.name}
                  onError={onImageError}
                />
                {product.stock < 5 && product.stock > 0 && (
                  <Chip
                    label="Low Stock"
                    color="warning"
                    size="small"
                    sx={{ position: 'absolute', top: 8, left: 8 }}
                  />
                )}
                {product.stock === 0 && (
                  <Chip
                    label="Out of Stock"
                    color="error"
                    size="small"
                    sx={{ position: 'absolute', top: 8, left: 8 }}
                  />
                )}
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8, ...neuRaised('xs') }}
                  size="small"
                >
                  <FavoriteBorder />
                </IconButton>
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {product.category}
                </Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                  {product.description?.substring(0, 80)}...
                </Typography>

                <Box mt={2}>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    {money(product.price?.amount)}
                  </Typography>
                  {product.price?.originalPrice && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      {money(product.price.originalPrice)}
                    </Typography>
                  )}
                </Box>

                {product.shipping?.freeShipping && (
                  <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                    <LocalShipping fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main">
                      Free Shipping
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button size="small" fullWidth variant="outlined" onClick={() => openDetails(product)}>
                  View Details
                </Button>
                <Button
                  size="small"
                  fullWidth
                  variant="contained"
                  startIcon={adding === product._id ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
                  onClick={requireAuth(() => handleAddToCart(product._id))}
                  disabled={product.stock === 0 || adding === product._id}
                >
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProducts.length === 0 && !loading && (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Paper>
      )}

      {/* Details — same shape as the wholesale market's, so the two
          catalogues read the same way. */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="h6" fontWeight="bold" component="span">
              {selected?.name}
            </Typography>
            {selected?.stock === 0 ? (
              <Chip size="small" color="error" label="Out of stock" />
            ) : selected?.stock < 5 ? (
              <Chip size="small" color="warning" label="Low stock" />
            ) : null}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={5}>
                <Box
                  component="img"
                  src={selected.images?.[0] || NO_IMAGE}
                  alt={selected.name}
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
                <Box display="flex" alignItems="baseline" gap={1.5} flexWrap="wrap">
                  <Typography variant="h4" color="primary.main" fontWeight="bold" lineHeight={1.2}>
                    {money(selected.price?.amount)}
                  </Typography>
                  {selected.price?.originalPrice && (
                    <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      {money(selected.price.originalPrice)}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2.5 }}>
                  <Fact icon={<Inventory2 fontSize="small" />} label="In stock">
                    {selected.stock > 0 ? `${selected.stock} available` : 'None left'}
                  </Fact>
                  <Fact icon={<Category fontSize="small" />} label="Category">
                    {selected.category}
                  </Fact>
                  <Fact icon={<LocalShipping fontSize="small" />} label="Shipping">
                    {selected.shipping?.freeShipping ? 'Free shipping' : 'Charged at checkout'}
                  </Fact>
                  {selected.price?.originalPrice > selected.price?.amount && (
                    <Fact icon={<LocalOffer fontSize="small" />} label="You save">
                      {money(selected.price.originalPrice - selected.price.amount)}
                    </Fact>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selected.description || 'No description available'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            disabled={!selected || selected.stock === 0 || adding === selected?._id}
            onClick={requireAuth(() => handleAddToCart(selected._id))}
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((v) => ({ ...v, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((v) => ({ ...v, open: false }))}
          action={
            snack.severity === 'success' ? (
              <Button color="inherit" size="small" onClick={() => navigate('/marketplace/cart')}>
                View cart
              </Button>
            ) : null
          }
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EquipmentCatalog;
