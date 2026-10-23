/**
 * server/data/weather.js
 * Placeholder forecast payload served by GET /api/weather/current.
 *
 * Weather is read-only demo content with no write path, so it has no table.
 * Replace this module with a call to a real provider (WEATHER_API_KEY is
 * already in .env) when live data is wired up.
 */
const weatherData = {
  current: {
    temperature: 29,
    condition: 'Partly Cloudy',
    humidity: 74,
    windSpeed: 14,
    rainfall: 1,
    pressure: 1012,
  },
  forecast: [
    { date: '2024-01-16', temp: { max: 32, min: 24 }, condition: 'Sunny', rainfall: 0 },
    { date: '2024-01-17', temp: { max: 31, min: 25 }, condition: 'Partly Cloudy', rainfall: 2 },
    { date: '2024-01-18', temp: { max: 30, min: 24 }, condition: 'Cloudy', rainfall: 5 },
    { date: '2024-01-19', temp: { max: 29, min: 23 }, condition: 'Rainy', rainfall: 15 },
    { date: '2024-01-20', temp: { max: 28, min: 23 }, condition: 'Rainy', rainfall: 20 },
    { date: '2024-01-21', temp: { max: 30, min: 24 }, condition: 'Partly Cloudy', rainfall: 3 },
    { date: '2024-01-22', temp: { max: 31, min: 25 }, condition: 'Sunny', rainfall: 0 },
  ],
  alerts: [
    {
      title: 'Heavy rain expected in Western Province',
      description: 'Reduce irrigation for paddy fields over the next 48 hours.',
      severity: 'medium',
    },
    {
      title: 'High wind advisory',
      description: 'Secure greenhouse covers and shade nets in coastal areas.',
      severity: 'low',
    },
  ],
};

module.exports = { weatherData };
