const SPROUT_URL = process.env.REACT_APP_SPROUT_URL || 'http://localhost:8001';
const SPROUT_KEY = process.env.REACT_APP_SPROUT_API_KEY || '';

/**
 * Streams a Sprout answer over SSE. Calls onEvent with
 * {type: 'sources'|'token'|'done'|'error', ...}.
 */
export async function streamSproutChat({ message, history, signal, onEvent }) {
  const res = await fetch(`${SPROUT_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(SPROUT_KEY && { 'X-API-Key': SPROUT_KEY }) },
    body: JSON.stringify({ message, history, category: null }),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(res.status === 401 ? 'Not authorised to use Sprout.' : `Sprout error (${res.status})`);
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
