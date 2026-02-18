const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, generateId } = require('../data/sampleData');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const sanitizeUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'farmer', language = 'EN' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  if (isFirestoreEnabled && db) {
    const existing = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
    if (!existing.empty) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const docRef = db.collection('users').doc();
    const newUser = {
      name,
      email: email.toLowerCase(),
      role,
      language,
      avatar: 'https://i.pravatar.cc/150?img=14',
      passwordHash,
      createdAt: new Date(),
    };
    await docRef.set(newUser);
    const token = signToken(docRef.id);
    return res.json({ success: true, data: { user: sanitizeUser({ _id: docRef.id, ...newUser }), token } });
  }

  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    _id: generateId('user'),
    name,
    email,
    role,
    language,
    avatar: 'https://i.pravatar.cc/150?img=14',
    passwordHash,
  };
  users.push(newUser);

  const token = signToken(newUser._id);
  return res.json({ success: true, data: { user: sanitizeUser(newUser), token } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (isFirestoreEnabled && db) {
    const snap = await db.collection('users').where('email', '==', (email || '').toLowerCase()).limit(1).get();
    if (snap.empty) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const doc = snap.docs[0];
    const user = { _id: doc.id, ...doc.data() };
    const isMatch = await bcrypt.compare(password || '', user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signToken(user._id);
    return res.json({ success: true, data: { user: sanitizeUser(user), token } });
  }

  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password || '', user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = signToken(user._id);
  return res.json({ success: true, data: { user: sanitizeUser(user), token } });
});

router.get('/profile', authenticate, (req, res) => {
  return res.json({ success: true, data: sanitizeUser(req.user) });
});

router.put('/profile', authenticate, async (req, res) => {
  const updates = ['name', 'language', 'role'];
  updates.forEach((field) => {
    if (req.body[field]) {
      req.user[field] = req.body[field];
    }
  });

  if (isFirestoreEnabled && db) {
    await db.collection('users').doc(req.user._id).update(req.user);
    return res.json({ success: true, user: sanitizeUser(req.user) });
  }

  return res.json({ success: true, user: sanitizeUser(req.user) });
});

router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const matches = await bcrypt.compare(currentPassword || '', req.user.passwordHash);
  if (!matches) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  req.user.passwordHash = await bcrypt.hash(newPassword, 10);

  if (isFirestoreEnabled && db) {
    await db.collection('users').doc(req.user._id).update({ passwordHash: req.user.passwordHash });
  }

  return res.json({ success: true, message: 'Password updated' });
});

module.exports = router;
