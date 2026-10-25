/**
 * server/services/courseHelpers.js
 * Validation + mapping for a course's videos and materials, shared by the
 * Learning Hub API (experts) and the Admin API.
 *
 *  - Videos are YouTube videos. Input may be a video id or any common YouTube
 *    link; it is stored as a canonical watch URL.
 *  - Materials are downloadable files: a title, an http(s) link and a format.
 *    Only http/https links are accepted, because they are rendered as links.
 */

const MAX_ITEMS = 100;
const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Extracts the 11-character YouTube id from an id or a youtube.com / youtu.be link; '' if none. */
const youtubeId = (input) => {
  const raw = String(input || '').trim();
  if (!raw) return '';
  if (YT_ID.test(raw)) return raw;

  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return '';
  }
  const host = url.hostname.replace(/^www\.|^m\./, '');
  let id = '';
  if (host === 'youtu.be') {
    id = url.pathname.split('/')[1] || '';
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
    else {
      const m = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      id = m ? m[1] : '';
    }
  }
  return YT_ID.test(id) ? id : '';
};

const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

const isHttpUrl = (s) => {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * Validates and maps the client's videos array to ordered rows.
 * Completely blank entries are skipped. Returns { rows } or { error }.
 */
const normalizeVideos = (videos) => {
  if (!Array.isArray(videos)) return { rows: [] };
  if (videos.length > MAX_ITEMS) return { error: `A course can have at most ${MAX_ITEMS} videos` };

  const rows = [];
  for (const v of videos) {
    const title = text(v?.title, 200);
    const source = text(v?.videoId, 500) || text(v?.url, 500);
    if (!title && !source) continue; // blank row

    const id = youtubeId(source);
    if (!id) {
      return { error: `Video "${title || `#${rows.length + 1}`}": enter a YouTube link or an 11-character video id` };
    }
    let duration = null;
    if (v.duration !== undefined && v.duration !== null && v.duration !== '') {
      duration = Number(v.duration);
      if (!Number.isInteger(duration) || duration < 0) return { error: `Video "${title}": duration must be a whole number of 0 or more` };
    }
    rows.push({ title: title || `Video ${rows.length + 1}`, url: watchUrl(id), duration, position: rows.length });
  }
  return { rows };
};

/** Same for materials. Returns { rows } or { error }. */
const normalizeMaterials = (materials) => {
  if (!Array.isArray(materials)) return { rows: [] };
  if (materials.length > MAX_ITEMS) return { error: `A course can have at most ${MAX_ITEMS} materials` };

  const rows = [];
  for (const m of materials) {
    const title = text(m?.title, 200);
    const url = text(m?.url, 1000);
    if (!title && !url) continue; // blank row

    if (!title) return { error: 'Every material needs a title' };
    if (!url || !isHttpUrl(url)) return { error: `Material "${title}": enter a download link starting with http:// or https://` };
    rows.push({ title, url, type: text(m.type, 20) || text(m.format, 20) || null, position: rows.length });
  }
  return { rows };
};

module.exports = { youtubeId, watchUrl, isHttpUrl, normalizeVideos, normalizeMaterials, MAX_ITEMS };
