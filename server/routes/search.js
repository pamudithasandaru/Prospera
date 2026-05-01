/**
 * server/routes/search.js
 * Search across users, posts, and hashtags.
 */
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');
const { users, socialPosts } = require('../data/sampleData');
const { query, validationResult } = require('express-validator');

const router = express.Router();
const TIMEOUT = 5000;
const withTimeout = (p) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('Firestore timeout')), TIMEOUT))]);

// ── GET /api/search?q=<query>&type=all|users|posts|hashtags ──────────────────
router.get(
  '/',
  authenticate,
  [
    query('q').notEmpty().isLength({ min: 1, max: 100 }).trim(),
    query('type').optional().isIn(['all', 'users', 'posts', 'hashtags']),
  ],
  async (req, res) => {
    // Validate — do NOT use .escape() as it HTML-encodes the query and breaks matching
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const q = (req.query.q || '').toLowerCase().trim();
    const type = req.query.type || 'all';
    const limit = 10;

    const results = { users: [], posts: [], hashtags: [] };

    if (isFirestoreEnabled && db) {
      try {
        // ── User search ─────────────────────────────────────────────────────
        if (type === 'all' || type === 'users') {
          // Firestore doesn't support native full-text search.
          // Fetch a broad set then filter by substring in JS (case-insensitive).
          const snap = await withTimeout(
            db.collection('users').limit(100).get()
          );
          results.users = snap.docs
            .map((d) => {
              const { passwordHash, ...safe } = d.data();
              return { _id: d.id, ...safe };
            })
            .filter((u) =>
              (u.name || '').toLowerCase().includes(q) ||
              (u.email || '').toLowerCase().includes(q) ||
              (u.role || '').toLowerCase().includes(q)
            )
            .slice(0, limit);
        }

        // ── Post search ─────────────────────────────────────────────────────
        if (type === 'all' || type === 'posts') {
          const snap = await withTimeout(
            db.collection('socialPosts')
              .orderBy('createdAt', 'desc')
              .limit(50)
              .get()
          );
          const allPosts = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
          results.posts = allPosts
            .filter((p) => {
              const text = (typeof p.content === 'string' ? p.content : p.content?.text || '').toLowerCase();
              const tags = (p.tags || []).join(' ').toLowerCase();
              return text.includes(q) || tags.includes(q);
            })
            .slice(0, limit);
        }

        // ── Hashtag search ──────────────────────────────────────────────────
        if (type === 'all' || type === 'hashtags') {
          const snap = await withTimeout(
            db.collection('socialPosts').orderBy('createdAt', 'desc').limit(100).get()
          );
          const tagCounts = {};
          snap.docs.forEach((d) => {
            (d.data().tags || []).forEach((tag) => {
              const t = tag.toLowerCase();
              if (t.includes(q)) tagCounts[t] = (tagCounts[t] || 0) + 1;
            });
            const cat = d.data().category;
            if (cat && cat.toLowerCase().includes(q)) {
              tagCounts[cat] = (tagCounts[cat] || 0) + 1;
            }
          });
          results.hashtags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag, count]) => ({ tag: `#${tag}`, posts: count }));
        }

        return res.json({ success: true, data: results });
      } catch (err) {
        console.error('Firestore search error:', err.message);
        // Fall through to in-memory
      }
    }

    // ── In-memory fallback ────────────────────────────────────────────────────
    if (type === 'all' || type === 'users') {
      results.users = users
        .filter((u) =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.role || '').toLowerCase().includes(q)
        )
        .slice(0, limit)
        .map(({ passwordHash, ...safe }) => safe);
    }

    if (type === 'all' || type === 'posts') {
      results.posts = socialPosts
        .filter((p) => {
          const text = (typeof p.content === 'string' ? p.content : p.content?.text || '').toLowerCase();
          return text.includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q));
        })
        .slice(0, limit);
    }

    if (type === 'all' || type === 'hashtags') {
      const tagCounts = {};
      socialPosts.forEach((p) => {
        (p.tags || []).forEach((tag) => {
          if (tag.toLowerCase().includes(q)) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      results.hashtags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag, count]) => ({ tag: `#${tag}`, posts: count }));
    }

    return res.json({ success: true, data: results });
  }
);

module.exports = router;
