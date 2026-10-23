const express = require('express');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { serializeProduct } = require('../services/serializers');

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

module.exports = router;
