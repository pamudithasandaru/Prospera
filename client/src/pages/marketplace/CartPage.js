import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Add, Remove, DeleteOutline, ArrowBack, LocalShipping, ShoppingCartCheckout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { money, NO_IMAGE, onImageError } from '../../utils/catalogue';
import { neuColors } from '../../neumorphic';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, loading, setQuantity, removeItem } = useCart();
  const [busyId, setBusyId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' });

  const fail = (err, fallback) =>
    setSnack({ open: true, message: err?.response?.data?.message || fallback, severity: 'error' });

  const change = async (productId, quantity) => {
    setBusyId(productId);
    try {
      await setQuantity(productId, quantity);
    } catch (err) {
      fail(err, 'Could not update the quantity.');
    } finally {
      setBusyId(null);
    }
  };

  const drop = async (productId) => {
    setBusyId(productId);
    try {
      await removeItem(productId);
    } catch (err) {
      fail(err, 'Could not remove that item.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading && items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/marketplace')} sx={{ mb: 2 }}>
        Continue shopping
      </Button>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Your Cart
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {items.length === 0 ? 'Nothing here yet.' : `${items.length} ${items.length === 1 ? 'item' : 'items'} ready to order`}
      </Typography>

      {items.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Button variant="contained" onClick={() => navigate('/marketplace')} sx={{ mt: 2 }}>
            Browse equipment
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              {items.map((item, idx) => {
                const product = item.product || {};
                const price = Number(product.price?.amount || 0);
                const atStockLimit = item.quantity >= (product.stock ?? 0);
                const busy = busyId === product._id;

                return (
                  <Box key={item._id}>
                    {idx > 0 && <Divider sx={{ my: 2 }} />}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                      <Box
                        component="img"
                        src={product.images?.[0] || NO_IMAGE}
                        alt={product.name}
                        onError={onImageError}
                        sx={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 3, bgcolor: neuColors.baseDeep, flexShrink: 0 }}
                      />

                      <Box sx={{ flexGrow: 1, minWidth: 140 }}>
                        <Typography variant="subtitle1" fontWeight={700}>{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {product.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {money(price)} each
                        </Typography>
                        {product.shipping?.freeShipping && (
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <LocalShipping fontSize="small" color="success" />
                            <Typography variant="caption" color="success.main">Free shipping</Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => change(product._id, item.quantity - 1)}
                          disabled={busy || item.quantity <= 1}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>
                          {item.quantity}
                        </Typography>
                        <Tooltip title={atStockLimit ? `Only ${product.stock} in stock` : ''}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => change(product._id, item.quantity + 1)}
                              disabled={busy || atStockLimit}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>

                      <Typography sx={{ minWidth: 120, textAlign: 'right', fontWeight: 700 }}>
                        {money(price * item.quantity)}
                      </Typography>

                      <IconButton color="error" onClick={() => drop(product._id)} disabled={busy}>
                        <DeleteOutline />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: { md: 'sticky' }, top: 88 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Order summary
              </Typography>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2" fontWeight={600}>{money(subtotal)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">Delivery</Typography>
                <Typography variant="body2" fontWeight={600}>Arranged after order</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={3}>
                <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={800}>
                  {money(subtotal)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ShoppingCartCheckout />}
                onClick={() => navigate('/marketplace/checkout')}
                disabled={items.length === 0}
              >
                Proceed to checkout
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

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

export default CartPage;
