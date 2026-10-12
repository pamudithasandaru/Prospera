import { useEffect, useRef, useState } from 'react';
import { streamChat } from '../api.js';

const CATEGORIES = ['', 'courses', 'products', 'schemes', 'facilities', 'farming'];
const SUGGESTIONS = [
  'What courses do you offer on irrigation?',
  'Which tractors are available and how much do they cost?',
  'Am I eligible for the fertilizer subsidy?',
  'How can I control pests organically?',
];

function Answer({ text }) {
  // light formatting: **bold**, "- " bullets, and highlighted [n] citations
  const inline = (s) =>
    s.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((p, i) => {
      if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>;
      if (/^\[\d+\]$/.test(p)) return <sup key={i} className="cite">{p.slice(1, -1)}</sup>;
      return p;
    });
  return text.split('\n').map((line, i) =>
    /^\s*[-*]\s+/.test(line) ? (
      <div key={i} className="bullet">• {inline(line.replace(/^\s*[-*]\s+/, ''))}</div>
    ) : line.trim() ? (
      <p key={i}>{inline(line)}</p>
    ) : null
  );
}

function Sources({ sources }) {
  if (!sources?.length) return null;
  return (
    <details className="sources">
      <summary>{sources.length} source{sources.length > 1 ? 's' : ''}</summary>
      {sources.map((s) => (
        <div key={s.id} className="source">
          <b>[{s.id}] {s.source}</b>
          {s.section && <span className="tag">{s.section}</span>}
          <span className="tag cat">{s.category}</span>
          <p>{s.snippet}…</p>
        </div>
      ))}
    </details>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patchLast = (fn) => setMessages((m) => [...m.slice(0, -1), fn(m[m.length - 1])]);

  async function send(text) {
    const message = text.trim();
    if (!message || busy) return;
    const history = messages
      .filter((m) => m.content && !m.error)
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: 'user', content: message }, { role: 'assistant', content: '', sources: [] }]);
    setInput('');
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await streamChat({
        message,
        history,
        category,
        signal: ctrl.signal,
        onEvent: (e) => {
          if (e.type === 'sources') patchLast((l) => ({ ...l, sources: e.sources }));
          else if (e.type === 'token') patchLast((l) => ({ ...l, content: l.content + e.text }));
          else if (e.type === 'error') patchLast((l) => ({ ...l, error: true, content: e.message }));
        },
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        patchLast((l) => ({ ...l, error: true, content: err.message || 'Could not reach Sprout. Please try again.' }));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="chat">
      <div className="messages" aria-live="polite">
        {messages.length === 0 && (
          <div className="welcome">
            <h2>Hello, I'm Sprout 🌱</h2>
            <p>Ask me about farming, Prospera courses, marketplace products, government schemes and our services.</p>
            <div className="chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role} ${m.error ? 'error' : ''}`}>
            <div className="bubble">
              {m.role === 'assistant' && !m.content && !m.error ? (
                <span className="typing"><i /><i /><i /></span>
              ) : m.role === 'assistant' && !m.error ? (
                <Answer text={m.content} />
              ) : (
                m.content
              )}
              {m.role === 'assistant' && !m.error && <Sources sources={m.sources} />}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Topic filter">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c ? c[0].toUpperCase() + c.slice(1) : 'All topics'}</option>
          ))}
        </select>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Sprout a question…"
          maxLength={2000}
          aria-label="Your question"
        />
        <button type="submit" disabled={busy || !input.trim()}>Send</button>
        {messages.length > 0 && (
          <button type="button" className="ghost" onClick={() => !busy && setMessages([])} disabled={busy}>
            New chat
          </button>
        )}
      </form>
    </section>
  );
}
