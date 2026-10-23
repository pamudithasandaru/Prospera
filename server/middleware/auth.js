const jwt = require('jsonwebtoken');
const { prisma } = require('../services/prisma');
const { getSuperAdminUser, isSuperAdminId } = require('../services/superAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

/**
 * Verifies the bearer token and loads the user row onto req.user.
 *
 * req.user carries the raw Prisma row (including passwordHash, which
 * PUT /auth/password needs) — routes must serialize before responding.
 * `_id` is mirrored onto the row so the existing `req.user._id` call sites
 * keep working alongside Prisma's `id`.
 */
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Super admin lives in env config, never in the users table.
  if (isSuperAdminId(decoded.id)) {
    req.user = getSuperAdminUser();
    return next();
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = { ...user, _id: user.id };
    return next();
  } catch (err) {
    console.error('Auth lookup error:', err.message);
    return res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = { authenticate, JWT_SECRET };
