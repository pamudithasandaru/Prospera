const express = require('express');
const { socialPosts, users, groups, generateId } = require('../data/sampleData');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled, admin } = require('../services/firestore');

const router = express.Router();

const getUserFromRequest = (req) => req.user || users[0];

router.get('/posts', async (req, res) => {
  const { sortBy, userId } = req.query;

  if (isFirestoreEnabled && db) {
    let query = db.collection('socialPosts').orderBy('createdAt', 'desc');
    if (userId) query = db.collection('socialPosts').where('user._id', '==', userId).orderBy('createdAt', 'desc');
    const snap = await query.get();
    let data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    if (sortBy === 'trending') {
      data = data.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    }
    return res.json({ success: true, data });
  }

  let data = userId
    ? socialPosts.filter((p) => (p.user?._id || p.author?._id) === userId)
    : [...socialPosts];
  if (sortBy === 'trending') {
    data = data.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  } else {
    data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return res.json({ success: true, data });
});

router.post('/post', authenticate, async (req, res) => {
  const user = getUserFromRequest(req);
  const { content = {}, type = 'post', category = 'general', visibility = 'public' } = req.body;
  if (!content.text && !content.images?.length) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }

  const newPost = {
    user: { _id: user._id, name: user.name, role: user.role, avatar: user.avatar },
    content,
    type,
    category,
    visibility,
    likes: [],
    comments: [],
    createdAt: new Date(),
  };

  if (isFirestoreEnabled && db) {
    const docRef = db.collection('socialPosts').doc();
    await docRef.set(newPost);
    return res.status(201).json({ success: true, data: { _id: docRef.id, ...newPost } });
  }

  const inMemoryPost = { _id: generateId('post'), ...newPost };
  socialPosts.unshift(inMemoryPost);
  return res.status(201).json({ success: true, data: inMemoryPost });
});

router.post('/post/:id/like', authenticate, async (req, res) => {
  const userId = req.user._id;

  if (isFirestoreEnabled && db) {
    const docRef = db.collection('socialPosts').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const post = { _id: snap.id, ...snap.data() };
    const already = (post.likes || []).find((like) => like.user === userId);
    const updatedLikes = already
      ? post.likes.filter((like) => like.user !== userId)
      : [...(post.likes || []), { user: userId, date: new Date() }];
    await docRef.update({ likes: updatedLikes });
    return res.json({ success: true, data: { ...post, likes: updatedLikes } });
  }

  const post = socialPosts.find((p) => p._id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  const already = post.likes?.find((like) => like.user === userId);
  if (already) {
    post.likes = post.likes.filter((like) => like.user !== userId);
  } else {
    post.likes = [...(post.likes || []), { user: userId, date: new Date() }];
  }
  return res.json({ success: true, data: post });
});

router.post('/post/:id/comment', authenticate, async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
  }

  if (isFirestoreEnabled && db) {
    const docRef = db.collection('socialPosts').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const comment = {
      _id: generateId('comment'),
      user: { _id: req.user._id, name: req.user.name },
      text,
      createdAt: new Date(),
    };
    const comments = [...(snap.data().comments || []), comment];
    await docRef.update({ comments });
    return res.status(201).json({ success: true, data: comment });
  }

  const post = socialPosts.find((p) => p._id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  const comment = {
    _id: generateId('comment'),
    user: { _id: req.user._id, name: req.user.name },
    text,
    createdAt: new Date(),
  };
  post.comments = [...(post.comments || []), comment];
  return res.status(201).json({ success: true, data: comment });
});

// GET suggested groups
router.get('/groups', async (req, res) => {
  if (isFirestoreEnabled && db) {
    const snap = await db.collection('groups').orderBy('memberCount', 'desc').limit(10).get();
    if (!snap.empty) {
      const data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
      return res.json({ success: true, data });
    }
    // Firestore enabled but no groups collection yet — seed it from sample data then return
    const batch = db.batch();
    groups.forEach((g) => {
      const ref = db.collection('groups').doc(g._id);
      batch.set(ref, g, { merge: true });
    });
    await batch.commit();
    return res.json({ success: true, data: groups });
  }
  return res.json({ success: true, data: groups });
});

// GET suggested farmers (other registered users, farmers only)
router.get('/farmers', authenticate, async (req, res) => {
  const currentUserId = req.user._id;

  if (isFirestoreEnabled && db) {
    const snap = await db.collection('users').where('role', '==', 'farmer').limit(10).get();
    const data = snap.docs
      .map((doc) => ({ _id: doc.id, ...doc.data() }))
      .filter((u) => u._id !== currentUserId)
      .map(({ passwordHash, ...safe }) => safe);
    return res.json({ success: true, data });
  }

  const data = users
    .filter((u) => u.role === 'farmer' && u._id !== currentUserId)
    .map(({ passwordHash, ...safe }) => safe);
  return res.json({ success: true, data });
});

module.exports = router;
