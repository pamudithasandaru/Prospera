const express = require('express');
const { marketplaceProducts } = require('../data/sampleData');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

router.get('/products', async (req, res) => {
  if (isFirestoreEnabled && db) {
    const snap = await db.collection('marketplaceProducts').get();
    const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    return res.json({ success: true, data });
  }
  return res.json({ success: true, data: marketplaceProducts });
});

router.post('/cart', authenticate, async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (isFirestoreEnabled && db) {
    const productSnap = await db.collection('marketplaceProducts').doc(productId).get();
    if (!productSnap.exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(201).json({ success: true, message: 'Added to cart', data: { productId, quantity } });
  }

  const product = marketplaceProducts.find((p) => p._id === productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  return res.status(201).json({ success: true, message: 'Added to cart', data: { productId, quantity } });
});

module.exports = router;
