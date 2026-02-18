const jwt = require('jsonwebtoken');
const { users } = require('../data/sampleData');
const { db, isFirestoreEnabled } = require('../services/firestore');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isFirestoreEnabled && db) {
      const snap = await db.collection('users').doc(decoded.id).get();
      if (!snap.exists) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = { _id: snap.id, ...snap.data() };
    } else {
      const user = users.find((u) => u._id === decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { authenticate, JWT_SECRET };
