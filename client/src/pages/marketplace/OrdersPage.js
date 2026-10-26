import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, Storefront } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { money } from '../../utils/catalogue';

const TONE = { paid: 'success', pending: 'warning', failed: 'error', cancelled: 'default' };

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/marketplace/orders')
      .then((res) => setOrders(res.data.data || []))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load your orders.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/marketplace')} sx={{ mb: 2 }}>
        Back to marketplace
      </Button>

      <Typography variant="h4" fontWeight="bold" gutterBottom>My Orders</Typography>

      {loading ? (
        <Box textAlign="center" py={8}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No orders yet</Typography>
          <Button variant="contained" startIcon={<Storefront />} onClick={() => navigate('/marketplace')} sx={{ mt: 2 }}>
            Browse equipment
          </Button>
        </Paper>
      ) : (
        orders.map((order) => (
          <Paper
            key={order._id}
            sx={{ p: 3, mb: 2, cursor: 'pointer' }}
            onClick={() => navigate(`/marketplace/orders/${order._id}`)}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Order {order._id.slice(-8).toUpperCase()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip size="small" label={order.status} color={TONE[order.status] || 'default'} sx={{ textTransform: 'capitalize' }} />
                <Typography variant="h6" fontWeight={800} color="primary.main">{money(order.total)}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="body2" color="text.secondary" noWrap>
              {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
            </Typography>
          </Paper>
        ))
      )}
    </Container>
  );
};

export default OrdersPage;
