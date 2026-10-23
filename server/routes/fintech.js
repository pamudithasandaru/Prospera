const express = require('express');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { serializeLoan, serializeCreditScore } = require('../services/serializers');

const router = express.Router();

// Shown when a user has no credit history on file yet.
const DEFAULT_CREDIT_SCORE = { score: 0, rating: 'Unrated', lastUpdated: null };

// ── GET /api/fintech/loans — the caller's own loans ─────────────────────────
// Previously returned every loan in the database to any authenticated user.
router.get('/loans', authenticate, async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      where: { userId: req.user.id },
      orderBy: { appliedAt: 'desc' },
    });
    return res.json({ success: true, data: loans.map(serializeLoan) });
  } catch (err) {
    console.error('Fetch loans error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch loans' });
  }
});

// ── POST /api/fintech/loans ─────────────────────────────────────────────────
router.post('/loans', authenticate, async (req, res) => {
  const { amount, purpose, duration } = req.body;

  if (amount === undefined || !purpose || duration === undefined) {
    return res.status(400).json({ success: false, message: 'Amount, purpose, and duration are required' });
  }

  const amountNum = Number(amount);
  const durationNum = Number(duration);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
  }
  if (!Number.isInteger(durationNum) || durationNum <= 0) {
    return res.status(400).json({ success: false, message: 'Duration must be a positive whole number of months' });
  }

  try {
    const loan = await prisma.loan.create({
      data: {
        userId: req.user.id,
        amount: amountNum,
        purpose,
        duration: durationNum,
        status: 'pending',
      },
    });
    return res.status(201).json({ success: true, data: serializeLoan(loan) });
  } catch (err) {
    console.error('Create loan error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to submit loan application' });
  }
});

// ── GET /api/fintech/credit-score — the caller's own score ──────────────────
router.get('/credit-score', authenticate, async (req, res) => {
  try {
    const score = await prisma.creditScore.findUnique({ where: { userId: req.user.id } });
    return res.json({ success: true, data: score ? serializeCreditScore(score) : DEFAULT_CREDIT_SCORE });
  } catch (err) {
    console.error('Fetch credit score error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch credit score' });
  }
});

module.exports = router;
