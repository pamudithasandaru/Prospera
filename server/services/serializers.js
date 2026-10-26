/**
 * server/services/serializers.js
 *
 * The database is normalised; the public API shape is not. These helpers map
 * Prisma rows back to the JSON the React client already consumes — `_id`
 * instead of `id`, nested `profile` / `content` / `pricing` objects, and
 * likes/comments/views as embedded arrays.
 *
 * Keeping the translation in one place means the schema can keep evolving
 * without touching the client.
 */

/** Prisma returns Decimal instances; JSON.stringify would emit them as objects. */
const { youtubeId } = require('./courseHelpers');

const num = (v) => (v === null || v === undefined ? v : Number(v));

const iso = (d) => (d instanceof Date ? d : d ? new Date(d) : null);

/** Best available avatar for a user row. */
const avatarOf = (u) => u?.avatar || u?.profilePicture || '';

// ─── Users ───────────────────────────────────────────────────────────────────

/**
 * Full user for /auth/profile and friends. Never includes passwordHash.
 * Rebuilds the nested `profile` object the client reads from.
 */
function serializeUser(u) {
  if (!u) return null;
  return {
    _id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    language: u.language,
    avatar: u.avatar || '',
    connectionCount: u.connectionCount ?? 0,
    profile: {
      bio: u.bio || '',
      profilePicture: u.profilePicture || '',
      coverPhoto: u.coverPhoto || '',
      location: { district: u.district || '' },
    },
    createdAt: u.createdAt,
  };
}

/**
 * Profile of *someone else*, for the publicly reachable GET /auth/user/:id.
 *
 * Same shape as serializeUser minus `email`: that route needs no token, so
 * returning the address turned the whole user table into a scrapable mailing
 * list the moment the app stopped requiring a login to browse.
 */
function serializePublicUser(u) {
  if (!u) return null;
  const { email, ...rest } = serializeUser(u);
  return rest;
}

/** Compact author stub embedded in posts, comments and stories. */
function serializeUserStub(u) {
  if (!u) return null;
  return {
    _id: u.id,
    name: u.name,
    role: u.role,
    avatar: avatarOf(u),
  };
}

// ─── Social ──────────────────────────────────────────────────────────────────

function serializePost(p) {
  if (!p) return null;
  const reactions = (p.reactions || []).map((r) => ({
    user: r.userId,
    type: r.type,
    date: r.createdAt,
  }));
  return {
    _id: p.id,
    user: serializeUserStub(p.author),
    content: { text: p.text, images: p.images || [] },
    type: p.type,
    category: p.category,
    visibility: p.visibility,
    likes: [
      ...(p.likes || []).map((l) => ({ user: l.userId, date: l.createdAt })),
      ...reactions
        .filter((r) => !(p.likes || []).some((l) => l.userId === r.user))
        .map((r) => ({ user: r.user, date: r.date })),
    ],
    reactions,
    shares: p._count?.shares ?? (p.shares || []).length,
    comments: (p.comments || []).map(serializeComment),
    createdAt: p.createdAt,
  };
}

function serializeComment(c) {
  if (!c) return null;
  return {
    _id: c.id,
    user: {
      _id: c.authorId,
      name: c.author?.name || '',
      avatar: avatarOf(c.author),
    },
    text: c.text,
    parentId: c.parentId || null,
    replies: (c.replies || []).map(serializeComment),
    createdAt: c.createdAt,
  };
}

function serializeGroup(g) {
  if (!g) return null;
  return {
    _id: g.id,
    name: g.name,
    description: g.description,
    category: g.category,
    memberCount: g.memberCount,
    image: g.image || '',
    createdAt: g.createdAt,
  };
}

/**
 * Connections are stored as an ordered (userA, userB) pair. The client still
 * expects Firestore's `users` array, so rebuild it.
 */
function serializeConnection(c, viewerId) {
  if (!c) return null;
  const otherId = c.userAId === viewerId ? c.userBId : c.userAId;
  const otherRow = c.userAId === viewerId ? c.userB : c.userA;
  return {
    _id: c.id,
    users: [c.userAId, c.userBId],
    createdAt: c.createdAt,
    otherUser: otherRow ? serializeUser(otherRow) : { _id: otherId, name: otherId },
  };
}

function serializeConnectionRequest(r) {
  if (!r) return null;
  return {
    _id: r.id,
    senderId: r.senderId,
    senderName: r.sender?.name || '',
    senderAvatar: avatarOf(r.sender),
    receiverId: r.receiverId,
    status: r.status,
    createdAt: r.createdAt,
    acceptedAt: r.acceptedAt,
  };
}

// ─── Messaging ───────────────────────────────────────────────────────────────

function serializeConversation(c, viewerId) {
  if (!c) return null;
  const participantIds = (c.participants || []).map((p) => p.userId);
  const unreadCounts = {};
  (c.participants || []).forEach((p) => { unreadCounts[p.userId] = p.unreadCount; });

  const other = (c.participants || []).find((p) => p.userId !== viewerId);

  return {
    _id: c.id,
    participants: participantIds,
    createdAt: c.createdAt,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt,
    unreadCounts,
    otherUser: other?.user
      ? serializeUser(other.user)
      : { _id: other?.userId || null, name: 'User' },
  };
}

function serializeMessage(m) {
  if (!m) return null;
  return {
    _id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: m.sender?.name || '',
    senderAvatar: avatarOf(m.sender),
    text: m.text,
    mediaUrl: m.mediaUrl,
    mediaType: m.mediaType,
    fileName: m.fileName,
    fileSize: m.fileSize,
    readBy: (m.readBy || []).map((r) => r.userId),
    createdAt: m.createdAt,
  };
}

// ─── Stories ─────────────────────────────────────────────────────────────────

