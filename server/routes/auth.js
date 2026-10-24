const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
const { prisma } = require('../services/prisma');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { serializeUser } = require('../services/serializers');
const {
  getSuperAdminUser,
  isSuperAdminCredentials,
  isSuperAdminId,
} = require('../services/superAdmin');

const router = express.Router();

const VALID_ROLES = ['farmer', 'buyer', 'consultant', 'expert', 'admin'];
const VALID_LANGUAGES = ['EN', 'SI', 'TA'];

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'farmer', language = 'EN' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  if (!VALID_LANGUAGES.includes(language)) {
    return res.status(400).json({ success: false, message: 'Invalid language' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        language,
        avatar: 'https://i.pravatar.cc/150?img=14',
      },
    });

    return res.status(201).json({
      success: true,
      data: { user: serializeUser(user), token: signToken(user.id) },
    });
  } catch (err) {
    // P2002 = unique constraint violation (email already registered)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    console.error('Register error:', err.message);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Config-based super admin; checked first, anything else falls through to DB.
  if (isSuperAdminCredentials(email, password)) {
    const admin = getSuperAdminUser();
    return res.json({ success: true, data: { user: admin, token: signToken(admin.id) } });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: (email || '').toLowerCase() },
    });

    // Compare against a dummy hash when the user is missing so the response
    // time does not reveal whether the address is registered.
    const hash = user?.passwordHash || '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const isMatch = await bcrypt.compare(password || '', hash);

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      data: { user: serializeUser(user), token: signToken(user.id) },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ── GET /api/auth/profile ────────────────────────────────────────────────────
router.get('/profile', authenticate, (req, res) => {
  if (isSuperAdminId(req.user._id)) {
    return res.json({ success: true, data: getSuperAdminUser() });
  }
  return res.json({ success: true, data: serializeUser(req.user) });
});

// ── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put('/profile', authenticate, async (req, res) => {
  if (isSuperAdminId(req.user._id)) {
    return res.status(400).json({ success: false, message: 'Super admin profile is managed in server config' });
  }

  const { name, language, email, bio, profilePicture, coverPhoto, district } = req.body;
  const data = {};

  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = String(email).toLowerCase();
  if (language !== undefined) {
    if (!VALID_LANGUAGES.includes(language)) {
      return res.status(400).json({ success: false, message: 'Invalid language' });
    }
    data.language = language;
  }
  if (bio !== undefined) data.bio = bio;
  if (profilePicture !== undefined) data.profilePicture = profilePicture;
  if (coverPhoto !== undefined) data.coverPhoto = coverPhoto;
  if (district !== undefined) data.district = district;

  // `role` is deliberately not updatable here — privilege changes should not
  // ride along with a profile edit.

  try {
    const updated = await prisma.user.update({ where: { id: req.user.id }, data });
    return res.json({ success: true, data: serializeUser(updated) });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'That email is already in use' });
    }
    console.error('Profile update error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// ── PUT /api/auth/password ───────────────────────────────────────────────────
router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (isSuperAdminId(req.user._id)) {
    return res.status(400).json({ success: false, message: 'Super admin password is managed in server config' });
  }
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  try {
    const matches = await bcrypt.compare(currentPassword || '', req.user.passwordHash);
    if (!matches) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    return res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('Password update error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update password' });
  }
});

// ── GET /api/auth/stats ──────────────────────────────────────────────────────
// Dashboard counters, computed from the user's own rows.
router.get('/stats', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const [landAgg, activeCrops, coursesCompleted, postsCount] = await Promise.all([
      prisma.farm.aggregate({ where: { ownerId: userId }, _sum: { landSize: true } }),
      prisma.farmCrop.count({ where: { farm: { ownerId: userId }, status: 'growing' } }),
      prisma.courseEnrolment.count({ where: { userId, progress: { gte: 100 } } }),
      prisma.socialPost.count({ where: { authorId: userId } }),
    ]);

    return res.json({
      success: true,
      data: {
        acresFarming: Number(landAgg._sum.landSize ?? 0),
        activeCrops,
        coursesCompleted,
        postsCount,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// ── GET /api/auth/user/:id ───────────────────────────────────────────────────
router.get('/user/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: serializeUser(user) });
  } catch (err) {
    console.error('Get user error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

module.exports = router;
