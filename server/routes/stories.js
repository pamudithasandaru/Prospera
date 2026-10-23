/**
 * server/routes/stories.js
 * 24-hour disappearing stories. TTL enforced via the `expiresAt` column.
 */
const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { serializeStory } = require('../services/serializers');

const router = express.Router();

const STORY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const STORY_INCLUDE = { author: true, views: true };

/** Groups stories by author and flags which rings the viewer hasn't opened. */
function groupByAuthor(stories, viewerId) {
  const map = new Map();

  for (const story of stories) {
    const authorId = story.author?._id;
    if (!authorId) continue;

    if (!map.has(authorId)) {
      map.set(authorId, { author: story.author, stories: [], hasUnviewed: false });
    }
    const entry = map.get(authorId);
    entry.stories.push(story);
    if (!story.views.some((v) => v.userId === viewerId)) {
      entry.hasUnviewed = true;
    }
  }

  return Array.from(map.values());
}

// ── GET /api/stories — active (unexpired) stories, grouped by author ────────
router.get('/', authenticate, async (req, res) => {
  try {
    const rows = await prisma.story.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: STORY_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
    const stories = rows.map(serializeStory);
    return res.json({ success: true, data: groupByAuthor(stories, req.user.id) });
  } catch (err) {
    console.error('Fetch stories error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch stories' });
  }
});

// ── POST /api/stories ───────────────────────────────────────────────────────
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

    try {
      const story = await prisma.story.create({
        data: {
          authorId: req.user.id,
          mediaUrl,
          mediaType,
          text: text || '',
          backgroundColor: backgroundColor || '#1B5E20',
          expiresAt: new Date(Date.now() + STORY_TTL_MS),
        },
        include: STORY_INCLUDE,
      });
      return res.status(201).json({ success: true, data: serializeStory(story) });
    } catch (err) {
      console.error('Create story error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to create story' });
    }
  }
);

// ── POST /api/stories/:id/view ──────────────────────────────────────────────
router.post('/:id/view', authenticate, async (req, res) => {
  const storyId = req.params.id;
  const userId = req.user.id;

  try {
    const story = await prisma.story.findUnique({ where: { id: storyId }, select: { id: true } });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // The composite primary key makes a repeat view a no-op.
    await prisma.storyView.upsert({
      where: { storyId_userId: { storyId, userId } },
      update: {},
      create: { storyId, userId },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('View story error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to record view' });
  }
});

// ── DELETE /api/stories/:id — author only ───────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const story = await prisma.story.findUnique({
      where: { id: req.params.id },
      select: { authorId: true },
    });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    if (story.authorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await prisma.story.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete story error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete story' });
  }
});

module.exports = router;
