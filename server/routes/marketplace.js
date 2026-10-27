const express = require('express');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { serializeProduct, serializeOrder } = require('../services/serializers');
const payments = require('../services/stripe');

const router = express.Router();

// ── GET /api/marketplace/products ───────────────────────────────────────────
router.get('/products', async (req, res) => {
  const { category } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

  try {
    const products = await prisma.marketplaceProduct.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return res.json({ success: true, data: products.map(serializeProduct) });
  } catch (err) {
    console.error('Fetch products error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// ── POST /api/marketplace/cart — add to cart ────────────────────────────────
// The Firestore version only echoed the payload back; the cart now persists.
router.post('/cart', authenticate, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const qty = Number(quantity);

  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required' });
  }
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be a positive whole number' });
  }

  try {
    const product = await prisma.marketplaceProduct.findUnique({
      where: { id: productId },
      select: { id: true, stock: true },
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < qty) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    // Adding the same product twice tops up the existing line.
    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { quantity: { increment: qty } },
      create: { userId: req.user.id, productId, quantity: qty },
    });

    return res.status(201).json({
      success: true,
      message: 'Added to cart',
      data: { _id: item.id, productId: item.productId, quantity: item.quantity },
    });
  } catch (err) {
    console.error('Add to cart error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
});

// ── GET /api/marketplace/cart ───────────────────────────────────────────────
router.get('/cart', authenticate, async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { addedAt: 'desc' },
    });
    return res.json({
      success: true,
      data: items.map((i) => ({
        _id: i.id,
        quantity: i.quantity,
        product: serializeProduct(i.product),
      })),
    });
  } catch (err) {
    console.error('Fetch cart error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
});

