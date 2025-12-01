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
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  FilterList,
  LocalShipping,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EquipmentCatalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);

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
    try {
      await api.post('/marketplace/cart', { productId, quantity: 1 });
      setCartCount(cartCount + 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
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
                  image={product.images?.[0] || 'https://via.placeholder.com/300x200?text=Equipment'}
                  alt={product.name}
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
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
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
                    ${product.price?.amount}
                  </Typography>
                  {product.price?.originalPrice && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      ${product.price.originalPrice}
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
                <Button
                  size="small"
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(`/marketplace/products/${product._id}`)}
                >
                  View Details
                </Button>
                <Button
                  size="small"
                  fullWidth
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={() => handleAddToCart(product._id)}
                  disabled={product.stock === 0}
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
    </Container>
  );
};

export default EquipmentCatalog;
