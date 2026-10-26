const express = require('express');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { serializeCourse } = require('../services/serializers');
const { normalizeVideos, normalizeMaterials } = require('../services/courseHelpers');
const chatbotSync = require('../services/chatbotSync');

const router = express.Router();

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
const COURSE_INCLUDE = {
  createdBy: true,
  videos: { orderBy: { position: 'asc' } },
  materials: { orderBy: { position: 'asc' } },
};

/** Course authoring stays restricted to the `expert` role, as before. */
const canAuthor = (user) => user.role === 'expert' || user.role === 'admin';


// ── GET /api/learning/courses ───────────────────────────────────────────────
router.get('/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: COURSE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: courses.map(serializeCourse) });
  } catch (err) {
    console.error('Error fetching courses:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

// ── GET /api/learning/courses/:id ───────────────────────────────────────────
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: COURSE_INCLUDE,
    });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.json({ success: true, data: serializeCourse(course) });
  } catch (err) {
    console.error('Error fetching course:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch course' });
  }
});

// ── POST /api/learning/courses — expert only ────────────────────────────────
router.post('/courses', authenticate, async (req, res) => {
  if (!canAuthor(req.user)) {
    return res.status(403).json({ success: false, message: 'Only experts can create courses' });
  }

  const { title, description, category, level, duration, thumbnail, videos, materials } = req.body;

  if (!title || !description || !category || !level || duration === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Title, description, category, level, and duration are required',
    });
  }
  if (!VALID_LEVELS.includes(level)) {
    return res.status(400).json({ success: false, message: 'Invalid level' });
  }
  const hours = Number(duration);
  if (!Number.isFinite(hours) || hours <= 0) {
    return res.status(400).json({ success: false, message: 'Duration must be a positive number' });
  }

  const vids = normalizeVideos(videos);
  if (vids.error) return res.status(400).json({ success: false, message: vids.error });
  const mats = normalizeMaterials(materials);
  if (mats.error) return res.status(400).json({ success: false, message: mats.error });

  try {
    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level,
        duration: Math.round(hours),
        thumbnail: thumbnail || null,
        instructorName: req.user.name,
        createdById: req.user.id,
        ...(vids.rows.length ? { videos: { create: vids.rows } } : {}),
        ...(mats.rows.length ? { materials: { create: mats.rows } } : {}),
      },
      include: COURSE_INCLUDE,
    });

    chatbotSync.notify('course', course.id);
    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: serializeCourse(course),
    });
  } catch (err) {
    console.error('Error creating course:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create course' });
  }
});

// ── PUT /api/learning/courses/:id — author only ─────────────────────────────
router.put('/courses/:id', authenticate, async (req, res) => {
  if (!canAuthor(req.user)) {
    return res.status(403).json({ success: false, message: 'Only experts can update courses' });
  }

  const courseId = req.params.id;

  try {
    const existing = await prisma.course.findUnique({
      where: { id: courseId },
      select: { createdById: true },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    // Seeded courses have no creator and stay editable by any expert.
    if (existing.createdById && existing.createdById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit courses you created' });
    }

    const { title, description, category, level, duration, thumbnail, videos, materials } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (level !== undefined) {
      if (!VALID_LEVELS.includes(level)) {
        return res.status(400).json({ success: false, message: 'Invalid level' });
      }
      data.level = level;
    }
    if (duration !== undefined) {
      const hours = Number(duration);
      if (!Number.isFinite(hours) || hours <= 0) {
        return res.status(400).json({ success: false, message: 'Duration must be a positive number' });
      }
      data.duration = Math.round(hours);
    }
    if (thumbnail !== undefined) data.thumbnail = thumbnail;

    // Validate children up front; when an array is sent it replaces the existing rows.
    let videoRows = null;
    let materialRows = null;
    if (Array.isArray(videos)) {
      const r = normalizeVideos(videos);
      if (r.error) return res.status(400).json({ success: false, message: r.error });
      videoRows = r.rows;
    }
    if (Array.isArray(materials)) {
      const r = normalizeMaterials(materials);
      if (r.error) return res.status(400).json({ success: false, message: r.error });
      materialRows = r.rows;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) {
        await tx.course.update({ where: { id: courseId }, data });
      }
      if (videoRows) {
        await tx.courseVideo.deleteMany({ where: { courseId } });
        if (videoRows.length) {
          await tx.courseVideo.createMany({ data: videoRows.map((v) => ({ ...v, courseId })) });
        }
      }
      if (materialRows) {
        await tx.courseMaterial.deleteMany({ where: { courseId } });
        if (materialRows.length) {
          await tx.courseMaterial.createMany({ data: materialRows.map((m) => ({ ...m, courseId })) });
        }
      }
      return tx.course.findUnique({ where: { id: courseId }, include: COURSE_INCLUDE });
    });

    chatbotSync.notify('course', courseId);
    return res.json({
      success: true,
      message: 'Course updated successfully',
      data: serializeCourse(updated),
    });
  } catch (err) {
    console.error('Error updating course:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update course' });
  }
});

// ── DELETE /api/learning/courses/:id — author only ──────────────────────────
router.delete('/courses/:id', authenticate, async (req, res) => {
  if (!canAuthor(req.user)) {
    return res.status(403).json({ success: false, message: 'Only experts can delete courses' });
  }

  try {
    const existing = await prisma.course.findUnique({
      where: { id: req.params.id },
      select: { createdById: true },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (existing.createdById && existing.createdById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete courses you created' });
    }

    await prisma.course.delete({ where: { id: req.params.id } });
    chatbotSync.notify('course', req.params.id, 'delete');
    return res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
});

module.exports = router;