// ── DELETE /api/marketplace/cart/:productId ─────────────────────────────────
router.delete('/cart/:productId', authenticate, async (req, res) => {
  try {
    const { count } = await prisma.cartItem.deleteMany({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    if (count === 0) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }
    return res.json({ success: true, message: 'Removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
});

// ── PATCH /api/marketplace/cart/:productId — set line quantity ──────────────
router.patch('/cart/:productId', authenticate, async (req, res) => {
  const qty = Number(req.body.quantity);

  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be a positive whole number' });
  }

  try {
    const product = await prisma.marketplaceProduct.findUnique({
      where: { id: req.params.productId },
      select: { stock: true },
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (product.stock < qty) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} left in stock` });
    }

    const { count } = await prisma.cartItem.updateMany({
      where: { userId: req.user.id, productId: req.params.productId },
      data: { quantity: qty },
    });
    if (count === 0) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    return res.json({ success: true, message: 'Quantity updated' });
  } catch (err) {
    console.error('Update cart error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update quantity' });
  }
});

// ── GET /api/marketplace/payment-config ─────────────────────────────────────
// The browser needs the publishable key to mount Stripe's card form. Serving
// it from here keeps one copy of the key, in the server's .env.
router.get('/payment-config', (req, res) =>
  res.json({
    success: true,
    data: {
      publishableKey: payments.publishableKey,
      currency: payments.CURRENCY,
      testMode: payments.isTestMode(),
      enabled: payments.isConfigured(),
    },
  })
);

// ── POST /api/marketplace/checkout — start a payment ────────────────────────
/**
 * Builds the order from the cart rows in the database. Nothing about the money
 * comes from the request body: a client that posts its own prices or quantities
 * would otherwise set what it pays.
 */
router.post('/checkout', authenticate, async (req, res) => {
  if (!payments.isConfigured()) {
    return res.status(503).json({ success: false, message: 'Payments are not configured on this server' });
  }

  try {
    const cart = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const short = cart.filter((i) => i.product.stock < i.quantity);
    if (short.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Not enough stock for ${short.map((i) => i.product.name).join(', ')}`,
      });
    }

    const total = cart.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
    const amountMinor = payments.toMinorUnits(total);

    if (amountMinor < 1) {
      return res.status(400).json({ success: false, message: 'Order total must be greater than zero' });
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        status: 'pending',
        currency: payments.CURRENCY.toUpperCase(),
        total,
        items: {
          create: cart.map((i) => ({
            productId: i.productId,
            name: i.product.name,
            unitPrice: i.product.price,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    const intent = await payments.stripe.paymentIntents.create({
      amount: amountMinor,
      currency: payments.CURRENCY,
      automatic_payment_methods: { enabled: true },
      // The order id travels with the payment so the webhook can settle an
      // order even when the customer never returns to the success page.
      metadata: { orderId: order.id, userId: req.user.id },
      description: `Prospera marketplace order ${order.id}`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: intent.id },
    });

    return res.status(201).json({
      success: true,
      data: {
        order: serializeOrder(order),
        clientSecret: intent.client_secret,
      },
    });
  } catch (err) {
    console.error('Checkout error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not start checkout' });
  }
});

/**
 * Moves a pending order to paid, exactly once.
 *
 * Both the success page and the Stripe webhook call this, and they can arrive
 * in either order or at the same time — so the status change is a conditional
 * update and the stock/cart work only runs for whichever call won it.
 */
async function settleOrder(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, reason: 'not-found' };
  if (order.status === 'paid') return { ok: true, order, alreadySettled: true };
  if (!order.stripePaymentIntentId) return { ok: false, reason: 'no-payment' };

  // Ask Stripe, never the caller, whether the money arrived.
  const intent = await payments.stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

  if (intent.status !== 'succeeded') {
    return { ok: false, reason: 'unpaid', paymentStatus: intent.status };
  }
  if (intent.amount_received < payments.toMinorUnits(order.total)) {
    console.error(`Order ${orderId}: underpaid (${intent.amount_received} < ${payments.toMinorUnits(order.total)})`);
    return { ok: false, reason: 'underpaid' };
  }

  const { count } = await prisma.order.updateMany({
    where: { id: orderId, status: 'pending' },
    data: { status: 'paid', paidAt: new Date() },
  });

  if (count === 1) {
    for (const item of order.items) {
      if (!item.productId) continue;
      // Guarded so a concurrent sale cannot push stock negative.
      const updated = await prisma.marketplaceProduct.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        console.warn(`Order ${orderId}: could not decrement stock for product ${item.productId}`);
      }
    }
    await prisma.cartItem.deleteMany({ where: { userId: order.userId } });
  }

  const settled = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  return { ok: true, order: settled, alreadySettled: count === 0 };
}

// ── POST /api/marketplace/orders/:orderId/settle ────────────────────────────
// Called by the browser once Stripe reports the payment confirmed.
router.post('/orders/:orderId/settle', authenticate, async (req, res) => {
  try {
    const owned = await prisma.order.findFirst({
      where: { id: req.params.orderId, userId: req.user.id },
      select: { id: true },
    });
    if (!owned) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const result = await settleOrder(req.params.orderId);

    if (!result.ok) {
      if (result.reason === 'unpaid') {
        return res.status(402).json({
          success: false,
          message: 'Payment has not completed yet',
          data: { paymentStatus: result.paymentStatus },
        });
      }
      return res.status(409).json({ success: false, message: 'Could not confirm this payment' });
    }

    return res.json({ success: true, data: serializeOrder(result.order) });
  } catch (err) {
    console.error('Settle order error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not confirm your payment' });
  }
});

// ── GET /api/marketplace/orders ─────────────────────────────────────────────
router.get('/orders', authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
    return res.json({ success: true, data: orders.map(serializeOrder) });
  } catch (err) {
    console.error('Fetch orders error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
});

// ── GET /api/marketplace/orders/:orderId ────────────────────────────────────
router.get('/orders/:orderId', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.orderId, userId: req.user.id },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.json({ success: true, data: serializeOrder(order) });
  } catch (err) {
    console.error('Fetch order error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load order' });
  }
});

// ── POST /api/marketplace/webhook — Stripe's own notification ───────────────
/**
 * The success page settling the order covers the normal path, but a customer
 * who pays and then closes the tab never loads it. Stripe retries this until
 * it gets a 2xx, so the order still lands.
 *
 * `express.raw` is mounted for this path in server/index.js — the signature is
 * computed over the exact bytes Stripe sent, which JSON parsing destroys.
 */
router.post('/webhook', async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!payments.isConfigured() || !secret) {
    return res.status(503).json({ received: false, message: 'Webhook not configured' });
  }

  let event;
  try {
    event = payments.stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], secret);
  } catch (err) {
    console.error('Stripe webhook signature check failed:', err.message);
    return res.status(400).json({ received: false });
  }

  try {
    const intent = event.data.object;
    const orderId = intent?.metadata?.orderId;

    if (orderId && event.type === 'payment_intent.succeeded') {
      const result = await settleOrder(orderId);
      console.log(`Webhook settled order ${orderId}:`, result.ok ? 'paid' : result.reason);
    } else if (orderId && event.type === 'payment_intent.payment_failed') {
      await prisma.order.updateMany({
        where: { id: orderId, status: 'pending' },
        data: { status: 'failed' },
      });
    }
  } catch (err) {
    // A 500 makes Stripe retry, which is what we want for a transient failure.
    console.error('Stripe webhook handling error:', err.message);
    return res.status(500).json({ received: false });
  }

  return res.json({ received: true });
});

module.exports = router;
