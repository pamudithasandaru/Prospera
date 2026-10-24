const jwt = require('jsonwebtoken');
const { prisma } = require('../services/prisma');
const { getSuperAdminUser, isSuperAdminId } = require('../services/superAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

/** Message + code for a user whose status is not `active`; null when they may proceed. */
const blockedReason = (user) => {
  if (!user || !user.status || user.status === 'active') return null;
  const banned = user.status === 'banned';
  return {
    code: banned ? 'ACCOUNT_BANNED' : 'ACCOUNT_SUSPENDED',
    message: banned
      ? 'This account has been banned.'
      : 'This account has been suspended. Please contact support.',
  };
};

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
    const blocked = blockedReason(user);
    if (blocked) {
      return res.status(403).json({ success: false, ...blocked });
    }
    req.user = { ...user, _id: user.id };
    return next();
  } catch (err) {
    console.error('Auth lookup error:', err.message);
    return res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

/**
 * Gate a route to specific roles. Must run after `authenticate`.
 * The env-configured super admin carries role 'admin', so it passes too.
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
  }
  return next();
};

module.exports = { authenticate, requireRole, blockedReason, JWT_SECRET };
