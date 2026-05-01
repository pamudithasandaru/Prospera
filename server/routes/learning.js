const express = require('express');
const { db, isFirestoreEnabled } = require('../services/firestore');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ── GET all courses ──────────────────────────────────────────────────────────
router.get('/courses', async (req, res) => {
  try {
    if (isFirestoreEnabled && db) {
      const snap = await db.collection('courses').orderBy('createdAt', 'desc').get().catch(() =>
        // Fallback if createdAt index doesn't exist yet
        db.collection('courses').get()
      );
      const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
      return res.json({ success: true, data });
    }
    return res.json({ success: true, data: [] });
  } catch (err) {
    console.error('Error fetching courses:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

// ── GET single course by ID ──────────────────────────────────────────────────
router.get('/courses/:id', async (req, res) => {
  try {
    if (isFirestoreEnabled && db) {
      const doc = await db.collection('courses').doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      return res.json({ success: true, data: { _id: doc.id, ...doc.data() } });
    }
    return res.status(404).json({ success: false, message: 'Course not found' });
  } catch (err) {
    console.error('Error fetching course:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch course' });
  }
});

// ── POST create a new course (expert only) ───────────────────────────────────
router.post('/courses', authenticate, async (req, res) => {
  try {
    // Role check
    if (req.user.role !== 'expert') {
      return res.status(403).json({ success: false, message: 'Only experts can create courses' });
    }

    if (!isFirestoreEnabled || !db) {
      return res.status(503).json({ success: false, message: 'Database not available' });
    }

    const { title, description, category, level, duration, thumbnail, videos, materials } = req.body;

    if (!title || !description || !category || !level || !duration) {
      return res.status(400).json({ success: false, message: 'Title, description, category, level, and duration are required' });
    }

    const courseData = {
      title,
      description,
      category,
      level,
      duration: Number(duration),
      thumbnail: thumbnail || '',
      videos: videos || [],
      materials: materials || [],
      rating: { average: 0, count: 0 },
      instructor: { name: req.user.name },
      enrolledStudents: 0,
      createdBy: req.user._id,
      createdByName: req.user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('courses').add(courseData);
    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { _id: docRef.id, ...courseData },
    });
  } catch (err) {
    console.error('Error creating course:', err);
    return res.status(500).json({ success: false, message: 'Failed to create course' });
  }
});

// ── PUT update a course (owner only) ─────────────────────────────────────────
router.put('/courses/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'expert') {
      return res.status(403).json({ success: false, message: 'Only experts can update courses' });
    }

    if (!isFirestoreEnabled || !db) {
      return res.status(503).json({ success: false, message: 'Database not available' });
    }

    const docRef = db.collection('courses').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Ownership check
    const courseData = doc.data();
    if (courseData.createdBy && courseData.createdBy !== req.user._id) {
      return res.status(403).json({ success: false, message: 'You can only edit courses you created' });
    }

    const { title, description, category, level, duration, thumbnail, videos, materials } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (level !== undefined) updates.level = level;
    if (duration !== undefined) updates.duration = Number(duration);
    if (thumbnail !== undefined) updates.thumbnail = thumbnail;
    if (videos !== undefined) updates.videos = videos;
    if (materials !== undefined) updates.materials = materials;
    updates.updatedAt = new Date().toISOString();

    await docRef.update(updates);

    const updatedDoc = await docRef.get();
    return res.json({
      success: true,
      message: 'Course updated successfully',
      data: { _id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (err) {
    console.error('Error updating course:', err);
    return res.status(500).json({ success: false, message: 'Failed to update course' });
  }
});

// ── DELETE a course (owner only) ─────────────────────────────────────────────
router.delete('/courses/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'expert') {
      return res.status(403).json({ success: false, message: 'Only experts can delete courses' });
    }

    if (!isFirestoreEnabled || !db) {
      return res.status(503).json({ success: false, message: 'Database not available' });
    }

    const docRef = db.collection('courses').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Ownership check
    const courseData = doc.data();
    if (courseData.createdBy && courseData.createdBy !== req.user._id) {
      return res.status(403).json({ success: false, message: 'You can only delete courses you created' });
    }

    await docRef.delete();
    return res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
});

module.exports = router;
