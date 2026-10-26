import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, AlertTitle, Box, Button, Chip, Grid, LinearProgress, Paper, Table, TableBody, TableCell, TableHead,
  TableRow, Typography,
} from '@mui/material';
import { Sync, CheckCircle, ErrorOutline, CloudOff } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import { errMsg, useToast } from './adminCommon';

const ROWS = [
  { kind: 'product', label: 'Marketplace products' },
  { kind: 'listing', label: 'Wholesale listings' },
  { kind: 'course', label: 'Courses' },
  { kind: 'scheme', label: 'Government schemes' },
];

const when = (iso) => (iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : 'never');

const AdminChatbot = () => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [toast, notify] = useToast();
  const timer = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/chatbot/status');
      setStatus(res.data.data);
      setError('');
      return res.data.data;
    } catch (err) {
      setError(errMsg(err, 'Failed to load the chatbot status'));
      return null;
    }
  }, []);

  useEffect(() => { load(); return () => clearTimeout(timer.current); }, [load]);

  // While a sync runs, check on it every 2 seconds.
  const running = Boolean(status?.running) || starting;
  useEffect(() => {
    if (!running) return undefined;
    timer.current = setTimeout(async () => {
      const s = await load();
      if (s && !s.running) setStarting(false);
    }, 2000);
    return () => clearTimeout(timer.current);
  }, [running, status, load]);

  const startSync = async (kinds) => {
    setStarting(true);
    try {
      await api.post('/admin/chatbot/sync', kinds ? { kinds } : {});
      notify('Sync started');
      await load();
    } catch (err) {
      setStarting(false);
      notify(errMsg(err, 'Could not start the sync'), 'error');
    }
  };

  if (error && !status) return <Alert severity="error">{error}</Alert>;
  if (!status) return <LinearProgress />;

  const known = status.knowledge?.kinds || {};
  const lastSynced = Object.values(known).map((k) => k.last_synced).filter(Boolean).sort().pop();
  const lastRun = status.lastRun;

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {!status.configured && (
        <Alert severity="warning">
          <AlertTitle>The chatbot sync is not set up on this server</AlertTitle>
          Set <code>SPROUT_URL</code> (the Sprout service address) and <code>SPROUT_ADMIN_KEY</code> (the same value as
          <code> ADMIN_API_KEY</code> on the Sprout service) in the server environment, then restart it.
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold">Sprout chatbot knowledge</Typography>
            <Typography variant="body2" color="text.secondary">
              Last record update: {when(lastSynced)}
              {status.autoSyncHours ? ` · full re-sync every ${status.autoSyncHours} h` : ''}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Sync />}
            disabled={!status.configured || running}
            onClick={() => startSync()}
          >
            {running ? 'Syncing…' : 'Sync everything now'}
          </Button>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          {status.reachable ? (
            <Chip size="small" color="success" icon={<CheckCircle />} label="Sprout online" />
          ) : (
            <Chip size="small" color="warning" icon={<CloudOff />} label="Sprout not reachable" />
          )}
          {status.health && (
            <>
              <Chip size="small" color={status.health.qdrant ? 'success' : 'error'} label={status.health.qdrant ? 'Qdrant connected' : 'Qdrant not connected'} />
              <Chip size="small" color={status.health.openai_key_set ? 'success' : 'error'} label={status.health.openai_key_set ? 'OpenAI key set' : 'OpenAI key missing'} />
            </>
          )}
        </Box>
        {status.configured && status.error && (
          <Alert severity={status.reachable ? 'error' : 'info'} sx={{ mb: 2 }}>{status.error}</Alert>
        )}

        {running && (
          <Box mb={2}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary">
              {status.current ? `Syncing ${status.current}…` : 'Waking Sprout and starting…'} This can take a minute if Sprout was asleep.
            </Typography>
          </Box>
        )}

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>What</TableCell>
                <TableCell align="right">In the database</TableCell>
                <TableCell align="right">Known to the chatbot</TableCell>
                <TableCell>Last synced</TableCell>
                <TableCell align="right">Sync</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ROWS.map(({ kind, label }) => {
                const inDb = status.databaseCounts?.[kind];
                const inBot = known[kind]?.count ?? 0;
                const behind = status.reachable && inDb !== undefined && inDb !== inBot;
                return (
                  <TableRow key={kind} hover>
                    <TableCell>{label}</TableCell>
                    <TableCell align="right">{inDb ?? '—'}</TableCell>
                    <TableCell align="right">
                      {status.reachable ? <Chip size="small" label={inBot} color={behind ? 'warning' : 'default'} /> : '—'}
                    </TableCell>
                    <TableCell>{when(known[kind]?.last_synced)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" disabled={!status.configured || running} onClick={() => startSync([kind])}>Sync</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow hover>
                <TableCell>How-to and farming guides</TableCell>
                <TableCell align="right">—</TableCell>
                <TableCell align="right">{status.reachable ? `${status.knowledge?.documents ?? 0} files` : '—'}</TableCell>
                <TableCell>from the knowledge folder</TableCell>
                <TableCell align="right">
                  <Button size="small" disabled={!status.configured || running} onClick={() => startSync(['files'])}>Sync</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {lastRun && !running && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {lastRun.ok ? <CheckCircle color="success" /> : <ErrorOutline color="error" />}
            <Typography variant="subtitle1" fontWeight="bold">
              Last sync from this server {when(lastRun.finishedAt)}: {lastRun.ok ? 'completed' : 'finished with problems'}
            </Typography>
          </Box>
          {lastRun.results.map((r) => (
            <Typography key={r.kind} variant="body2" color={r.ok ? 'text.primary' : 'error'} sx={{ ml: 4 }}>
              <strong style={{ textTransform: 'capitalize' }}>{r.kind}</strong>:{' '}
              {r.ok ? `${r.upserted} sent, ${r.removed} removed` : r.error}
            </Typography>
          ))}
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>What the chatbot can see</Typography>
            <Typography variant="body2" component="div">
              Only public catalogue information:
              <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                <li>Products: name, category, description, price, stock, shipping</li>
                <li>Wholesale listings: product, price, quantity, district, grade, whether the seller is verified</li>
                <li>Courses: details, lesson and material titles</li>
                <li>Government schemes: type, benefit, eligibility, how to apply</li>
              </ul>
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>What it never sees</Typography>
            <Typography variant="body2" component="div">
              Users, emails and phone numbers, seller names, messages, loans, credit scores, tickets, farm finances, carts and applications.
              <Box mt={1.5}>
                Changes to products, listings, courses and schemes are sent a few seconds after you save them. Use the buttons above if
                something looks out of date.
              </Box>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      {toast}
    </Box>
  );
};

export default AdminChatbot;
