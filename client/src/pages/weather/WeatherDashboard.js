import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Divider,
  Button,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Link,
} from '@mui/material';
import {
  WbSunny,
  Cloud,
  Opacity,
  Air,
  Compress,
  WaterDrop,
  Thunderstorm,
  BlurOn,
  NightsStay,
} from '@mui/icons-material';
import { neuColors, raised } from '../../neumorphic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_DISTRICT = 'Colombo';
// Remembered per user, so people sharing a browser each keep their own choice.
const storageKey = (userId) => `weatherDistrict:${userId || 'anon'}`;

const readSaved = (userId) => {
  try { return localStorage.getItem(storageKey(userId)) || ''; } catch { return ''; }
};
const save = (userId, v) => {
  try { localStorage.setItem(storageKey(userId), v); } catch { /* storage unavailable: choice just isn't remembered */ }
};

const parseDay = (iso) => new Date(`${iso}T00:00:00`);
const dayLabel = (iso, opts) => parseDay(iso).toLocaleDateString('en-US', opts);

const getWeatherIcon = (condition, size = 80) => {
  const sx = { fontSize: size };
  switch (condition?.toLowerCase()) {
    case 'sunny':
      return <WbSunny sx={{ ...sx, color: '#FDB813' }} />;
    case 'clear':
      return <NightsStay sx={{ ...sx, color: '#5C6BC0' }} />;
    case 'partly cloudy':
    case 'cloudy':
      return <Cloud sx={{ ...sx, color: '#B0BEC5' }} />;
    case 'foggy':
      return <BlurOn sx={{ ...sx, color: '#90A4AE' }} />;
    case 'rainy':
      return <Opacity sx={{ ...sx, color: '#2196F3' }} />;
    case 'thunderstorm':
      return <Thunderstorm sx={{ ...sx, color: '#5E35B1' }} />;
    default:
      return <Cloud sx={{ ...sx, color: '#B0BEC5' }} />;
  }
};

// Whichever provider answered must be credited (MET Norway data is CC BY 4.0).
const CREDITS = {
  'Open-Meteo': { label: 'Open-Meteo.com', url: 'https://open-meteo.com/' },
  'MET Norway': { label: 'MET Norway', url: 'https://www.met.no/en' },
};

const severityColor = { low: 'info', medium: 'warning', high: 'error' };
const toneColor = { success: 'success.main', info: 'info.main', warning: 'warning.main', error: 'error.main' };

const INSIGHTS = [
  { key: 'planting', title: 'Planting Conditions' },
  { key: 'irrigation', title: 'Irrigation Advisory' },
  { key: 'pestRisk', title: 'Pest & Disease Risk' },
];

