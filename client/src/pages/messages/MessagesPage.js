/**
 * MessagesPage.js
 * Full private messaging UI: conversation list + chat window.
 * Features: real-time via Socket.IO, multimedia (image/file), voice messages.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Skeleton,
  alpha,
  Badge,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  Search,
  ArrowBack,
  Circle,
  AttachFile,
  Image as ImageIcon,
  Mic,
  Stop,
  PlayArrow,
  Pause,
  InsertDriveFile,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { resolveAvatar } from '../../utils/avatarUtils';

// ── Helpers ───────────────────────────────────────────────────────────────────
const toBase64 = (blob) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });

const formatBytes = (b) => {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

// ── MediaBubble — renders image / audio / file inside a chat bubble ───────────
const MediaBubble = ({ msg, isOwn }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  if (msg.mediaType === 'image') {
    return (
      <Box
        component="img"
        src={msg.mediaUrl}
        alt="shared image"
        sx={{
          maxWidth: 260,
          maxHeight: 200,
          borderRadius: 2,
          objectFit: 'cover',
          display: 'block',
          cursor: 'pointer',
        }}
        onClick={() => window.open(msg.mediaUrl, '_blank')}
      />
    );
  }

  if (msg.mediaType === 'audio') {
    const togglePlay = () => {
      if (!audioRef.current) return;
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
      }
    };
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 180 }}>
        <IconButton
          size="small"
          onClick={togglePlay}
          sx={{ bgcolor: isOwn ? 'rgba(255,255,255,0.2)' : alpha('#000', 0.08), color: isOwn ? 'white' : 'text.primary' }}
        >
          {playing ? <Pause sx={{ fontSize: 18 }} /> : <PlayArrow sx={{ fontSize: 18 }} />}
        </IconButton>
        <Typography variant="caption" sx={{ color: isOwn ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
          🎙 Voice message
        </Typography>
        <audio
          ref={audioRef}
          src={msg.mediaUrl}
          onEnded={() => setPlaying(false)}
          style={{ display: 'none' }}
        />
      </Box>
    );
  }

  if (msg.mediaType === 'file') {
    return (
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
        onClick={() => window.open(msg.mediaUrl, '_blank')}
      >
        <InsertDriveFile sx={{ fontSize: 28, color: isOwn ? 'rgba(255,255,255,0.85)' : 'primary.main' }} />
        <Box>
          <Typography variant="caption" fontWeight={600} sx={{ display: 'block', color: isOwn ? 'white' : 'text.primary' }}>
            {msg.fileName || 'File'}
          </Typography>
          {msg.fileSize && (
            <Typography variant="caption" sx={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'text.secondary', fontSize: '0.65rem' }}>
              {formatBytes(msg.fileSize)}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return null;
};

// ── Main Component ────────────────────────────────────────────────────────────
const MessagesPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showList, setShowList] = useState(true);
  const [sending, setSending] = useState(false);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);


  useEffect(() => {
    api.get('/messages/conversations')
      .then((res) => setConversations(res.data.data || []))
      .catch(() => setConversations([]))
      .finally(() => setLoadingConvs(false));
  }, []);

  // ── Open DM from URL param ?user=<userId> ──────────────────────────────────
  useEffect(() => {
    const targetUserId = searchParams.get('user');
    if (targetUserId) openConversation(null, targetUserId);
  }, []); // eslint-disable-line

  const openConversation = useCallback(async (convId, userId) => {
    try {
      let conv;
      if (userId) {
        const res = await api.get(`/messages/conversation/${userId}`);
        conv = res.data.data;
      }
      const id = convId || conv?._id;
      if (!id) return;

      setActiveConvId(id);
      setShowList(false);
      setLoadingMsgs(true);

      if (!conversations.find((c) => c._id === id)) {
        setConversations((prev) => [conv, ...prev]);
      }

      const res = await api.get(`/messages/${id}`);
      setMessages(res.data.data || []);

      if (socket) socket.emit('join:conversation', id);
    } catch (err) {
      console.error('Open conversation error:', err);
    } finally {
      setLoadingMsgs(false);
    }
  }, [conversations, socket]);

  // ── Socket.IO real-time events ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.on('message:new', (msg) => {
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => {
          // Avoid duplicate if optimistic message already added
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? { ...c, lastMessage: msg.text || '📎 Media', lastMessageAt: msg.createdAt }
            : c
        )
      );
    });
    socket.on('typing:start', ({ userId: tid, conversationId }) => {
      if (conversationId === activeConvId)
        setTypingUsers((prev) => ({ ...prev, [tid]: true }));
    });
    socket.on('typing:stop', ({ userId: tid }) => {
      setTypingUsers((prev) => { const n = { ...prev }; delete n[tid]; return n; });
    });
    return () => {
      socket.off('message:new');
      socket.off('typing:start');
      socket.off('typing:stop');
    };
  }, [socket, activeConvId]);

  useEffect(() => {
    if (!socket || !activeConvId) return;
    socket.emit('join:conversation', activeConvId);
    return () => socket.emit('leave:conversation', activeConvId);
  }, [socket, activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send helpers ─────────────────────────────────────────────────────────────
  const sendMessage = async (payload) => {
    if (!activeConvId) return;
    // Optimistic insert
    const optimistic = {
      _id: `opt-${Date.now()}`,
      conversationId: activeConvId,
      senderId: user._id,
      senderName: user.name,
      senderAvatar: resolveAvatar(user),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);
    try {
      await api.post(`/messages/${activeConvId}`, payload);
    } catch (err) {
      console.error('Send error:', err);
      // Remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvId) return;
    const text = newMessage.trim();
    setNewMessage('');
    await sendMessage({ text });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket && activeConvId) {
      socket.emit('typing:start', { conversationId: activeConvId });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId: activeConvId });
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── File / Image attachment ──────────────────────────────────────────────────
  const handleFileSelect = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const dataUrl = await toBase64(file);
      await sendMessage({
        text: '',
        mediaUrl: dataUrl,
        mediaType: type === 'image' ? 'image' : 'file',
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (err) {
      console.error('File attach error:', err);
    }
  };

  // ── Voice recording ──────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const dataUrl = await toBase64(blob);
        await sendMessage({ text: '', mediaUrl: dataUrl, mediaType: 'audio' });
        clearInterval(recordTimerRef.current);
        setRecordingSeconds(0);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      alert('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const getOtherParticipant = useCallback((conv) => {
    return conv.otherUser || null;
  }, []);

  const filtered = conversations.filter((c) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(c);
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeConv = conversations.find((c) => c._id === activeConvId);
  const otherUser = activeConv ? getOtherParticipant(activeConv) : null;
  const isTyping = Object.keys(typingUsers).filter((id) => id !== user?._id).length > 0;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0, bgcolor: 'background.default' }}>

      {/* ── Conversation List ──────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          width: { xs: showList ? '100%' : 0, md: 320 },
          minWidth: { md: 320 },
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.2s',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold" mb={1.5}>Messages</Typography>
          <TextField
            fullWidth size="small"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18 }} /></InputAdornment>,
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 99 } }}
          />
        </Box>

        <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
          {loadingConvs
            ? Array.from({ length: 5 }).map((_, i) => (
                <ListItem key={i}>
                  <ListItemAvatar><Skeleton variant="circular" width={44} height={44} /></ListItemAvatar>
                  <ListItemText primary={<Skeleton width="60%" />} secondary={<Skeleton width="40%" />} />
                </ListItem>
              ))
            : filtered.length === 0
            ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No conversations yet</Typography>
                  <Typography variant="caption" color="text.secondary">Connect with farmers to start chatting</Typography>
                </Box>
              )
            : filtered.map((conv) => {
                const other = getOtherParticipant(conv);
                const isActive = conv._id === activeConvId;
                return (
                  <React.Fragment key={conv._id}>
                    <ListItem
                      button
                      selected={isActive}
                      onClick={() => openConversation(conv._id)}
                      sx={{
                        py: 1.5,
                        '&.Mui-selected': { bgcolor: alpha('#4CAF50', 0.08) },
                        '&:hover': { bgcolor: alpha('#4CAF50', 0.05) },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={<Circle sx={{ fontSize: 10, color: '#44b700' }} />}
                        >
                          <Avatar
                            src={resolveAvatar(other) || undefined}
                            sx={{ width: 44, height: 44 }}
                          >
                            {other?.name ? other.name.charAt(0).toUpperCase() : '?'}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="600" noWrap>
                            {other?.name || <Skeleton width={80} />}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {conv.lastMessage || 'Start a conversation'}
                          </Typography>
                        }
                      />
                      {conv.lastMessageAt && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', ml: 1, whiteSpace: 'nowrap' }}>
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                        </Typography>
                      )}
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                );
              })}
        </List>
      </Paper>

      {/* ── Chat Window ────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: { xs: showList ? 'none' : 'flex', md: 'flex' }, flexDirection: 'column', overflow: 'hidden' }}>
        {!activeConvId ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ fontSize: 64 }}>💬</Box>
            <Typography variant="h6" color="text.secondary">Select a conversation</Typography>
            <Typography variant="body2" color="text.secondary">Or connect with farmers to start chatting</Typography>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'background.paper' }}>
              <IconButton sx={{ display: { md: 'none' } }} onClick={() => setShowList(true)}>
                <ArrowBack />
              </IconButton>
              <Avatar src={resolveAvatar(otherUser) || undefined} sx={{ width: 40, height: 40 }}>
                {otherUser?.name?.charAt(0)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {otherUser?.name || <Skeleton width={120} />}
                </Typography>
                {isTyping && (
                  <Typography variant="caption" color="primary" sx={{ fontStyle: 'italic' }}>typing...</Typography>
                )}
              </Box>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {loadingMsgs
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                      <Skeleton variant="rounded" width={200} height={40} sx={{ borderRadius: 3 }} />
                    </Box>
                  ))
                : messages.map((msg) => {
                    const isOwn = msg.senderId === user?._id;
                    const isOptimistic = msg._id?.startsWith('opt-');
                    return (
                      <Box
                        key={msg._id}
                        sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 1 }}
                      >
                        {!isOwn && (
                          <Avatar src={msg.senderAvatar || undefined} sx={{ width: 28, height: 28 }}>
                            {msg.senderName?.charAt(0)}
                          </Avatar>
                        )}
                        <Box>
                          {!isOwn && (
                            <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontSize: '0.68rem', fontWeight: 600 }}>
                              {msg.senderName}
                            </Typography>
                          )}
                          <Box
                            sx={{
                              maxWidth: 320,
                              px: msg.mediaType ? 1.5 : 2,
                              py: msg.mediaType ? 1 : 1,
                              borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              bgcolor: isOwn ? 'primary.main' : alpha('#000', 0.06),
                              color: isOwn ? 'white' : 'text.primary',
                              opacity: isOptimistic ? 0.75 : 1,
                              transition: 'opacity 0.3s',
                            }}
                          >
                            {msg.mediaType && <MediaBubble msg={msg} isOwn={isOwn} />}
                            {msg.text && (
                              <Typography variant="body2" sx={{ mt: msg.mediaType ? 0.5 : 0 }}>
                                {msg.text}
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontSize: '0.65rem' }}>
                            {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                            {isOptimistic && ' · sending…'}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
              {isTyping && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'grey.300' }} />
                  <Chip label="typing..." size="small" sx={{ borderRadius: 99, bgcolor: alpha('#000', 0.06) }} />
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* ── Input Bar ─────────────────────────────────────────────────── */}
            <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              {/* Recording indicator */}
              {recording && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, px: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', animation: 'pulse 1s infinite' }} />
                  <Typography variant="caption" color="error">Recording… {recordingSeconds}s</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end' }}>
                {/* Image attach */}
                <Tooltip title="Send image">
                  <IconButton size="small" onClick={() => imageInputRef.current?.click()} disabled={sending || recording}>
                    <ImageIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
                <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={(e) => handleFileSelect(e, 'image')} />

                {/* File attach */}
                <Tooltip title="Send file">
                  <IconButton size="small" onClick={() => fileInputRef.current?.click()} disabled={sending || recording}>
                    <AttachFile sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
                <input ref={fileInputRef} type="file" hidden onChange={(e) => handleFileSelect(e, 'file')} />

                {/* Text input */}
                <TextField
                  fullWidth multiline maxRows={4} size="small"
                  placeholder={recording ? 'Recording voice…' : 'Type a message…'}
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  disabled={recording}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />

                {/* Voice record */}
                <Tooltip title={recording ? 'Stop recording' : 'Voice message'}>
                  <IconButton
                    size="small"
                    color={recording ? 'error' : 'default'}
                    onClick={recording ? stopRecording : startRecording}
                    disabled={sending}
                    sx={recording ? { bgcolor: alpha('#f44336', 0.1) } : {}}
                  >
                    {recording ? <Stop sx={{ fontSize: 20 }} /> : <Mic sx={{ fontSize: 20 }} />}
                  </IconButton>
                </Tooltip>

                {/* Send */}
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending || recording}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
                  }}
                >
                  {sending ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <Send />}
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MessagesPage;
