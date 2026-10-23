/**
 * server/routes/search.js
 * Search across users, posts, and hashtags (post categories).
 */
const express = require('express');
const { query, validationResult } = require('express-validator');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { SUPER_ADMIN_ID } = require('../services/superAdmin');
const { serializeUser, serializePost } = require('../services/serializers');

const router = express.Router();

const LIMIT = 10;

/**
 * `contains` compiles to LIKE '%value%', so bare % and _ in user input would
 * act as wildcards. Neutralise them — this is about match correctness, not
 * injection (values are always parameterised).
 */
const escapeLike = (s) => s.replace(/[%_\\]/g, '\\$&');

const POST_INCLUDE = {
  author: true,
  likes: true,
  comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
};

// ── GET /api/search?q=<query>&type=all|users|posts|hashtags ─────────────────
router.get(
  '/',
  authenticate,
  [
    // No .escape() — HTML-encoding the query would break matching.
    query('q').notEmpty().isLength({ min: 1, max: 100 }).trim(),
    query('type').optional().isIn(['all', 'users', 'posts', 'hashtags']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const raw = (req.query.q || '').trim();
    const q = escapeLike(raw);
    const type = req.query.type || 'all';
    const insensitive = { contains: q, mode: 'insensitive' };

    const results = { users: [], posts: [], hashtags: [] };

    try {
      const tasks = [];

      if (type === 'all' || type === 'users') {
        tasks.push(
          prisma.user
            .findMany({
              where: {
                // Exclude the infrastructure-only super admin row.
                id: { not: SUPER_ADMIN_ID },
                OR: [{ name: insensitive }, { email: insensitive }],
              },
              take: LIMIT,
              orderBy: { name: 'asc' },
            })
            .then((rows) => { results.users = rows.map(serializeUser); })
        );
      }

      if (type === 'all' || type === 'posts') {
        tasks.push(
          prisma.socialPost
            .findMany({
              where: {
                visibility: 'public',
                OR: [{ text: insensitive }, { category: insensitive }],
              },
              include: POST_INCLUDE,
              take: LIMIT,
              orderBy: { createdAt: 'desc' },
            })
            .then((rows) => { results.posts = rows.map(serializePost); })
        );
      }

      if (type === 'all' || type === 'hashtags') {
        // Categories double as hashtags; group to get a post count per tag.
        tasks.push(
          prisma.socialPost
            .groupBy({
              by: ['category'],
              where: { visibility: 'public', category: insensitive },
              _count: { category: true },
              orderBy: { _count: { category: 'desc' } },
              take: LIMIT,
            })
            .then((rows) => {
              results.hashtags = rows.map((r) => ({
                tag: `#${r.category}`,
                posts: r._count.category,
              }));
            })
        );
      }

      await Promise.all(tasks);
      return res.json({ success: true, data: results });
    } catch (err) {
      console.error('Search error:', err.message);
      return res.status(500).json({ success: false, message: 'Search failed' });
    }
  }
);

module.exports = router;
