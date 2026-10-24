/**
 * server/routes/admin.js
 * Admin-only API: platform overview, user management, post moderation.
 * Every route requires a valid token AND role === 'admin'.
 */
const express = require('express');
const { Prisma } = require('@prisma/client');
const { prisma } = require('../services/prisma');
const { authenticate, requireRole } = require('../middleware/auth');
const { SUPER_ADMIN_ID } = require('../services/superAdmin');
const { pageParams, str } = require('../services/adminHelpers');

const router = express.Router();

const ROLES = ['farmer', 'buyer', 'consultant', 'expert', 'admin'];
const STATUSES = ['active', 'suspended', 'banned'];

router.use(authenticate, requireRole('admin'));

// The super admin has a users row only for referential integrity; it is never
// listed and can never be edited or deleted through the API.
const notSuperAdmin = { id: { not: SUPER_ADMIN_ID } };

// ── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    const [
      totalUsers, newUsers7d, roleGroups, posts, comments, courses,
      listings, products, openTickets, recentUsers, recentPosts,
      restrictedUsers, pendingLoans, pendingApplications,
    ] = await Promise.all([
      prisma.user.count({ where: notSuperAdmin }),
      prisma.user.count({ where: { ...notSuperAdmin, createdAt: { gte: weekAgo } } }),
      prisma.user.groupBy({ by: ['role'], where: notSuperAdmin, _count: { _all: true } }),
      prisma.socialPost.count(),
      prisma.comment.count(),
      prisma.course.count(),
      prisma.marketListing.count(),
      prisma.marketplaceProduct.count(),
      prisma.ticket.count({ where: { status: { in: ['open', 'pending'] } } }),
      prisma.user.findMany({
        where: notSuperAdmin,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.socialPost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, text: true, createdAt: true, author: { select: { name: true } } },
      }),
      prisma.user.count({ where: { ...notSuperAdmin, status: { not: 'active' } } }),
      prisma.loan.count({ where: { status: 'pending' } }),
      prisma.schemeApplication.count({ where: { status: 'pending' } }),
    ]);

    const usersByRole = Object.fromEntries(ROLES.map((r) => [r, 0]));
    roleGroups.forEach((g) => { usersByRole[g.role] = g._count._all; });

    return res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers, newUsers7d, posts, comments, courses, listings, products, openTickets,
          restrictedUsers, pendingLoans, pendingApplications,
        },
        usersByRole,
        recentUsers: recentUsers.map((u) => ({ _id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })),
        recentPosts: recentPosts.map((p) => ({
          _id: p.id,
          text: (p.text || '').slice(0, 120),
          authorName: p.author?.name || 'Unknown',
          createdAt: p.createdAt,
        })),
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load stats' });
  }
});

// ── GET /api/admin/users?search=&role=&page=&limit= ──────────────────────────
router.get('/users', async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const search = String(req.query.search || '').trim();
  const role = String(req.query.role || '');
  const status = String(req.query.status || '');

  const where = {
    ...notSuperAdmin,
    ...(ROLES.includes(role) ? { role } : {}),
    ...(STATUSES.includes(status) ? { status } : {}),
    ...(search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {}),
  };

  try {
    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, name: true, email: true, role: true, language: true,
          avatar: true, profilePicture: true, district: true, createdAt: true,
          status: true, statusReason: true,
          _count: { select: { posts: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: rows.map((u) => ({
        _id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        language: u.language,
        avatar: u.avatar || u.profilePicture || '',
        district: u.district || '',
        status: u.status,
        statusReason: u.statusReason || '',
        postsCount: u._count.posts,
        createdAt: u.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (err) {
    console.error('Admin list users error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load users' });
  }
});

// ── PATCH /api/admin/users/:id/role ──────────────────────────────────────────
router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!ROLES.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  if (req.params.id === SUPER_ADMIN_ID) {
    return res.status(400).json({ success: false, message: 'The super admin cannot be modified' });
  }
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot change your own role' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.json({ success: true, data: { _id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.error('Admin change role error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

// ── PATCH /api/admin/users/:id/status ────────────────────────────────────────
// Suspend, ban or reactivate. Takes effect immediately: authenticate() re-reads
// the status on every request, and sockets refuse to connect.
router.patch('/users/:id/status', async (req, res) => {
  const { status } = req.body;
  const reason = str(req.body.reason, 500);

  if (!STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  if (req.params.id === SUPER_ADMIN_ID) {
    return res.status(400).json({ success: false, message: 'The super admin cannot be modified' });
  }
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot change your own status' });
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id }, select: { role: true } });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.role === 'admin' && status !== 'active') {
      return res.status(400).json({ success: false, message: 'Change this admin to another role before suspending or banning them' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        status,
        statusReason: status === 'active' ? null : reason || null,
        statusUpdatedAt: new Date(),
      },
      select: { id: true, name: true, status: true, statusReason: true },
    });
    return res.json({
      success: true,
      data: { _id: user.id, name: user.name, status: user.status, statusReason: user.statusReason || '' },
    });
  } catch (err) {
    console.error('Admin change status error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// ── DELETE /api/admin/users/:id ──────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  if (req.params.id === SUPER_ADMIN_ID) {
    return res.status(400).json({ success: false, message: 'The super admin cannot be deleted' });
  }
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
  }

  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'User not found' });
      if (err.code === 'P2003') {
        return res.status(409).json({ success: false, message: 'User still has records that block deletion' });
      }
    }
    console.error('Admin delete user error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// ── GET /api/admin/posts?search=&page=&limit= ────────────────────────────────
router.get('/posts', async (req, res) => {
  const { page, limit, skip } = pageParams(req);
  const search = String(req.query.search || '').trim();
  const where = search
    ? {
        OR: [
          { text: { contains: search, mode: 'insensitive' } },
          { author: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }
    : {};

  try {
    const [total, rows] = await Promise.all([
      prisma.socialPost.count({ where }),
      prisma.socialPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, role: true, avatar: true, profilePicture: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: rows.map((p) => ({
        _id: p.id,
        text: p.text,
        images: p.images || [],
        type: p.type,
        category: p.category,
        author: {
          _id: p.author.id,
          name: p.author.name,
          role: p.author.role,
          avatar: p.author.avatar || p.author.profilePicture || '',
        },
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        createdAt: p.createdAt,
      })),
      pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (err) {
    console.error('Admin list posts error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to load posts' });
  }
});

// ── DELETE /api/admin/posts/:id ──────────────────────────────────────────────
router.delete('/posts/:id', async (req, res) => {
  try {
    await prisma.socialPost.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Post removed' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    console.error('Admin delete post error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to remove post' });
  }
});

// Courses, listings, products, schemes, tickets and loans
router.use(require('./adminContent'));

module.exports = router;
