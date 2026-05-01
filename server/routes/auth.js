const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, generateId } = require('../data/sampleData');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { db, isFirestoreEnabled } = require('../services/firestore');

const router = express.Router();

const FIRESTORE_TIMEOUT_MS = 5000;

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const sanitizeUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

/**
 * Wraps a Firestore promise with a hard timeout so a DNS/network failure
 * fails fast instead of hanging for ~60 s and crashing the process.
 */
const withTimeout = (promise, ms = FIRESTORE_TIMEOUT_MS) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Firestore timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'farmer', language = 'EN' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  if (isFirestoreEnabled && db) {
    try {
      const existing = await withTimeout(
        db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get()
      );
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
      await withTimeout(docRef.set(newUser));
      const token = signToken(docRef.id);
      return res.json({ success: true, data: { user: sanitizeUser({ _id: docRef.id, ...newUser }), token } });
    } catch (err) {
      console.error('Firestore register error — falling back to local data:', err.message);
    }
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
    try {
      const snap = await withTimeout(
        db.collection('users').where('email', '==', (email || '').toLowerCase()).limit(1).get()
      );
      if (!snap.empty) {
        const doc = snap.docs[0];
        const user = { _id: doc.id, ...doc.data() };
        const isMatch = await bcrypt.compare(password || '', user.passwordHash);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = signToken(user._id);
        return res.json({ success: true, data: { user: sanitizeUser(user), token } });
      }
      // Firestore returned empty — user not found in DB, fall through to sample data
    } catch (err) {
      console.error('Firestore login error — falling back to local data:', err.message);
    }
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
  const allowedFields = ['name', 'language', 'role', 'email'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  // Nested profile fields
  if (!req.user.profile) req.user.profile = {};
  const profileFields = ['bio', 'profilePicture', 'coverPhoto'];
  profileFields.forEach((f) => {
    if (req.body[f] !== undefined) req.user.profile[f] = req.body[f];
  });
  if (req.body.district !== undefined) {
    if (!req.user.profile.location) req.user.profile.location = {};
    req.user.profile.location.district = req.body.district;
  }

  if (isFirestoreEnabled && db) {
    try {
      await withTimeout(
        db.collection('users').doc(req.user._id).update({
          name: req.user.name,
          email: req.user.email,
          language: req.user.language,
          profile: req.user.profile,
        })
      );
    } catch (err) {
      console.error('Firestore profile update error:', err.message);
    }
  }

  return res.json({ success: true, data: sanitizeUser(req.user) });
});

router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const matches = await bcrypt.compare(currentPassword || '', req.user.passwordHash);
  if (!matches) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  req.user.passwordHash = await bcrypt.hash(newPassword, 10);

  if (isFirestoreEnabled && db) {
    try {
      await withTimeout(
        db.collection('users').doc(req.user._id).update({ passwordHash: req.user.passwordHash })
      );
    } catch (err) {
      console.error('Firestore password update error:', err.message);
    }
  }

  return res.json({ success: true, message: 'Password updated' });
});

router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  if (isFirestoreEnabled && db) {
    try {
      const doc = await withTimeout(db.collection('users').doc(id).get());
      if (doc.exists) {
        return res.json({ success: true, data: sanitizeUser({ _id: doc.id, ...doc.data() }) });
      }
    } catch (err) {
      console.error('Firestore get-user error:', err.message);
    }
  }
  const user = users.find((u) => u._id === id);
  if (user) {
    return res.json({ success: true, data: sanitizeUser(user) });
  }
  return res.status(404).json({ success: false, message: 'User not found' });
});

module.exports = router;
