/**
 * server/routes/adminChatbot.js
 * Admin controls for the Sprout chatbot's knowledge. Mounted at /api/admin/chatbot,
 * so authenticate + admin role are already enforced by routes/admin.js.
 */
const express = require('express');
const chatbotSync = require('../services/chatbotSync');

const router = express.Router();
const SYNCABLE = [...chatbotSync.KINDS, 'files'];

// ── GET /api/admin/chatbot/status ───────────────────────────────────────────
router.get('/status', async (req, res) => {
  try {
    return res.json({ success: true, data: await chatbotSync.getStatus() });
  } catch (err) {
    console.error('Chatbot status error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to read the chatbot status' });
  }
});

// ── POST /api/admin/chatbot/sync  { kinds?: ['product','listing','course','scheme','files'] } ──
// Starts a background sync and answers straight away; poll /status for progress.
router.post('/sync', (req, res) => {
  if (!chatbotSync.isConfigured()) {
    return res.status(400).json({ success: false, message: 'Not configured: set SPROUT_URL and SPROUT_ADMIN_KEY on this server.' });
  }

  let kinds = req.body?.kinds;
  if (kinds !== undefined) {
    if (!Array.isArray(kinds) || kinds.length === 0 || kinds.some((k) => !SYNCABLE.includes(k))) {
      return res.status(400).json({ success: false, message: `kinds must be a non-empty list of: ${SYNCABLE.join(', ')}` });
    }
    kinds = [...new Set(kinds)];
  }

  const result = chatbotSync.startSync(kinds);
  if (!result.started) return res.status(409).json({ success: false, message: result.reason });
  return res.status(202).json({ success: true, message: 'Sync started' });
});

module.exports = router;
