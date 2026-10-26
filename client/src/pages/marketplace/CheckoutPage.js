import React, { useEffect, useRef, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { ArrowBack, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { money } from '../../utils/catalogue';
import { neuColors } from '../../neumorphic';

/**
 * `loadStripe` must not run on every render, but the publishable key comes
 * from the API rather than a build-time env var — so the promise is cached
 * per key the first time a key is seen.
 */
let stripePromise = null;
let stripePromiseKey = null;
const getStripe = (key) => {
  if (!key) return null;
  if (stripePromiseKey !== key) {
    stripePromiseKey = key;
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

/** The card form itself — needs to be inside <Elements> to reach Stripe. */
const PaymentForm = ({ order, onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');

    // `redirect: 'if_required'` keeps cards inline; methods that genuinely
    // need a redirect (and 3DS challenges) still send the browser away and
    // come back to return_url.
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/marketplace/orders/${order._id}`,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message || 'Your payment could not be processed.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        // Stripe told the browser it worked; the server asks Stripe itself
        // before it will mark the order paid.
        await api.post(`/marketplace/orders/${order._id}/settle`);
        onPaid(order._id);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            'Your payment went through but we could not confirm the order. It will be reconciled shortly.'
        );
        setSubmitting(false);
      }
      return;
    }

    setError(`Payment is ${paymentIntent?.status || 'incomplete'}. Please try another method.`);
    setSubmitting(false);
  };

  return (
    <Box component="form" onSubmit={submit}>
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        startIcon={<Lock />}
        disabled={!stripe || submitting}
        sx={{ mt: 3 }}
      >
        {submitting ? 'Processing…' : `Pay ${money(order.total)}`}
      </Button>
    </Box>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, refresh } = useCart();

  const [config, setConfig] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(true);

  // StrictMode mounts, unmounts and remounts in development. This ref is what
  // keeps one visit to one order — and it has to be the ONLY guard: an
  // abort-on-cleanup flag would be set by that first synthetic unmount and
  // would then cancel the single run this ref allows, leaving the page
  // spinning forever with no order ever created.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const cfg = await api.get('/marketplace/payment-config');
        setConfig(cfg.data.data);

        if (!cfg.data.data.enabled) {
          setError('Payments are not configured on this server.');
          return;
        }

        // Creating the order here (not on the Pay click) means the amount is
        // fixed by the server before the card form is ever shown.
        const res = await api.post('/marketplace/checkout');
        setOrder(res.data.data.order);
        setClientSecret(res.data.data.clientSecret);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not start checkout.');
      } finally {
        setStarting(false);
      }
    })();
    // Runs once: re-running would open a second payment for the same cart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPaid = async (orderId) => {
    await refresh();
    navigate(`/marketplace/orders/${orderId}`, { replace: true });
  };

  const stripeObj = getStripe(config?.publishableKey);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/marketplace/cart')} sx={{ mb: 2 }}>
        Back to cart
      </Button>

      <Box display="flex" alignItems="center" gap={1.5} mb={3} flexWrap="wrap">
        <Typography variant="h4" fontWeight="bold">Checkout</Typography>
        {config?.testMode && (
          <Chip size="small" color="warning" label="Stripe test mode" />
        )}
      </Box>

      {starting ? (
        <Box textAlign="center" py={8}><CircularProgress /></Box>
      ) : error ? (
        <Paper sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button variant="contained" onClick={() => navigate('/marketplace/cart')}>
            Back to cart
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Payment details
              </Typography>

              {config?.testMode && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Test mode — use card <strong>4242 4242 4242 4242</strong>, any future expiry, any CVC.
                  No real money moves.
                </Alert>
              )}

              {clientSecret && stripeObj && (
                <Elements
                  stripe={stripeObj}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'flat',
                      variables: {
                        colorBackground: neuColors.base,
                        colorText: neuColors.text,
                        colorPrimary: neuColors.primary,
                        colorDanger: neuColors.error,
                        borderRadius: '14px',
                        fontFamily: 'Poppins, system-ui, sans-serif',
                      },
                    },
                  }}
                >
                  <PaymentForm order={order} onPaid={onPaid} />
                </Elements>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Order summary
              </Typography>

              {/* The order's own lines, not the cart's — this is what will be
                  charged, frozen at the price checkout started with. */}
              {(order?.items || items).map((line) => {
                const name = line.name || line.product?.name;
                const unit = line.unitPrice ?? line.product?.price?.amount;
                return (
                  <Box key={line._id} display="flex" justifyContent="space-between" gap={2} mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      {name} × {line.quantity}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} whiteSpace="nowrap">
                      {money(Number(unit) * line.quantity)}
                    </Typography>
                  </Box>
                );
              })}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="baseline">
                <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                <Typography variant="h5" color="primary.main" fontWeight={800}>
                  {money(order?.total ?? subtotal)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CheckoutPage;
