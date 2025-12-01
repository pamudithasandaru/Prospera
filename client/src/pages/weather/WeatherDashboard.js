import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  WbSunny,
  Cloud,
  Opacity,
  Air,
  Thermostat,
  Visibility,
  Compress,
  WaterDrop,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const WeatherDashboard = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const response = await api.get('/weather/current', {
        params: { location: 'Colombo' } // Default location, should come from user profile
      });
      setCurrentWeather(response.data.data?.current || null);
      setForecast(response.data.data?.forecast || []);
      setAlerts(response.data.data?.alerts || []);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <WbSunny sx={{ fontSize: 80, color: '#FDB813' }} />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud sx={{ fontSize: 80, color: '#B0BEC5' }} />;
      case 'rainy':
      case 'rain':
        return <Opacity sx={{ fontSize: 80, color: '#2196F3' }} />;
      default:
        return <WbSunny sx={{ fontSize: 80, color: '#FDB813' }} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Weather Portal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time weather updates and agricultural forecasts
        </Typography>
      </Box>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <Box mb={3}>
          {alerts.map((alert, index) => (
            <Alert key={index} severity={getSeverityColor(alert.severity)} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {alert.title}
              </Typography>
              <Typography variant="body2">
                {alert.description}
              </Typography>
            </Alert>
          ))}
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
              Colombo, Sri Lanka
            </Typography>

            <Box textAlign="center" my={3}>
              {getWeatherIcon(currentWeather?.condition)}
              <Typography variant="h2" fontWeight="bold" mt={2}>
                {currentWeather?.temperature || 28}°C
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {currentWeather?.condition || 'Partly Cloudy'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Opacity color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Humidity
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {currentWeather?.humidity || 75}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Air color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Wind Speed
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {currentWeather?.windSpeed || 15} km/h
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <WaterDrop color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Rainfall
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {currentWeather?.rainfall || 0} mm
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Compress color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Pressure
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {currentWeather?.pressure || 1013} hPa
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 10-Day Forecast */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              10-Day Forecast
            </Typography>

            <Grid container spacing={2} mt={1}>
              {(forecast.length > 0 ? forecast : [
                { date: '2024-01-16', temp: { max: 32, min: 24 }, condition: 'Sunny', rainfall: 0 },
                { date: '2024-01-17', temp: { max: 31, min: 25 }, condition: 'Partly Cloudy', rainfall: 2 },
                { date: '2024-01-18', temp: { max: 30, min: 24 }, condition: 'Cloudy', rainfall: 5 },
                { date: '2024-01-19', temp: { max: 29, min: 23 }, condition: 'Rainy', rainfall: 15 },
                { date: '2024-01-20', temp: { max: 28, min: 23 }, condition: 'Rainy', rainfall: 20 },
                { date: '2024-01-21', temp: { max: 30, min: 24 }, condition: 'Partly Cloudy', rainfall: 3 },
                { date: '2024-01-22', temp: { max: 31, min: 25 }, condition: 'Sunny', rainfall: 0 },
              ]).map((day, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" my={1}>
                        {getWeatherIcon(day.condition)}
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {day.temp?.max || 30}° / {day.temp?.min || 24}°
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {day.condition}
                      </Typography>
                      {day.rainfall > 0 && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                          <WaterDrop fontSize="small" color="primary" />
                          <Typography variant="caption">
                            {day.rainfall}mm
                          </Typography>
                        </Box>
                      )}
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
              <LineChart data={forecast.length > 0 ? forecast : [
                { date: 'Mon', temp: 28 },
                { date: 'Tue', temp: 30 },
                { date: 'Wed', temp: 29 },
                { date: 'Thu', temp: 27 },
                { date: 'Fri', temp: 26 },
                { date: 'Sat', temp: 28 },
                { date: 'Sun', temp: 30 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#2e7d32" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Agricultural Insights */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Agricultural Insights
            </Typography>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <Card variant="outlined" sx={{ bgcolor: 'success.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Planting Conditions
                  </Typography>
                  <Typography variant="body2">
                    Excellent - Good weather for rice planting
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ bgcolor: 'warning.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Irrigation Advisory
                  </Typography>
                  <Typography variant="body2">
                    Moderate - Rainfall expected in 2 days
                  </Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ bgcolor: 'info.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Pest Risk
                  </Typography>
                  <Typography variant="body2">
                    Low - Dry conditions reduce pest activity
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WeatherDashboard;
