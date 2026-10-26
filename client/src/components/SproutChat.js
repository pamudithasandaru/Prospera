import React, { useEffect, useRef, useState } from 'react';
import { Box, Fab, IconButton, InputBase, Typography, Zoom, Fade, Chip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { neuColors, raised, inset } from '../neumorphic';
import { streamSproutChat } from '../services/sproutApi';
import { BRAND_NAME } from '../brand';

// Friendly names for the pages Sprout can point to.
const PAGE_LABELS = {
  '/marketplace': 'Marketplace',
  '/market': 'Wholesale Market',
  '/government': 'Government Portal',
  '/learning': 'Learning Hub',
};

/** Links for the sources an answer actually cites ([1], [2]...), deduplicated, at most three. */
function citedLinks(message) {
  const cited = new Set([...(message.content || '').matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  const seen = new Set();
  const links = [];
  for (const src of message.sources || []) {
    if (!src.url || !cited.has(src.id)) continue;
    const isCourse = src.url.startsWith('/learning/course/');
    const label = isCourse ? `Course: ${src.source}` : PAGE_LABELS[src.url] || 'Open page';
    const key = `${src.url}|${label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ url: src.url, label: label.length > 40 ? `${label.slice(0, 37)}…` : label });
  }
  return links.slice(0, 3);
}

const SUGGESTIONS = [
  'What courses do you offer on irrigation?',
  'How can I control pests organically?',
  'Am I eligible for the fertilizer subsidy?',
];

export default function SproutChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  const abortRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patchLast = (fn) => setMessages((m) => [...m.slice(0, -1), fn(m[m.length - 1])]);

  async function send(text) {
    const message = text.trim();
    if (!message || busy) return;
    const history = messages
      .filter((m) => m.content && !m.error)
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: 'user', content: message }, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await streamSproutChat({
        message,
        history,
        signal: ctrl.signal,
        onEvent: (e) => {
          if (e.type === 'sources') patchLast((l) => ({ ...l, sources: e.sources }));
          else if (e.type === 'token') patchLast((l) => ({ ...l, content: l.content + e.text }));
          else if (e.type === 'error') patchLast((l) => ({ ...l, error: true, content: e.message }));
        },
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        patchLast((l) => ({ ...l, error: true, content: 'Could not reach Sprout. Please try again.' }));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Fade in={open} unmountOnExit>
        <Box
          role="dialog"
          aria-label="Sprout assistant"
          sx={{
            position: 'fixed',
            right: { xs: 8, sm: 24 },
            bottom: { xs: 80, sm: 96 },
            width: { xs: 'calc(100vw - 16px)', sm: 380 },
            height: { xs: '70vh', sm: 520 },
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '24px',
            bgcolor: neuColors.base,
            boxShadow: raised('lg'),
            zIndex: 1300,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, pt: 2.5, pb: 1.5 }}>
            <Typography sx={{ flexGrow: 1, fontWeight: 700, color: neuColors.primary }}>
              🌱 Sprout
            </Typography>
            <IconButton size="small" aria-label="New chat" disabled={busy || !messages.length} onClick={() => setMessages([])}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label="Close chat" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }} aria-live="polite">
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: neuColors.text }}>
                  Hello, I'm Sprout!
                </Typography>
                <Typography variant="body2" sx={{ color: neuColors.textMuted, mb: 2 }}>
                  Ask about farming, courses, products, schemes and {BRAND_NAME} services.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {SUGGESTIONS.map((s) => (
                    <Chip key={s} label={s} onClick={() => send(s)} sx={{ height: 'auto', py: 0.75, '& .MuiChip-label': { whiteSpace: 'normal' } }} />
                  ))}
                </Box>
              </Box>
            )}
            {messages.map((m, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  px: 1.5,
                  py: 1,
                  borderRadius: '16px',
                  fontSize: 14,
                  color: m.error ? neuColors.error : neuColors.text,
                  boxShadow: m.role === 'user' ? inset('xs') : raised('xs'),
                  '& p': { m: 0 },
                  '& p + p, & ul, & ol': { mt: 1, mb: 0 },
                  '& ul, & ol': { pl: 2.5 },
                  wordBreak: 'break-word',
                }}
              >
                {m.role === 'assistant' && !m.content && !m.error ? (
                  <Typography variant="body2" sx={{ color: neuColors.textMuted }}>Thinking…</Typography>
                ) : m.role === 'assistant' && !m.error ? (
                  <>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                    {citedLinks(m).length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                        {citedLinks(m).map((l) => (
                          <Chip
                            key={`${l.url}${l.label}`}
                            size="small"
                            clickable
                            label={`Open: ${l.label}`}
                            onClick={() => { navigate(l.url); setOpen(false); }}
                            sx={{ boxShadow: raised('xs'), color: neuColors.primary, fontWeight: 600 }}
                          />
                        ))}
                      </Box>
                    )}
                  </>
                ) : (
                  m.content
                )}
              </Box>
            ))}
            <div ref={endRef} />
          </Box>

          <Box
            component="form"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, pt: 1.5, pb: 2.5 }}
          >
            <InputBase
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sprout…"
              inputProps={{ maxLength: 2000, 'aria-label': 'Your question' }}
              sx={{ flexGrow: 1, px: 2, py: 0.75, borderRadius: '16px', boxShadow: inset('sm'), fontSize: 14 }}
            />
            <IconButton type="submit" aria-label="Send" disabled={busy || !input.trim()} sx={{ boxShadow: raised('xs'), color: neuColors.primary }}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Fade>

      <Zoom in>
        <Fab
          aria-label={open ? 'Close Sprout chat' : 'Open Sprout chat'}
          onClick={() => setOpen((o) => !o)}
          sx={{
            position: 'fixed',
            right: { xs: 16, sm: 24 },
            bottom: { xs: 16, sm: 24 },
            zIndex: 1300,
            bgcolor: neuColors.base,
            color: neuColors.primary,
            boxShadow: raised('md'),
            '&:hover': { bgcolor: neuColors.base, boxShadow: raised('lg') },
          }}
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Zoom>
    </>
  );
}
