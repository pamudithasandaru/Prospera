export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
const CHAT_KEY = import.meta.env.VITE_CHAT_API_KEY || '';

/**
 * Streams a chat answer. Calls onEvent with {type: 'sources'|'token'|'done'|'error', ...}.
 */
export async function streamChat({ message, history, category, signal, onEvent }) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(CHAT_KEY && { 'X-API-Key': CHAT_KEY }) },
    body: JSON.stringify({ message, history, category: category || null }),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(res.status === 401 ? 'Not authorised to use the assistant.' : `Server error (${res.status})`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop();
    for (const part of parts) {
      const line = part.trim();
      if (line.startsWith('data:')) onEvent(JSON.parse(line.slice(5).trim()));
    }
  }
}

async function adminFetch(path, adminKey, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'X-Admin-Key': adminKey, ...(options.headers || {}) },
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      detail = (await res.json()).detail || detail;
    } catch {
      /* keep default */
    }
    throw new Error(detail);
  }
  return res.json();
}

export const listDocuments = (key) => adminFetch('/api/documents', key);
export const deleteDocument = (key, id) => adminFetch(`/api/documents/${id}`, key, { method: 'DELETE' });
export const uploadDocument = (key, file, category) => {
  const form = new FormData();
  form.append('file', file);
  form.append('category', category);
  return adminFetch('/api/documents', key, { method: 'POST', body: form });
};

export async function getHealth() {
  const res = await fetch(`${API_URL}/api/health`);
  if (!res.ok) throw new Error('unavailable');
  return res.json();
}
