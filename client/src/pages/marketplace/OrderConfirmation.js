import React, { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, HourglassEmpty, ErrorOutline, Storefront, Receipt } from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { money, NO_IMAGE, onImageError } from '../../utils/catalogue';
import { neuColors } from '../../neumorphic';

const STATUS = {
  paid: { icon: <CheckCircle sx={{ fontSize: 48 }} color="success" />, title: 'Payment received', tone: 'success' },
  pending: { icon: <HourglassEmpty sx={{ fontSize: 48 }} color="warning" />, title: 'Payment not completed', tone: 'warning' },
  failed: { icon: <ErrorOutline sx={{ fontSize: 48 }} color="error" />, title: 'Payment failed', tone: 'error' },
  cancelled: { icon: <ErrorOutline sx={{ fontSize: 48 }} color="error" />, title: 'Order cancelled', tone: 'error' },
};

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await api.get(`/marketplace/orders/${orderId}`);
    setOrder(res.data.data);
    return res.data.data;
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const found = await load();
        if (cancelled) return;

        // Stripe sends the browser back here after a redirect-based method or
        // a 3DS challenge, so a still-pending order gets one settle attempt.
        const returned = searchParams.get('redirect_status') === 'succeeded';
        if (found.status === 'pending' && returned) {
          try {
            const settled = await api.post(`/marketplace/orders/${orderId}/settle`);
            if (!cancelled) setOrder(settled.data.data);
            await refresh();
          } catch {
            // Leave it pending — the webhook settles it if the money arrived.
          }
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load this order.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4, textAlign: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error || 'Order not found.'}</Alert>
          <Button variant="contained" onClick={() => navigate('/marketplace')}>Back to marketplace</Button>
        </Paper>
      </Container>
    );
  }

  const view = STATUS[order.status] || STATUS.pending;

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Box textAlign="center" mb={3}>
          {view.icon}
          <Typography variant="h5" fontWeight={800} mt={1}>{view.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Order {order._id.slice(-8).toUpperCase()}
          </Typography>
          <Chip
            size="small"
            label={order.status}
            color={view.tone}
            sx={{ mt: 1, textTransform: 'capitalize' }}
          />
        </Box>

        {order.status === 'pending' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            We have not seen a completed payment for this order yet. If you were charged, it will
            reconcile automatically within a few minutes.
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

        {order.items.map((item) => (
          <Box key={item._id} display="flex" alignItems="center" gap={2} mb={2}>
            <Box
              component="img"
              src={item.image || NO_IMAGE}
              alt={item.name}
              onError={onImageError}
              sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 2, bgcolor: neuColors.baseDeep, flexShrink: 0 }}
            />
            <Box flexGrow={1} minWidth={0}>
              <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {money(item.unitPrice)} × {item.quantity}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={700} whiteSpace="nowrap">
              {money(item.unitPrice * item.quantity)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={1}>
          <Typography variant="subtitle1" fontWeight={700}>Total paid</Typography>
          <Typography variant="h5" color="primary.main" fontWeight={800}>{money(order.total)}</Typography>
        </Box>

        {order.paidAt && (
          <Typography variant="caption" color="text.secondary">
            Paid on {new Date(order.paidAt).toLocaleString()}
          </Typography>
        )}

        <Box display="flex" gap={1.5} mt={4} flexWrap="wrap">
          <Button variant="contained" startIcon={<Storefront />} onClick={() => navigate('/marketplace')}>
            Keep shopping
          </Button>
          <Button startIcon={<Receipt />} onClick={() => navigate('/marketplace/orders')}>
            My orders
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation;