function serializeStory(s) {
  if (!s) return null;
  return {
    _id: s.id,
    author: {
      _id: s.authorId,
      name: s.author?.name || '',
      avatar: avatarOf(s.author),
    },
    mediaUrl: s.mediaUrl,
    mediaType: s.mediaType,
    text: s.text,
    backgroundColor: s.backgroundColor,
    views: (s.views || []).map((v) => ({ userId: v.userId, viewedAt: v.viewedAt })),
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
  };
}

// ─── Notifications ───────────────────────────────────────────────────────────

function serializeNotification(n) {
  if (!n) return null;
  return {
    _id: n.id,
    recipientId: n.recipientId,
    senderId: n.senderId,
    senderName: n.sender?.name || 'Someone',
    senderAvatar: avatarOf(n.sender),
    type: n.type,
    message: n.message,
    postId: n.postId,
    read: n.read,
    readAt: n.readAt,
    createdAt: n.createdAt,
  };
}

// ─── Farms ───────────────────────────────────────────────────────────────────

function serializeFarm(f) {
  if (!f) return null;
  return {
    _id: f.id,
    name: f.name,
    location: f.location,
    landSize: num(f.landSize),
    ownerId: f.ownerId,
    ownerName: f.owner?.name || '',
    currentCrops: (f.crops || []).map((c) => ({
      _id: c.id,
      cropName: c.cropName,
      variety: c.variety || '',
      area: num(c.area),
      plantedDate: c.plantedDate,
      status: c.status,
    })),
    expenses: (f.expenses || []).map((e) => ({
      _id: e.id,
      category: e.category,
      amount: num(e.amount),
      note: e.note || '',
      date: e.spentAt,
    })),
    revenue: (f.revenues || []).map((r) => ({
      _id: r.id,
      label: r.label,
      totalAmount: num(r.totalAmount),
      date: r.earnedAt,
    })),
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}

// ─── Learning ────────────────────────────────────────────────────────────────

function serializeCourse(c) {
  if (!c) return null;
  return {
    _id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    level: c.level,
    duration: c.duration,
    thumbnail: c.thumbnail || '',
    rating: { average: num(c.ratingAverage), count: c.ratingCount },
    instructor: { name: c.instructorName },
    enrolledStudents: c.enrolledStudents,
    videos: (c.videos || []).map((v) => ({
      _id: v.id, title: v.title, url: v.url, videoId: youtubeId(v.url), duration: v.duration,
    })),
    materials: (c.materials || []).map((m) => ({
      _id: m.id, title: m.title, url: m.url, type: m.type, format: m.type || '',
    })),
    createdBy: c.createdById,
    createdByName: c.createdBy?.name || c.instructorName,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

// ─── Market & marketplace ────────────────────────────────────────────────────

function serializeListing(l) {
  if (!l) return null;
  return {
    _id: l.id,
    type: l.type,
    product: {
      name: l.productName,
      category: l.productCategory,
      images: l.images || [],
      description: l.productDescription,
    },
    // `verified` is a flag on the listing itself, not on the account, so it
    // is merged onto the seller stub rather than read off the user row.
    seller: { _id: l.sellerId || null, name: '', avatar: '', ...(serializeUserStub(l.seller) || {}), verified: l.sellerVerified },
    pricing: { pricePerUnit: num(l.pricePerUnit) },
    quantity: { amount: num(l.quantityAmount), unit: l.quantityUnit },
    quality: { grade: l.qualityGrade || '' },
    location: { district: l.district || '' },
    createdAt: l.createdAt,
  };
}

function serializeProduct(p) {
  if (!p) return null;
  return {
    _id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    images: p.images || [],
    price: { amount: num(p.price), originalPrice: num(p.originalPrice) },
    stock: p.stock,
    shipping: { freeShipping: p.freeShipping },
  };
}

// ─── Government ──────────────────────────────────────────────────────────────

function serializeScheme(s) {
  if (!s) return null;
  return {
    _id: s.id,
    type: s.type,
    category: s.category,
    name: s.name,
    description: s.description,
    benefits: { amount: num(s.benefitAmount), description: s.benefitDescription || '' },
    eligibility: { criteria: s.eligibility || [] },
  };
}

function serializeApplication(a) {
  if (!a) return null;
  return {
    _id: a.id,
    scheme: a.scheme ? { _id: a.scheme.id, name: a.scheme.name } : { _id: a.schemeId },
    status: a.status,
    appliedAt: a.appliedAt,
  };
}

// ─── Fintech & support ───────────────────────────────────────────────────────

function serializeLoan(l) {
  if (!l) return null;
  return {
    _id: l.id,
    purpose: l.purpose,
    amount: num(l.amount),
    duration: l.duration,
    status: l.status,
    appliedAt: l.appliedAt,
  };
}

function serializeCreditScore(c) {
  if (!c) return null;
  return { score: c.score, rating: c.rating, lastUpdated: c.lastUpdated };
}

function serializeTicket(t) {
  if (!t) return null;
  return {
    _id: t.id,
    subject: t.subject,
    category: t.category,
    description: t.description,
    status: t.status,
    createdAt: t.createdAt,
  };
}

module.exports = {
  num,
  iso,
  avatarOf,
  serializeUser,
  serializePublicUser,
  serializeUserStub,
  serializePost,
  serializeComment,
  serializeGroup,
  serializeConnection,
  serializeConnectionRequest,
  serializeConversation,
  serializeMessage,
  serializeStory,
  serializeNotification,
  serializeFarm,
  serializeCourse,
  serializeListing,
  serializeProduct,
  serializeScheme,
  serializeApplication,
  serializeLoan,
  serializeCreditScore,
  serializeTicket,
};
