/**
 * server/services/chatbotSync.js
 * Keeps the Sprout chatbot's knowledge in step with the database.
 *
 * This server owns the database, so it decides what is public: it builds a short
 * text "record" for every product, wholesale listing, course and government
 * scheme and pushes them to Sprout (which embeds them into Qdrant).
 *
 * ONLY public catalogue fields are read here. Never add users, contact details,
 * messages, loans, credit scores, tickets, farm finances, carts or applications.
 *
 * Configure with SPROUT_URL and SPROUT_ADMIN_KEY. Without them everything here
 * is a no-op, so the rest of the app is unaffected.
 */
const axios = require('axios');
const { prisma } = require('./prisma');

const KINDS = ['product', 'listing', 'course', 'scheme'];
const BATCH_SIZE = 200;
// Starter documents that the database sync now replaces; removed from Qdrant on the next file sync.
const RETIRED_SOURCES = [
  'prospera-courses.md',
  'marketplace-products.md',
  'government-schemes.md',
  'prospera-platform-services.md',
];

const sproutUrl = () => (process.env.SPROUT_URL || '').trim().replace(/\/+$/, '');
const adminKey = () => process.env.SPROUT_ADMIN_KEY || '';
const isConfigured = () => Boolean(sproutUrl() && adminKey());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Record builders (public fields only) ────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
const lkr = (n) => `LKR ${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
// The Marketplace page shows its prices in US dollars (client/src/pages/marketplace/EquipmentCatalog.js).
// Quote what customers see; change this if the Marketplace is switched to LKR.
const usd = (n) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const clean = (s, max = 1200) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, max);
const idFilter = (ids) => (ids ? { where: { id: { in: ids } } } : {});

const BUILDERS = {
  async product(ids) {
    const rows = await prisma.marketplaceProduct.findMany({ ...idFilter(ids), orderBy: { createdAt: 'desc' } });
    return rows.map((p) => ({
      id: p.id,
      title: clean(p.name, 300),
      url: '/marketplace',
      text: [
        `Marketplace product: ${clean(p.name, 300)}.`,
        `Category: ${clean(p.category, 100)}.`,
        `Price: ${usd(p.price)}${p.originalPrice ? ` (regular price ${usd(p.originalPrice)})` : ''}.`,
        `Availability: ${p.stock > 0 ? `in stock (${p.stock} available)` : 'out of stock'}.`,
        `Shipping: ${p.freeShipping ? 'free shipping' : 'shipping is charged'}.`,
        p.description ? `Description: ${clean(p.description)}` : '',
        'Where to find it: the Marketplace page (menu: Marketplace). Log in and use "Add to Cart" to buy.',
        `Information as of ${today()}.`,
      ].filter(Boolean).join('\n'),
    }));
  },

  // The seller's identity is never included: only whether the platform has verified them.
  async listing(ids) {
    const rows = await prisma.marketListing.findMany({ ...idFilter(ids), orderBy: { createdAt: 'desc' } });
    return rows.map((l) => ({
      id: l.id,
      title: clean(l.productName, 300),
      url: '/market',
      text: [
        `Wholesale market listing: ${clean(l.productName, 300)} (${l.type} listing).`,
        `Category: ${clean(l.productCategory, 100)}.`,
        `Price: ${lkr(l.pricePerUnit)} per ${clean(l.quantityUnit, 30)}.`,
        `Quantity available: ${Number(l.quantityAmount).toLocaleString('en-US')} ${clean(l.quantityUnit, 30)}.`,
        l.qualityGrade ? `Quality grade: ${clean(l.qualityGrade, 60)}.` : '',
        l.district ? `District: ${clean(l.district, 60)}.` : '',
        `Seller: ${l.sellerVerified ? 'verified by the platform' : 'not yet verified'}.`,
        l.productDescription ? `Description: ${clean(l.productDescription)}` : '',
        'Where to find it: the Wholesale Market page (menu: Wholesale Market). Sign in and click "Inquire" on the listing to message the seller.',
        `Information as of ${today()}.`,
      ].filter(Boolean).join('\n'),
    }));
  },

  async course(ids) {
    const rows = await prisma.course.findMany({
      ...idFilter(ids),
      include: { videos: { orderBy: { position: 'asc' } }, materials: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((c) => ({
      id: c.id,
      title: clean(c.title, 300),
      url: `/learning/course/${c.id}`,
      text: [
        `Course: ${clean(c.title, 300)}.`,
        `Category: ${clean(c.category, 100)}. Level: ${c.level}. Duration: ${c.duration} hours. Instructor: ${clean(c.instructorName, 100)}.`,
        c.ratingCount > 0 ? `Rating: ${Number(c.ratingAverage).toFixed(1)} out of 5 from ${c.ratingCount} ratings.` : '',
        `Students enrolled: ${c.enrolledStudents}.`,
        `Description: ${clean(c.description)}`,
        c.videos.length ? `Lessons (${c.videos.length}): ${c.videos.map((v) => clean(v.title, 120)).join('; ').slice(0, 700)}.` : '',
        c.materials.length ? `Downloadable materials (${c.materials.length}): ${c.materials.map((m) => clean(m.title, 120)).join('; ').slice(0, 500)}.` : '',
        'Where to find it: the Learning Hub page (menu: Learning Hub). Open the course and click "Enroll Now — Free".',
        `Information as of ${today()}.`,
      ].filter(Boolean).join('\n'),
    }));
  },

  async scheme(ids) {
    const rows = await prisma.scheme.findMany({ ...idFilter(ids), orderBy: { createdAt: 'desc' } });
    return rows.map((s) => ({
      id: s.id,
      title: clean(s.name, 300),
      url: '/government',
      text: [
        `Government scheme: ${clean(s.name, 300)} (${s.type}).`,
        `Category: ${clean(s.category, 100)}.`,
        s.benefitAmount != null ? `Benefit: up to ${lkr(s.benefitAmount)}.` : '',
        s.benefitDescription ? `Benefit details: ${clean(s.benefitDescription, 400)}` : '',
        s.eligibility?.length ? `Eligibility: ${s.eligibility.map((e) => clean(e, 200)).join('; ')}.` : '',
        `Description: ${clean(s.description)}`,
        'How to apply: open the Government Portal page (menu: Government Portal), find the scheme and click "Apply Now". Your applications are listed under "My Applications".',
        `Information as of ${today()}.`,
      ].filter(Boolean).join('\n'),
    }));
  },
};

// ── Talking to Sprout ───────────────────────────────────────────────────────
const explain = (err) => {
  const status = err.response?.status;
  const detail = err.response?.data?.detail;
  if (status === 401) {
    const e = new Error('Sprout rejected the admin key. Check SPROUT_ADMIN_KEY matches ADMIN_API_KEY on the Sprout service.');
    e.code = 'SPROUT_AUTH';
    return e;
  }
  if (status === 422) return new Error(`Sprout rejected the data: ${JSON.stringify(detail).slice(0, 200)}`);
  if (status) return new Error(`Sprout returned HTTP ${status}${typeof detail === 'string' ? `: ${detail}` : ''}`.slice(0, 300));
  if (['ECONNREFUSED', 'ENOTFOUND'].includes(err.code)) return new Error(`Cannot reach Sprout at ${sproutUrl()}`);
  if (err.code === 'ECONNABORTED') return new Error('Sprout took too long to respond (it may be waking up). Try again in a minute.');
  return new Error(err.message);
};

/** Authenticated call to Sprout; one retry in case the service was still waking up. */
const sprout = async (method, path, data, timeout = 60000) => {
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await axios({
        method, url: `${sproutUrl()}${path}`, data, timeout,
        headers: { 'X-Admin-Key': adminKey(), 'Content-Type': 'application/json' },
      });
      return res.data;
    } catch (err) {
      lastErr = err;
      const status = err.response?.status;
      if (attempt === 1 && (!status || [502, 503, 504].includes(status))) {
        await sleep(3000);
        continue;
      }
      break;
    }
  }
  throw explain(lastErr);
};

/** Wakes a sleeping Sprout (free hosting) and checks it can actually store knowledge. */
const wake = async () => {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { data } = await axios.get(`${sproutUrl()}/api/health`, { timeout: 90000 });
      if (!data.qdrant) throw new Error('Sprout is running but cannot reach Qdrant. Check QDRANT_URL and QDRANT_API_KEY on the Sprout service.');
      if (!data.openai_key_set) throw new Error('Sprout is running but OPENAI_API_KEY is not set.');
      return data;
    } catch (err) {
      if (err.message.startsWith('Sprout is running')) throw err;
      lastErr = err;
      await sleep(5000);
    }
  }
  throw explain(lastErr);
};

// ── Syncing ─────────────────────────────────────────────────────────────────
async function syncKind(kind) {
  const records = await BUILDERS[kind]();
  let upserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const r = await sprout('post', '/api/sync', { kind, records: records.slice(i, i + BATCH_SIZE) });
    upserted += r.upserted;
  }
  // Records deleted in the database must disappear from the chatbot too.
  const pruned = await sprout('post', '/api/sync/prune', { kind, keep_ids: records.map((r) => r.id) });
  return { found: records.length, upserted, removed: pruned.deleted };
}

async function syncFiles() {
  const r = await sprout('post', '/api/sync/knowledge-files', { prune: true, remove_sources: RETIRED_SOURCES }, 120000);
  return { found: r.ingested.length, upserted: r.ingested.length, removed: r.removed.length, skipped: r.skipped.length };
}

const state = { running: false, current: null, lastRun: null };

/** Runs a sync of the given kinds (any of KINDS and/or 'files'). Resolves with the run summary. */
async function runSync(kinds = [...KINDS, 'files']) {
  if (!isConfigured()) throw new Error('The chatbot sync is not configured (SPROUT_URL and SPROUT_ADMIN_KEY).');
  if (state.running) throw new Error('A sync is already running.');

  state.running = true;
  const run = { startedAt: new Date().toISOString(), finishedAt: null, ok: true, results: [] };
  try {
    await wake();
    for (const kind of kinds) {
      state.current = kind;
      try {
        run.results.push({ kind, ok: true, ...(kind === 'files' ? await syncFiles() : await syncKind(kind)) });
      } catch (err) {
        run.ok = false;
        run.results.push({ kind, ok: false, error: err.message });
        if (err.code === 'SPROUT_AUTH') break; // the same key is used for every call: no point repeating it
      }
    }
  } catch (err) {
    run.ok = false;
    run.results.push({ kind: 'connection', ok: false, error: err.message });
  } finally {
    run.finishedAt = new Date().toISOString();
    state.lastRun = run;
    state.running = false;
    state.current = null;
  }
  return run;
}

/** Starts a sync in the background and returns at once. */
function startSync(kinds) {
  if (state.running) return { started: false, reason: 'A sync is already running.' };
  runSync(kinds).catch((err) => console.error('Chatbot sync failed:', err.message));
  return { started: true };
}

async function databaseCounts() {
  const [product, listing, course, scheme] = await Promise.all([
    prisma.marketplaceProduct.count(), prisma.marketListing.count(), prisma.course.count(), prisma.scheme.count(),
  ]);
  return { product, listing, course, scheme };
}

async function getStatus() {
  const base = {
    databaseCounts: await databaseCounts(),
    configured: isConfigured(),
    running: state.running,
    current: state.current,
    lastRun: state.lastRun,
    autoSyncHours: autoSyncHours(),
  };
  if (!isConfigured()) {
    return { ...base, reachable: false, error: 'Not configured: set SPROUT_URL and SPROUT_ADMIN_KEY on this server.' };
  }
  let health;
  try {
    health = (await axios.get(`${sproutUrl()}/api/health`, { timeout: 8000 })).data;
  } catch (err) {
    return { ...base, reachable: false, error: 'Sprout did not answer. If it is on free hosting it may be asleep; starting a sync will wake it (about a minute).' };
  }
  try {
    const knowledge = await sprout('get', '/api/sync/status', undefined, 15000);
    return { ...base, reachable: true, health, knowledge };
  } catch (err) {
    return { ...base, reachable: true, health, error: err.message };
  }
}

// ── Keeping it fresh ────────────────────────────────────────────────────────
const pending = new Map();
let flushTimer = null;

/**
 * Call after an admin or expert creates, changes or deletes a record. Changes are
 * collected for a few seconds and sent together. Never throws and never blocks.
 */
function notify(kind, id, action = 'upsert') {
  if (!isConfigured() || !BUILDERS[kind] || !id) return;
  pending.set(`${kind}:${id}`, { kind, id, action });
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 3000);
  flushTimer.unref?.();
}

async function flush() {
  flushTimer = null;
  const batch = [...pending.values()];
  pending.clear();
  if (!batch.length) return;

  if (state.running) { // a full sync is in progress: try again shortly rather than overlap with it
    batch.forEach((b) => pending.set(`${b.kind}:${b.id}`, b));
    flushTimer = setTimeout(flush, 15000);
    flushTimer.unref?.();
    return;
  }

  try {
    for (const kind of KINDS) {
      const upsertIds = batch.filter((b) => b.kind === kind && b.action === 'upsert').map((b) => b.id);
      const deleteIds = batch.filter((b) => b.kind === kind && b.action === 'delete').map((b) => b.id);

      if (upsertIds.length) {
        const records = await BUILDERS[kind](upsertIds);
        if (records.length) await sprout('post', '/api/sync', { kind, records });
        const found = new Set(records.map((r) => r.id));
        upsertIds.filter((id) => !found.has(id)).forEach((id) => deleteIds.push(id)); // already gone from the database
      }
      for (const id of deleteIds) await sprout('delete', `/api/sync/${kind}/${encodeURIComponent(id)}`);
    }
  } catch (err) {
    // The next scheduled or manual full sync repairs anything missed here.
    console.warn('Chatbot incremental sync failed:', err.message);
  }
}

const autoSyncHours = () => {
  const h = Number(process.env.CHATBOT_SYNC_INTERVAL_HOURS ?? 6);
  return Number.isFinite(h) && h > 0 ? h : 0;
};

/** Periodic full sync (default every 6 hours; CHATBOT_SYNC_INTERVAL_HOURS=0 turns it off). */
function startAutoSync() {
  const hours = autoSyncHours();
  if (!isConfigured() || !hours) return null;
  const timer = setInterval(() => {
    runSync().catch((err) => console.warn('Scheduled chatbot sync skipped:', err.message));
  }, hours * 3600 * 1000);
  timer.unref?.();
  console.log(`Chatbot knowledge sync: every ${hours} h, plus on every change`);
  return timer;
}

module.exports = {
  KINDS, BUILDERS, isConfigured, runSync, startSync, getStatus, notify, flush, startAutoSync,
};