const WeatherDashboard = () => {
  const { user } = useAuth();
  const profileDistrict = user?.profile?.location?.district || '';

  // Which district to show: the user's last choice, else their profile district, else Colombo.
  const saved = readSaved(user?._id);
  const [district, setDistrict] = useState(saved || profileDistrict || DEFAULT_DISTRICT);
  const [origin, setOrigin] = useState(saved ? 'saved' : profileDistrict ? 'profile' : 'default');

  const [weather, setWeather] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get('/weather/current', { params: { district } })
      .then((res) => {
        if (cancelled) return;
        setWeather(res.data.data);
        setLocations(res.data.data.locations || []);
      })
      .catch((err) => {
        if (cancelled) return;
        // A profile district we don't have coordinates for: fall back to the default instead of failing.
        if (err.response?.status === 400 && district !== DEFAULT_DISTRICT) {
          setLocations(err.response.data?.locations || []);
          setDistrict(DEFAULT_DISTRICT);
          setOrigin('default');
          return;
        }
        setError(err.response?.data?.message || 'Could not load weather data.');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [district, reloadKey]);

  const userId = user?._id;
  const onPickDistrict = useCallback((value) => {
    setDistrict(value);
    setOrigin('saved');
    save(userId, value);
  }, [userId]);

  const current = weather?.current;
  const forecast = weather?.forecast || [];
  const alerts = weather?.alerts || [];
  const insights = weather?.insights;
  const shownDistrict = weather?.location || district;

  const trendData = forecast.map((d) => ({
    date: dayLabel(d.date, { weekday: 'short', day: 'numeric' }),
    max: d.temp.max,
    min: d.temp.min,
  }));

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header + location picker */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
            Weather Portal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live weather and forecasts for Sri Lankan districts
          </Typography>
        </Box>
        <Box sx={{ minWidth: { xs: '100%', sm: 240 } }}>
          <FormControl size="small" fullWidth>
            <InputLabel id="district-label">District</InputLabel>
            <Select
              labelId="district-label"
              label="District"
              value={locations.includes(district) || locations.length === 0 ? district : ''}
              onChange={(e) => onPickDistrict(e.target.value)}
            >
              {(locations.length ? locations : [district]).map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {origin === 'profile' && (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
              Showing your profile district. Pick another to change it.
            </Typography>
          )}
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && !weather && (
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" onClick={() => setReloadKey((k) => k + 1)}>Retry</Button>}
        >
          {error}
        </Alert>
      )}

      {error && weather && (
        <Alert severity="warning" sx={{ mb: 2 }}>{error} Showing the last data loaded.</Alert>
      )}

      {weather?.stale && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Live weather is temporarily unreachable, so this is slightly older data.
        </Alert>
      )}

      {weather && (
        <>
          {/* Automatic advisories */}
          {alerts.length > 0 && (
            <Box mb={3}>
              {alerts.map((alert) => (
                <Alert key={alert.title} severity={severityColor[alert.severity] || 'info'} sx={{ mb: 1 }}>
                  <AlertTitle sx={{ fontWeight: 'bold' }}>{alert.title}</AlertTitle>
                  {alert.description}
                </Alert>
              ))}
              <Typography variant="caption" color="text.secondary">
                Advisories are generated automatically from the forecast. They are general guidance, not official warnings.
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            {/* Current Weather */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Current Weather
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {shownDistrict}, Sri Lanka
                </Typography>

                <Box textAlign="center" my={3}>
                  {getWeatherIcon(current.condition)}
                  <Typography variant="h2" fontWeight="bold" mt={2}>
                    {current.temperature}°C
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {current.condition}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  {[
                    { icon: <Opacity color="primary" />, label: 'Humidity', value: `${current.humidity}%` },
                    { icon: <Air color="primary" />, label: 'Wind Speed', value: `${current.windSpeed} km/h` },
                    { icon: <WaterDrop color="primary" />, label: 'Rainfall', value: `${current.rainfall} mm` },
                    { icon: <Compress color="primary" />, label: 'Pressure', value: `${current.pressure} hPa` },
                  ].map((m) => (
                    <Grid item xs={6} key={m.label}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {m.icon}
                        <Box>
                          <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                          <Typography variant="h6" fontWeight="bold">{m.value}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Forecast */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {forecast.length}-Day Forecast
                </Typography>

                <Grid container spacing={2} mt={1}>
                  {forecast.map((day) => (
                    <Grid item xs={6} sm={4} md={4} lg={3} key={day.date}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            {dayLabel(day.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center" my={1}>
                            {getWeatherIcon(day.condition, 48)}
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            {day.temp.max}° / {day.temp.min}°
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {day.condition}
                          </Typography>
                          {day.rainfall > 0 && (
                            <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                              <WaterDrop fontSize="small" color="primary" />
                              <Typography variant="caption">{day.rainfall} mm</Typography>
                            </Box>
                          )}
                          <Box display="flex" alignItems="center" gap={0.5} mt={day.rainfall > 0 ? 0.25 : 1}>
                            <Air fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">up to {day.windMax} km/h</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Temperature Chart */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Temperature Trend
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={neuColors.dark} strokeOpacity={0.4} />
                    <XAxis dataKey="date" stroke={neuColors.textMuted} tickLine={false} axisLine={false} />
                    <YAxis stroke={neuColors.textMuted} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ background: neuColors.base, border: 'none', borderRadius: 12, boxShadow: raised('sm'), color: neuColors.text }} />
                    <Line type="monotone" dataKey="max" name="Max °C" stroke="#c62828" strokeWidth={2} />
                    <Line type="monotone" dataKey="min" name="Min °C" stroke="#0277bd" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Agricultural Insights (derived from the forecast) */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Agricultural Insights
                </Typography>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                  {INSIGHTS.map(({ key, title }) => {
                    const item = insights?.[key];
                    if (!item) return null;
                    return (
                      <Card variant="outlined" key={key}>
                        <CardContent>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: toneColor[item.tone] }}>
                            {title}
                          </Typography>
                          <Typography variant="body2">
                            <strong>{item.level}</strong> – {item.text}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                  General guidance worked out from the forecast for {shownDistrict}. Always check your own fields.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="caption" color="text.secondary" display="block" mt={3}>
            Weather data by{' '}
            <Link href={(CREDITS[weather.source] || CREDITS['Open-Meteo']).url} target="_blank" rel="noopener noreferrer">
              {(CREDITS[weather.source] || CREDITS['Open-Meteo']).label}
            </Link>
            {weather.updatedAt && ` · Updated ${formatDistanceToNow(new Date(weather.updatedAt), { addSuffix: true })}`}
          </Typography>
        </>
      )}
    </Container>
  );
};

export default WeatherDashboard;
