/**
 * server/routes/stories.js
 * 24-hour disappearing stories. TTL enforced via `expiresAt` timestamp.
 */
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');
const { body, validationResult } = require('express-validator');
const { generateId } = require('../data/sampleData');

const router = express.Router();
const TIMEOUT = 5000;
const withTimeout = (p) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('Firestore timeout')), TIMEOUT))]);

const STORY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory fallback
let memStories = [];

// ── GET /api/stories — get all active stories (not expired) ──────────────────
router.get('/', authenticate, async (req, res) => {
  const now = new Date();

  if (isFirestoreEnabled && db) {
    try {
      const snap = await withTimeout(
        db.collection('stories')
          .where('expiresAt', '>', now)
          .orderBy('expiresAt', 'asc')
          .get()
      );
      const data = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
      // Group by author
      const grouped = groupByAuthor(data);
      return res.json({ success: true, data: grouped });
    } catch (err) {
      console.error('Firestore stories error:', err.message);
    }
  }

  const active = memStories.filter((s) => new Date(s.expiresAt) > now);
  return res.json({ success: true, data: groupByAuthor(active) });
});

// ── POST /api/stories — create a new story ──────────────────────────────────
router.post(
  '/',
  authenticate,
  [
    body('mediaUrl').notEmpty().withMessage('Media URL is required'),
    body('mediaType').isIn(['image', 'video', 'text']).withMessage('Invalid media type'),
    body('text').optional().isString().isLength({ max: 500 }),
    body('backgroundColor').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { mediaUrl, mediaType, text, backgroundColor } = req.body;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + STORY_TTL_MS);

    const story = {
      author: {
        _id: req.user._id,
        name: req.user.name,
        avatar: req.user.avatar || '',
      },
      mediaUrl,
      mediaType,
      text: text || '',
      backgroundColor: backgroundColor || '#1B5E20',
      views: [],
      createdAt: now,
      expiresAt,
    };

    if (isFirestoreEnabled && db) {
      try {
        const ref = db.collection('stories').doc();
        await withTimeout(ref.set(story));
        return res.status(201).json({ success: true, data: { _id: ref.id, ...story } });
      } catch (err) {
        console.error('Firestore create-story error:', err.message);
      }
    }

    const saved = { _id: generateId('story'), ...story };
    memStories.push(saved);
    return res.status(201).json({ success: true, data: saved });
  }
);

// ── POST /api/stories/:id/view — mark a story as viewed ─────────────────────
router.post('/:id/view', authenticate, async (req, res) => {
  const viewerId = req.user._id;

  if (isFirestoreEnabled && db) {
    try {
      const ref = db.collection('stories').doc(req.params.id);
      const snap = await withTimeout(ref.get());
      if (!snap.exists) {
        return res.status(404).json({ success: false, message: 'Story not found' });
      }
      const views = snap.data().views || [];
      if (!views.find((v) => v.userId === viewerId)) {
        await withTimeout(
          ref.update({ views: [...views, { userId: viewerId, viewedAt: new Date() }] })
        );
      }
      return res.json({ success: true });
    } catch (err) {
      console.error('Firestore view-story error:', err.message);
    }
  }

  const story = memStories.find((s) => s._id === req.params.id);
  if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
  if (!story.views.find((v) => v.userId === viewerId)) {
    story.views.push({ userId: viewerId, viewedAt: new Date() });
  }
  return res.json({ success: true });
});

// ── DELETE /api/stories/:id — delete own story ───────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  const userId = req.user._id;

  if (isFirestoreEnabled && db) {
    try {
      const ref = db.collection('stories').doc(req.params.id);
      const snap = await withTimeout(ref.get());
      if (!snap.exists) return res.status(404).json({ success: false, message: 'Story not found' });
      if (snap.data().author?._id !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      await withTimeout(ref.delete());
      return res.json({ success: true });
    } catch (err) {
      console.error('Firestore delete-story error:', err.message);
    }
  }

  const idx = memStories.findIndex((s) => s._id === req.params.id && s.author._id === userId);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Story not found' });
  memStories.splice(idx, 1);
  return res.json({ success: true });
});

// ── Helper: group stories by author ─────────────────────────────────────────
function groupByAuthor(stories) {
  const map = {};
  for (const story of stories) {
    const authorId = story.author?._id;
    if (!authorId) continue;
    if (!map[authorId]) {
      map[authorId] = {
        author: story.author,
        stories: [],
        hasUnviewed: false,
      };
    }
    map[authorId].stories.push(story);
  }
  return Object.values(map);
}

module.exports = router;
