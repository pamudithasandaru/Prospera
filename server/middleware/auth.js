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
  return resolveUser(req, res, next, { required: true });
};

/**
 * Loads req.user when a valid token is present, and lets the request through
 * when it is not.
 *
 * This is what makes the public pages work. Routes such as GET /social/posts
 * are open to signed-out visitors but still need to know *who* is asking —
 * to decide which posts are visible, or whether the caller already liked one.
 * Without this they would have to choose between 401-ing guests and treating
 * every caller as anonymous.
 *
 * A blocked account is still rejected rather than quietly downgraded to a
 * guest: the 403 is what tells the client to drop the dead session.
 */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  return resolveUser(req, res, next, { required: false });
};

/**
 * Shared body of authenticate/optionalAuth.
 *
 * `required` decides what a bad token means: a hard 401 for a protected
 * route, or an anonymous request for a public one — a stale token in
 * localStorage must not lock a visitor out of pages that need no account.
 */
const resolveUser = async (req, res, next, { required }) => {
  const anonymous = () => {
    req.user = null;
    return next();
  };

  const token = req.headers.authorization.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    if (!required) return anonymous();
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
      if (!required) return anonymous();
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
 *
 * Admins pass every list. The client has always let admins open any page
 * (see canAccess in client/src/config/access.js), while this check did not —
 * so an admin could reach a screen whose API then refused them. The two now
 * agree. The env-configured super admin carries role 'admin', so it passes
 * for the same reason.
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  if (req.user.role !== 'admin' && !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
  }
  return next();
};

module.exports = { authenticate, optionalAuth, requireRole, blockedReason, JWT_SECRET };
