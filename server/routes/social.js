const express = require('express');
const { socialPosts, users, groups, connectionRequests, connections, generateId } = require('../data/sampleData');
const { authenticate } = require('../middleware/auth');
const { db, isFirestoreEnabled, admin } = require('../services/firestore');

const FIRESTORE_TIMEOUT = 5000;
const withTimeout = (p) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('Firestore timeout')), FIRESTORE_TIMEOUT))]);

const router = express.Router();

const getUserFromRequest = (req) => req.user || users[0];

router.get('/posts', async (req, res) => {
  const { sortBy, userId } = req.query;

  if (isFirestoreEnabled && db) {
    try {
      let query = db.collection('socialPosts').orderBy('createdAt', 'desc');
      if (userId) query = db.collection('socialPosts').where('user._id', '==', userId).orderBy('createdAt', 'desc');
      const snap = await withTimeout(query.get());
      let data = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
      if (sortBy === 'trending') {
        data = data.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      }
      return res.json({ success: true, data });
    } catch (err) {
      console.error('Firestore posts error:', err.message);
    }
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

  // Resolve avatar from multiple possible field paths — user.avatar (flat),
  // profile.profilePicture (set via PUT /auth/profile), profile.avatar, photoURL
  const resolvedAvatar =
    user.avatar ||
    user.profile?.profilePicture ||
    user.profile?.avatar ||
    user.photoURL ||
    '';

  const newPost = {
    user: {
      _id: user._id,
      name: user.name,
      role: user.role,
      avatar: resolvedAvatar,
    },
    content,
    type,
    category,
    visibility,
    likes: [],
    comments: [],
    createdAt: new Date(),
  };

  if (isFirestoreEnabled && db) {
    try {
      const docRef = db.collection('socialPosts').doc();
      await withTimeout(docRef.set(newPost));
      return res.status(201).json({ success: true, data: { _id: docRef.id, ...newPost } });
    } catch (err) {
      console.error('Firestore create-post error:', err.message);
    }
  }

  const inMemoryPost = { _id: generateId('post'), ...newPost };
  socialPosts.unshift(inMemoryPost);
  return res.status(201).json({ success: true, data: inMemoryPost });
});

router.post('/post/:id/like', authenticate, async (req, res) => {
  const userId = req.user._id;

  if (isFirestoreEnabled && db) {
    try {
      const docRef = db.collection('socialPosts').doc(req.params.id);
      const snap = await withTimeout(docRef.get());
      if (!snap.exists) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      const post = { _id: snap.id, ...snap.data() };
      const already = (post.likes || []).find((like) => like.user === userId);
      const updatedLikes = already
        ? post.likes.filter((like) => like.user !== userId)
        : [...(post.likes || []), { user: userId, date: new Date() }];
      await withTimeout(docRef.update({ likes: updatedLikes }));
      return res.json({ success: true, data: { ...post, likes: updatedLikes } });
    } catch (err) {
      console.error('Firestore like error:', err.message);
    }
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
    try {
      const docRef = db.collection('socialPosts').doc(req.params.id);
      const snap = await withTimeout(docRef.get());
      if (!snap.exists) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      const comment = {
        _id: generateId('comment'),
        user: {
          _id: req.user._id,
          name: req.user.name,
          avatar: req.user.avatar || req.user.profile?.profilePicture || req.user.profile?.avatar || '',
        },
        text,
        createdAt: new Date(),
      };
      const comments = [...(snap.data().comments || []), comment];
      await withTimeout(docRef.update({ comments }));
      return res.status(201).json({ success: true, data: comment });
    } catch (err) {
      console.error('Firestore comment error:', err.message);
    }
  }

  const post = socialPosts.find((p) => p._id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  const comment = {
    _id: generateId('comment'),
    user: {
      _id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar || req.user.profile?.profilePicture || req.user.profile?.avatar || '',
    },
    text,
    createdAt: new Date(),
  };
  post.comments = [...(post.comments || []), comment];
  return res.status(201).json({ success: true, data: comment });
});

// GET suggested groups
router.get('/groups', async (req, res) => {
  if (isFirestoreEnabled && db) {
    try {
      const snap = await withTimeout(db.collection('groups').orderBy('memberCount', 'desc').limit(10).get());
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
      await withTimeout(batch.commit());
      return res.json({ success: true, data: groups });
    } catch (err) {
      console.error('Firestore groups error:', err.message);
    }
  }
  return res.json({ success: true, data: groups });
});

// GET suggested users — returns all registered users except current user
// Supports farmers, buyers, experts seeing relevant connections
// Kept at /farmers path for backward-compatibility with existing frontend code
router.get('/farmers', authenticate, async (req, res) => {
  const currentUserId = req.user._id;
  const roleFilter = req.query.role; // optional ?role=farmer to filter

  if (isFirestoreEnabled && db) {
    try {
      let query = db.collection('users').limit(20);
      // Optional role filter — if not provided, return all roles
      if (roleFilter) {
        query = db.collection('users').where('role', '==', roleFilter).limit(20);
      }
      const snap = await withTimeout(query.get());
      const data = snap.docs
        .map((doc) => ({ _id: doc.id, ...doc.data() }))
        .filter((u) => u._id !== currentUserId)
        .map(({ passwordHash, ...safe }) => safe)
        .slice(0, 10);
      return res.json({ success: true, data });
    } catch (err) {
      console.error('Firestore suggested-users error:', err.message);
    }
  }

  // In-memory fallback — return all non-current users (or filter by role)
  const data = users
    .filter((u) => u._id !== currentUserId && (!roleFilter || u.role === roleFilter))
    .map(({ passwordHash, ...safe }) => safe)
    .slice(0, 10);
  return res.json({ success: true, data });
});

// ─── CONNECTION ROUTES ───────────────────────────────────────────────────────

// GET my pending incoming connection requests (notifications)
router.get('/notifications', authenticate, async (req, res) => {
  const myId = req.user._id;

  if (isFirestoreEnabled && db) {
    try {
      const snap = await withTimeout(
        db.collection('connectionRequests')
          .where('receiverId', '==', myId)
          .where('status', '==', 'pending')
          .get()  // no orderBy to avoid needing a composite index
      );
      const data = snap.docs
        .map((d) => ({ _id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      return res.json({ success: true, data });
    } catch (err) {
      console.error('Firestore notifications error:', err.message);
    }
  }

  const data = connectionRequests.filter(
    (r) => r.receiverId === myId && r.status === 'pending'
  );
  return res.json({ success: true, data });
});

// GET my accepted connections (enriched with other user's profile)
router.get('/connections', authenticate, async (req, res) => {
  const myId = req.user._id;

  if (isFirestoreEnabled && db) {
    try {
      const snap = await withTimeout(
        db.collection('connections').where('users', 'array-contains', myId).get()
      );
      const connDocs = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));

      // Enrich with other user's profile
      const enriched = await Promise.all(
        connDocs.map(async (conn) => {
          const otherId = conn.users.find((id) => id !== myId);
          if (!otherId) return { ...conn, otherUser: null };
          try {
            const userSnap = await withTimeout(db.collection('users').doc(otherId).get());
            if (userSnap.exists) {
              const { passwordHash, ...safe } = userSnap.data();
              return { ...conn, otherUser: { _id: otherId, ...safe } };
            }
          } catch (_) {}
          return { ...conn, otherUser: { _id: otherId, name: otherId } };
        })
      );
      return res.json({ success: true, data: enriched });
    } catch (err) {
      console.error('Firestore connections error:', err.message);
    }
  }

  // In-memory fallback: enrich with user lookup
  const data = connections
    .filter((c) => c.users.includes(myId))
    .map((conn) => {
      const otherId = conn.users.find((id) => id !== myId);
      const otherUser = users.find((u) => u._id === otherId);
      if (otherUser) {
        const { passwordHash, ...safe } = otherUser;
        return { ...conn, otherUser: safe };
      }
      return { ...conn, otherUser: { _id: otherId, name: otherId } };
    });
  return res.json({ success: true, data });
});

// GET connection status with a specific user: 'none' | 'sent' | 'received' | 'connected'
router.get('/connection-status/:userId', authenticate, async (req, res) => {
  const myId = req.user._id;
  const otherId = req.params.userId;

  if (isFirestoreEnabled && db) {
    try {
      // Check if already connected
      const connSnap = await withTimeout(
        db.collection('connections').where('users', 'array-contains', myId).get()
      );
      const isConnected = connSnap.docs.some((d) => d.data().users.includes(otherId));
      if (isConnected) return res.json({ success: true, status: 'connected' });

      // Check outgoing request
      const sentSnap = await withTimeout(
        db.collection('connectionRequests')
          .where('senderId', '==', myId)
          .where('receiverId', '==', otherId)
          .where('status', '==', 'pending')
          .limit(1)
          .get()
      );
      if (!sentSnap.empty) return res.json({ success: true, status: 'sent' });

      // Check incoming request
      const recvSnap = await withTimeout(
        db.collection('connectionRequests')
          .where('senderId', '==', otherId)
          .where('receiverId', '==', myId)
          .where('status', '==', 'pending')
          .limit(1)
          .get()
      );
      if (!recvSnap.empty) return res.json({ success: true, status: 'received' });

      return res.json({ success: true, status: 'none' });
    } catch (err) {
      console.error('Firestore connection-status error:', err.message);
    }
  }

  const isConnected = connections.some(
    (c) => c.users.includes(myId) && c.users.includes(otherId)
  );
  if (isConnected) return res.json({ success: true, status: 'connected' });

  const sent = connectionRequests.find(
    (r) => r.senderId === myId && r.receiverId === otherId && r.status === 'pending'
  );
  if (sent) return res.json({ success: true, status: 'sent' });

  const received = connectionRequests.find(
    (r) => r.senderId === otherId && r.receiverId === myId && r.status === 'pending'
  );
  if (received) return res.json({ success: true, status: 'received' });

  return res.json({ success: true, status: 'none' });
});

// POST send a connection request
router.post('/connect/:userId', authenticate, async (req, res) => {
  const myId = req.user._id;
  const otherId = req.params.userId;

  if (myId === otherId) {
    return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
  }

  if (isFirestoreEnabled && db) {
    try {
      // Already connected?
      const connSnap = await withTimeout(
        db.collection('connections').where('users', 'array-contains', myId).get()
      );
      if (connSnap.docs.some((d) => d.data().users.includes(otherId))) {
        return res.status(400).json({ success: false, message: 'Already connected' });
      }

      // Already requested?
      const existSnap = await withTimeout(
        db.collection('connectionRequests')
          .where('senderId', '==', myId)
          .where('receiverId', '==', otherId)
          .where('status', '==', 'pending')
          .limit(1)
          .get()
      );
      if (!existSnap.empty) {
        return res.status(400).json({ success: false, message: 'Request already sent' });
      }

      const request = {
        senderId: myId,
        senderName: req.user.name,
        senderAvatar: req.user.avatar || '',
        receiverId: otherId,
        status: 'pending',
        createdAt: new Date(),
      };
      const docRef = db.collection('connectionRequests').doc();
      await withTimeout(docRef.set(request));
      return res.json({ success: true, data: { _id: docRef.id, ...request } });
    } catch (err) {
      console.error('Firestore send-connect error:', err.message);
    }
  }

  // In-memory fallback
  if (connections.some((c) => c.users.includes(myId) && c.users.includes(otherId))) {
    return res.status(400).json({ success: false, message: 'Already connected' });
  }
  if (connectionRequests.find((r) => r.senderId === myId && r.receiverId === otherId && r.status === 'pending')) {
    return res.status(400).json({ success: false, message: 'Request already sent' });
  }

  const newRequest = {
    _id: generateId('req'),
    senderId: myId,
    senderName: req.user.name,
    senderAvatar: req.user.avatar || '',
    receiverId: otherId,
    status: 'pending',
    createdAt: new Date(),
  };
  connectionRequests.push(newRequest);
  return res.json({ success: true, data: newRequest });
});

// POST accept a connection request (senderId = the person who sent me the request)
router.post('/connect/:userId/accept', authenticate, async (req, res) => {
  const myId = req.user._id;
  const senderId = req.params.userId;

  if (isFirestoreEnabled && db) {
    try {
      const snap = await withTimeout(
        db.collection('connectionRequests')
          .where('senderId', '==', senderId)
          .where('receiverId', '==', myId)
          .where('status', '==', 'pending')
          .limit(1)
          .get()
      );
      if (snap.empty) {
        return res.status(404).json({ success: false, message: 'Connection request not found' });
      }
      const reqDoc = snap.docs[0];
      await withTimeout(reqDoc.ref.update({ status: 'accepted', acceptedAt: new Date() }));

      // Create connection
      const connRef = db.collection('connections').doc();
      const conn = { users: [myId, senderId], createdAt: new Date() };
      await withTimeout(connRef.set(conn));

      // Increment connectionCount on both users
      await withTimeout(db.collection('users').doc(myId).update({ connectionCount: admin.firestore.FieldValue.increment(1) }));
      await withTimeout(db.collection('users').doc(senderId).update({ connectionCount: admin.firestore.FieldValue.increment(1) }));

      return res.json({ success: true, data: { _id: connRef.id, ...conn } });
    } catch (err) {
      console.error('Firestore accept-connect error:', err.message);
    }
  }

  // In-memory fallback
  const reqIdx = connectionRequests.findIndex(
    (r) => r.senderId === senderId && r.receiverId === myId && r.status === 'pending'
  );
  if (reqIdx === -1) {
    return res.status(404).json({ success: false, message: 'Connection request not found' });
  }
  connectionRequests[reqIdx].status = 'accepted';
  connectionRequests[reqIdx].acceptedAt = new Date();

  const conn = { _id: generateId('conn'), users: [myId, senderId], createdAt: new Date() };
  connections.push(conn);

  // Increment connectionCount on both users in-memory
  [myId, senderId].forEach((uid) => {
    const u = users.find((u) => u._id === uid);
    if (u) u.connectionCount = (u.connectionCount || 0) + 1;
  });

  return res.json({ success: true, data: conn });
});

// POST decline a connection request
router.post('/connect/:userId/decline', authenticate, async (req, res) => {
  const myId = req.user._id;
  const senderId = req.params.userId;

  if (isFirestoreEnabled && db) {
    try {
      const snap = await withTimeout(
        db.collection('connectionRequests')
          .where('senderId', '==', senderId)
          .where('receiverId', '==', myId)
          .where('status', '==', 'pending')
          .limit(1)
          .get()
      );
      if (!snap.empty) {
        await withTimeout(snap.docs[0].ref.update({ status: 'declined' }));
      }
      return res.json({ success: true });
    } catch (err) {
      console.error('Firestore decline-connect error:', err.message);
    }
  }

  const reqIdx = connectionRequests.findIndex(
    (r) => r.senderId === senderId && r.receiverId === myId && r.status === 'pending'
  );
  if (reqIdx !== -1) connectionRequests[reqIdx].status = 'declined';
  return res.json({ success: true });
});

module.exports = router;
