/**
 * server/services/weatherService.js
 * Live weather from Open-Meteo (https://open-meteo.com — free, no API key,
 * non-commercial use). Results are cached per district so a busy page makes at
 * most one upstream call per district every 15 minutes.
 *
 * Alerts and the "agricultural insights" are generated here from the real
 * forecast with simple rules. They are general guidance, not official warnings.
 */
const axios = require('axios');

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 10;
const CACHE_TTL_MS = 15 * 60 * 1000;
const STALE_OK_MS = 3 * 60 * 60 * 1000; // serve old data this long if the provider is down
const REQUEST_TIMEOUT_MS = 8000;

const cache = new Map(); // district name -> { at, data }
const inflight = new Map(); // district name -> Promise (dedupes concurrent requests)

// ── WMO weather codes -> the labels the UI knows ────────────────────────────
const describeCode = (code, isDay = true) => {
  if (code === 0 || code === 1) return isDay ? 'Sunny' : 'Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Cloudy';
  if (code === 45 || code === 48) return 'Foggy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rainy';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Cloudy';
};

const round1 = (n) => Math.round(Number(n) * 10) / 10;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

// ── Rule-based advisories (alerts) ──────────────────────────────────────────
const buildAdvisories = (forecast) => {
  const alerts = [];
  const next2 = forecast.slice(0, 2);
  const next3 = forecast.slice(0, 3);
  const rain48 = sum(next2.map((d) => d.rainfall));

  if (rain48 >= 50) {
    alerts.push({
      title: `Heavy rain expected (about ${Math.round(rain48)} mm in 48 hours)`,
      description: 'Hold irrigation, clear drainage channels and protect seedlings and harvested produce.',
      severity: 'high',
    });
  } else if (rain48 >= 20) {
    alerts.push({
      title: `Rain expected (about ${Math.round(rain48)} mm in 48 hours)`,
      description: 'Reduce irrigation for the next two days, especially in paddy fields.',
      severity: 'medium',
    });
  }

  if (next2.some((d) => d.condition === 'Thunderstorm')) {
    alerts.push({
      title: 'Thunderstorm risk in the next 48 hours',
      description: 'Avoid working in open fields during storms and secure equipment and covers.',
      severity: 'medium',
    });
  }

  const maxWind = Math.max(...next3.map((d) => d.windMax));
  if (maxWind >= 40) {
    alerts.push({
      title: `Strong winds expected (up to ${Math.round(maxWind)} km/h)`,
      description: 'Secure greenhouse covers, shade nets and young plants; delay spraying.',
      severity: maxWind >= 55 ? 'high' : 'medium',
    });
  }

  const maxTemp = Math.max(...next3.map((d) => d.temp.max));
  if (maxTemp >= 35) {
    alerts.push({
      title: `High heat expected (up to ${Math.round(maxTemp)}°C)`,
      description: 'Irrigate early morning or evening and avoid field work in the midday heat.',
      severity: maxTemp >= 37 ? 'high' : 'medium',
    });
  }

  const week = forecast.slice(0, 7);
  if (week.length === 7 && sum(week.map((d) => d.rainfall)) < 3 && Math.max(...week.map((d) => d.temp.max)) >= 32) {
    alerts.push({
      title: 'Dry spell likely this week',
      description: 'Little rain is forecast. Plan irrigation and consider mulching to conserve soil moisture.',
      severity: 'low',
    });
  }

  return alerts;
};

