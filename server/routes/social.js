const express = require('express');
const { prisma } = require('../services/prisma');
const { authenticate } = require('../middleware/auth');
const { SUPER_ADMIN_ID } = require('../services/superAdmin');
const {
  serializePost,
  serializeComment,
  serializeGroup,
  serializeUser,
  serializeConnection,
  serializeConnectionRequest,
} = require('../services/serializers');

const router = express.Router();

const VALID_POST_TYPES = ['post', 'question', 'alert', 'article'];
const VALID_VISIBILITY = ['public', 'connections', 'private'];
const VALID_ROLES = ['farmer', 'buyer', 'consultant', 'expert', 'admin'];

/**
 * Connections are symmetric but stored once, with the smaller id in user_a_id.
 * Ordering the pair here keeps the unique constraint meaningful.
 */
const orderPair = (a, b) => (a < b ? [a, b] : [b, a]);

/** Everything needed to rebuild the legacy post shape in one round trip. */
const POST_INCLUDE = {
  author: true,
  likes: true,
  comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
};

// ── GET /api/social/posts ────────────────────────────────────────────────────
router.get('/posts', async (req, res) => {
  const { userId } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

  try {
    const posts = await prisma.socialPost.findMany({
      where: userId ? { authorId: userId } : undefined,
      include: POST_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return res.json({ success: true, data: posts.map(serializePost) });
  } catch (err) {
    console.error('Fetch posts error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// ── POST /api/social/post ────────────────────────────────────────────────────
router.post('/post', authenticate, async (req, res) => {
  const { content = {}, type = 'post', category = 'general', visibility = 'public' } = req.body;
  const text = (content.text || '').trim();
  const images = Array.isArray(content.images) ? content.images : [];

  if (!text && images.length === 0) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }
  if (!VALID_POST_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid post type' });
  }
  if (!VALID_VISIBILITY.includes(visibility)) {
    return res.status(400).json({ success: false, message: 'Invalid visibility' });
  }

  try {
    const post = await prisma.socialPost.create({
      data: { authorId: req.user.id, text, images, type, category, visibility },
      include: POST_INCLUDE,
    });
    return res.status(201).json({ success: true, data: serializePost(post) });
  } catch (err) {
    console.error('Create post error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// ── POST /api/social/post/:id/like — toggles ─────────────────────────────────
router.post('/post/:id/like', authenticate, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
    } else {
      await prisma.postLike.create({ data: { postId, userId } });
    }

    const post = await prisma.socialPost.findUnique({ where: { id: postId }, include: POST_INCLUDE });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    return res.json({ success: true, data: serializePost(post) });
  } catch (err) {
    // P2003 = FK violation, i.e. the post does not exist
    if (err.code === 'P2003' || err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    console.error('Like error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to like post' });
  }
});

// ── POST /api/social/post/:id/comment ────────────────────────────────────────
router.post('/post/:id/comment', authenticate, async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
  }

  try {
    const comment = await prisma.comment.create({
      data: { postId: req.params.id, authorId: req.user.id, text },
      include: { author: true },
    });
    return res.status(201).json({ success: true, data: serializeComment(comment) });
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    console.error('Comment error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// ── DELETE /api/social/post/:id — author only ────────────────────────────────
router.delete('/post/:id', authenticate, async (req, res) => {
  try {
    const post = await prisma.socialPost.findUnique({
      where: { id: req.params.id },
      select: { authorId: true },
    });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.authorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own posts' });
    }

    // Likes and comments cascade via the schema.
    await prisma.socialPost.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

// ── GET /api/social/groups ───────────────────────────────────────────────────
router.get('/groups', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { memberCount: 'desc' },
      take: 10,
    });
    return res.json({ success: true, data: groups.map(serializeGroup) });
  } catch (err) {
    console.error('Fetch groups error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch groups' });
  }
});

// ── GET /api/social/farmers — suggested users (any role) ─────────────────────
// Path kept for backward compatibility with the existing frontend.
router.get('/farmers', authenticate, async (req, res) => {
  const roleFilter = req.query.role;

  // `role` is an enum column — an unknown value would make Prisma throw.
  if (roleFilter && !VALID_ROLES.includes(roleFilter)) {
    return res.status(400).json({ success: false, message: 'Invalid role filter' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        // The super admin row exists only for referential integrity — it is
        // not a real member and must stay out of discovery.
        id: { notIn: [req.user.id, SUPER_ADMIN_ID] },
        ...(roleFilter ? { role: roleFilter } : {}),
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: users.map(serializeUser) });
  } catch (err) {
    console.error('Fetch farmers error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// ── GET /api/social/suggestions — people you may know ────────────────────────
// Ranked by mutual-connection count. One query replaces what used to be a
// per-candidate fan-out of reads.
router.get('/suggestions', authenticate, async (req, res) => {
  const myId = req.user.id;

  try {
    const rows = await prisma.$queryRaw`
      WITH edges AS (
        SELECT user_a_id AS person, user_b_id AS friend FROM connections
        UNION ALL
        SELECT user_b_id AS person, user_a_id AS friend FROM connections
      ),
      my_friends AS (
        SELECT friend FROM edges WHERE person = ${myId}
      ),
      excluded AS (
        -- CAST so Postgres can type the bare parameter in this UNION branch.
        SELECT CAST(${myId} AS text) AS id
        -- The super admin row is infrastructure, not a member to suggest.
        UNION SELECT CAST(${SUPER_ADMIN_ID} AS text)
        UNION SELECT friend FROM my_friends
        UNION SELECT receiver_id FROM connection_requests
          WHERE sender_id = ${myId} AND status = 'pending'
        UNION SELECT sender_id FROM connection_requests
          WHERE receiver_id = ${myId} AND status = 'pending'
      )
      SELECT u.id, u.name, u.email, u.role, u.language, u.avatar,
             u.bio, u.profile_picture, u.cover_photo, u.district,
             u.connection_count, u.created_at,
             COUNT(e.friend) FILTER (
               WHERE e.friend IN (SELECT friend FROM my_friends)
             )::int AS mutual_count
      FROM users u
      LEFT JOIN edges e ON e.person = u.id
      WHERE u.id NOT IN (SELECT id FROM excluded)
      GROUP BY u.id
      ORDER BY mutual_count DESC, u.created_at DESC
      LIMIT 5
    `;

    // Raw rows come back snake_cased — map to the serializer's expected shape.
    const data = rows.map((r) => ({
      ...serializeUser({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        language: r.language,
        avatar: r.avatar,
        bio: r.bio,
        profilePicture: r.profile_picture,
        coverPhoto: r.cover_photo,
        district: r.district,
        connectionCount: r.connection_count,
        createdAt: r.created_at,
      }),
      mutualCount: r.mutual_count,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Suggestions error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch suggestions' });
  }
});

// ── GET /api/social/notifications — pending incoming connection requests ─────
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const requests = await prisma.connectionRequest.findMany({
      where: { receiverId: req.user.id, status: 'pending' },
      include: { sender: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: requests.map(serializeConnectionRequest) });
  } catch (err) {
    console.error('Connection notifications error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// ── GET /api/social/connections ──────────────────────────────────────────────
router.get('/connections', authenticate, async (req, res) => {
  const myId = req.user.id;

  try {
    const conns = await prisma.connection.findMany({
      where: { OR: [{ userAId: myId }, { userBId: myId }] },
      include: { userA: true, userB: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: conns.map((c) => serializeConnection(c, myId)) });
  } catch (err) {
    console.error('Fetch connections error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch connections' });
  }
});

// ── GET /api/social/connection-status/:userId ────────────────────────────────
router.get('/connection-status/:userId', authenticate, async (req, res) => {
  const myId = req.user.id;
  const otherId = req.params.userId;

  if (myId === otherId) return res.json({ success: true, status: 'none' });

  try {
    const [a, b] = orderPair(myId, otherId);
    const connection = await prisma.connection.findUnique({
      where: { userAId_userBId: { userAId: a, userBId: b } },
    });
    if (connection) return res.json({ success: true, status: 'connected' });

    const pending = await prisma.connectionRequest.findFirst({
      where: {
        status: 'pending',
        OR: [
          { senderId: myId, receiverId: otherId },
          { senderId: otherId, receiverId: myId },
        ],
      },
    });
    if (!pending) return res.json({ success: true, status: 'none' });

    return res.json({ success: true, status: pending.senderId === myId ? 'sent' : 'received' });
  } catch (err) {
    console.error('Connection status error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to check status' });
  }
});

// ── POST /api/social/connect/:userId — send a request ────────────────────────
router.post('/connect/:userId', authenticate, async (req, res) => {
  const myId = req.user.id;
  const otherId = req.params.userId;

  if (myId === otherId) {
    return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: otherId }, select: { id: true } });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const [a, b] = orderPair(myId, otherId);
    const existing = await prisma.connection.findUnique({
      where: { userAId_userBId: { userAId: a, userBId: b } },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already connected' });
    }

    const pending = await prisma.connectionRequest.findFirst({
      where: {
        status: 'pending',
        OR: [
          { senderId: myId, receiverId: otherId },
          { senderId: otherId, receiverId: myId },
        ],
      },
    });
    if (pending) {
      return res.status(400).json({
        success: false,
        message: pending.senderId === myId ? 'Request already sent' : 'This user has already sent you a request',
      });
    }

    // A previously declined request is reused rather than duplicated — the
    // (sender, receiver) pair is unique.
    const request = await prisma.connectionRequest.upsert({
      where: { senderId_receiverId: { senderId: myId, receiverId: otherId } },
      update: { status: 'pending', createdAt: new Date(), acceptedAt: null },
      create: { senderId: myId, receiverId: otherId, status: 'pending' },
      include: { sender: true },
    });

    return res.json({ success: true, data: serializeConnectionRequest(request) });
  } catch (err) {
    console.error('Send connection request error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send request' });
  }
});

// ── POST /api/social/connect/:userId/accept ──────────────────────────────────
// :userId is the person who sent the request.
router.post('/connect/:userId/accept', authenticate, async (req, res) => {
  const myId = req.user.id;
  const senderId = req.params.userId;

  try {
    const request = await prisma.connectionRequest.findFirst({
      where: { senderId, receiverId: myId, status: 'pending' },
    });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    const [a, b] = orderPair(myId, senderId);

    // Accepting the request, creating the edge and bumping both counters must
    // succeed or fail together — otherwise connectionCount drifts.
    const connection = await prisma.$transaction(async (tx) => {
      await tx.connectionRequest.update({
        where: { id: request.id },
        data: { status: 'accepted', acceptedAt: new Date() },
      });

      const conn = await tx.connection.create({ data: { userAId: a, userBId: b } });

      await tx.user.update({ where: { id: myId }, data: { connectionCount: { increment: 1 } } });
      await tx.user.update({ where: { id: senderId }, data: { connectionCount: { increment: 1 } } });

      return conn;
    });

    return res.json({
      success: true,
      data: { _id: connection.id, users: [connection.userAId, connection.userBId], createdAt: connection.createdAt },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Already connected' });
    }
    console.error('Accept connection error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to accept request' });
  }
});

// ── POST /api/social/connect/:userId/decline ─────────────────────────────────
router.post('/connect/:userId/decline', authenticate, async (req, res) => {
  try {
    await prisma.connectionRequest.updateMany({
      where: { senderId: req.params.userId, receiverId: req.user.id, status: 'pending' },
      data: { status: 'declined' },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error('Decline connection error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to decline request' });
  }
});

module.exports = router;