// ── Rule-based "agricultural insights" ──────────────────────────────────────
// tone: success | info | warning | error  (maps to the UI's colours)
const buildInsights = (current, forecast) => {
  const next3 = forecast.slice(0, 3);
  const rain3 = sum(next3.map((d) => d.rainfall));
  const maxTemp = Math.max(...next3.map((d) => d.temp.max));
  const minTemp = Math.min(...next3.map((d) => d.temp.min));
  const storm = next3.some((d) => d.condition === 'Thunderstorm');
  const wettestDay = Math.max(...next3.map((d) => d.rainfall));

  let planting;
  if (rain3 >= 60 || wettestDay >= 40) {
    planting = { tone: 'error', level: 'Poor', text: 'Heavy rain may wash out seed and damage young plants. Delay sowing and transplanting.' };
  } else if (storm) {
    planting = { tone: 'warning', level: 'Fair', text: 'Thunderstorms are possible. Plant between storms and avoid exposed seedbeds.' };
  } else if (maxTemp >= 35 && rain3 < 5) {
    planting = { tone: 'warning', level: 'Fair', text: 'Hot and dry. Plant only where you can irrigate, and prefer early morning or evening.' };
  } else if (rain3 >= 5 && maxTemp <= 33 && minTemp >= 20) {
    planting = { tone: 'success', level: 'Excellent', text: 'Gentle rain and warm temperatures suit sowing and transplanting over the next few days.' };
  } else {
    planting = { tone: 'success', level: 'Good', text: 'Stable weather for the next few days is suitable for planting.' };
  }

  let irrigation;
  if (rain3 >= 25) {
    irrigation = { tone: 'success', level: 'Low need', text: `About ${Math.round(rain3)} mm of rain expected in the next 3 days. Hold irrigation.` };
  } else if (rain3 >= 8) {
    irrigation = { tone: 'info', level: 'Moderate', text: `Some rain expected (about ${Math.round(rain3)} mm in 3 days). Irrigate only if the soil is dry.` };
  } else if (maxTemp >= 33) {
    irrigation = { tone: 'warning', level: 'High need', text: 'Dry and hot over the next 3 days. Irrigate early morning or evening.' };
  } else {
    irrigation = { tone: 'info', level: 'Normal', text: 'Little rain is expected. Keep your regular irrigation schedule.' };
  }

  let pestRisk;
  if (current.humidity >= 85 && rain3 >= 5 && maxTemp >= 24) {
    pestRisk = { tone: 'error', level: 'High', text: 'Warm, humid and wet conditions favour fungal diseases and many pests. Scout fields regularly.' };
  } else if (current.humidity >= 75) {
    pestRisk = { tone: 'warning', level: 'Moderate', text: 'High humidity can encourage fungal diseases. Check leaves and stems for early signs.' };
  } else {
    pestRisk = { tone: 'success', level: 'Low', text: 'Drier air reduces fungal and pest pressure. Keep up routine scouting.' };
  }

  return { planting, irrigation, pestRisk };
};

// ── Open-Meteo call ─────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** One retry after a short pause: shared hosting IPs occasionally get a transient failure or a 429. */
const getWithRetry = async (config, attempts = 2) => {
  let lastErr;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      return await axios.get(OPEN_METEO_URL, config);
    } catch (err) {
      lastErr = err;
      const why = err.response ? `HTTP ${err.response.status}` : err.code || err.message;
      console.warn(`Open-Meteo attempt ${i}/${attempts} failed (${why})`);
      if (i < attempts) await sleep(700);
    }
  }
  throw lastErr;
};

const fetchFromProvider = async (loc) => {
  const { data } = await getWithRetry({
    timeout: REQUEST_TIMEOUT_MS,
    params: {
      latitude: loc.lat,
      longitude: loc.lon,
      current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,surface_pressure,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
      timezone: 'Asia/Colombo',
      forecast_days: FORECAST_DAYS,
    },
  });

  if (!data?.current || !data?.daily?.time) throw new Error('Unexpected response from weather provider');

  const c = data.current;
  const isDay = c.is_day === 1;
  const current = {
    temperature: Math.round(c.temperature_2m),
    condition: describeCode(c.weather_code, isDay),
    humidity: Math.round(c.relative_humidity_2m),
    windSpeed: Math.round(c.wind_speed_10m),
    rainfall: round1(c.precipitation),
    pressure: Math.round(c.surface_pressure),
    isDay,
  };

  const d = data.daily;
  const forecast = d.time.map((date, i) => ({
    date,
    temp: { max: Math.round(d.temperature_2m_max[i]), min: Math.round(d.temperature_2m_min[i]) },
    condition: describeCode(d.weather_code[i], true),
    rainfall: round1(d.precipitation_sum[i] || 0),
    windMax: Math.round(d.wind_speed_10m_max[i] || 0),
  }));

  return {
    location: loc.name,
    coordinates: { lat: loc.lat, lon: loc.lon },
    current,
    forecast,
    alerts: buildAdvisories(forecast),
    insights: buildInsights(current, forecast),
    updatedAt: new Date().toISOString(),
    source: 'Open-Meteo',
    stale: false,
  };
};

/**
 * Weather for a district object from data/lkLocations. Cached; falls back to
 * slightly old data if the provider is unreachable; throws if there is none.
 */
const getWeather = async (loc) => {
  const hit = cache.get(loc.name);
  const now = Date.now();
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.data;

  if (inflight.has(loc.name)) return inflight.get(loc.name);

  const p = fetchFromProvider(loc)
    .then((data) => {
      cache.set(loc.name, { at: Date.now(), data });
      return data;
    })
    .catch((err) => {
      if (hit && now - hit.at < STALE_OK_MS) {
        console.warn(`Weather provider failed for ${loc.name}, serving cached data:`, err.message);
        return { ...hit.data, stale: true };
      }
      throw err;
    })
    .finally(() => inflight.delete(loc.name));

  inflight.set(loc.name, p);
  return p;
};

module.exports = { getWeather, describeCode, buildAdvisories, buildInsights };
