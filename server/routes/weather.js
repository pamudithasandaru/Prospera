const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

// @route   GET /api/weather/current
// @desc    Get current weather for a location
// @access  Public
router.get('/current', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    let url = `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.WEATHER_API_KEY}&units=metric`;
    
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (city) {
      url += `&q=${city},LK`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either coordinates (lat, lon) or city name'
      });
    }

    const response = await axios.get(url);
    const data = response.data;

    res.json({
      success: true,
      data: {
        location: data.name,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        timestamp: new Date(data.dt * 1000)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: error.message
    });
  }
});

// @route   GET /api/weather/forecast
// @desc    Get 10-day weather forecast
// @access  Public
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    let url = `https://api.openweathermap.org/data/2.5/forecast?appid=${process.env.WEATHER_API_KEY}&units=metric&cnt=80`;
    
    if (lat && lon) {
      url += `&lat=${lat}&lon=${lon}`;
    } else if (city) {
      url += `&q=${city},LK`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either coordinates (lat, lon) or city name'
      });
    }

    const response = await axios.get(url);
    const data = response.data;

    // Group by days and get daily summary
    const dailyForecast = [];
    const days = {};

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!days[date]) {
        days[date] = [];
      }
      days[date].push(item);
    });

    Object.keys(days).forEach(date => {
      const dayData = days[date];
      const temps = dayData.map(d => d.main.temp);
      const rainfall = dayData.reduce((sum, d) => sum + (d.rain ? d.rain['3h'] || 0 : 0), 0);

      dailyForecast.push({
        date,
        tempMax: Math.max(...temps),
        tempMin: Math.min(...temps),
        humidity: dayData[0].main.humidity,
        rainfall,
        description: dayData[Math.floor(dayData.length / 2)].weather[0].description,
        icon: dayData[Math.floor(dayData.length / 2)].weather[0].icon,
        windSpeed: dayData[0].wind.speed
      });
    });

    res.json({
      success: true,
      data: {
        location: data.city.name,
        forecast: dailyForecast.slice(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forecast data',
      error: error.message
    });
  }
});

// @route   GET /api/weather/agricultural
// @desc    Get agricultural weather insights
// @access  Public
router.get('/agricultural', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    // Fetch both current and forecast
    let currentUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.WEATHER_API_KEY}&units=metric`;
    let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=${process.env.WEATHER_API_KEY}&units=metric&cnt=40`;
    
    if (lat && lon) {
      currentUrl += `&lat=${lat}&lon=${lon}`;
      forecastUrl += `&lat=${lat}&lon=${lon}`;
    } else if (city) {
      currentUrl += `&q=${city},LK`;
      forecastUrl += `&q=${city},LK`;
    }

    const [currentResponse, forecastResponse] = await Promise.all([
      axios.get(currentUrl),
      axios.get(forecastUrl)
    ]);

    const current = currentResponse.data;
    const forecast = forecastResponse.data;

    // Calculate agricultural insights
    const avgTemp = forecast.list.slice(0, 8).reduce((sum, d) => sum + d.main.temp, 0) / 8;
    const totalRainfall = forecast.list.slice(0, 8).reduce((sum, d) => sum + (d.rain ? d.rain['3h'] || 0 : 0), 0);
    const avgHumidity = forecast.list.slice(0, 8).reduce((sum, d) => sum + d.main.humidity, 0) / 8;

    // Generate recommendations
    const recommendations = [];
    const alerts = [];

    if (totalRainfall > 50) {
      alerts.push({
        type: 'heavy-rain',
        severity: 'warning',
        message: 'Heavy rainfall expected in next 24 hours. Ensure proper drainage.'
      });
    }

    if (avgHumidity > 85) {
      alerts.push({
        type: 'high-humidity',
        severity: 'info',
        message: 'High humidity levels may increase disease risk. Monitor crops closely.'
      });
    }

    if (avgTemp > 32) {
      alerts.push({
        type: 'heat',
        severity: 'warning',
        message: 'High temperatures expected. Increase irrigation frequency.'
      });
      recommendations.push('Irrigate during early morning or late evening');
    }

    if (totalRainfall < 5 && avgHumidity < 60) {
      recommendations.push('Dry conditions expected. Plan irrigation schedule');
    }

    // Best planting dates calculator
    const bestPlantingWindow = {
      start: new Date(),
      end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    };

    res.json({
      success: true,
      data: {
        current: {
          temperature: current.main.temp,
          humidity: current.main.humidity,
          rainfall: current.rain ? current.rain['1h'] || 0 : 0,
          description: current.weather[0].description
        },
        forecast: {
          avgTemperature: avgTemp.toFixed(1),
          totalRainfall: totalRainfall.toFixed(1),
          avgHumidity: avgHumidity.toFixed(1)
        },
        alerts,
        recommendations,
        bestPlantingWindow,
        suitableForPlanting: totalRainfall < 30 && avgTemp >= 20 && avgTemp <= 30
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agricultural weather data',
      error: error.message
    });
  }
});

// @route   GET /api/weather/alerts
// @desc    Get weather alerts and warnings
// @access  Public
router.get('/alerts', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coordinates (lat, lon)'
      });
    }

    // Note: OpenWeather OneCall API provides alerts (may require subscription)
    // For now, return mock data structure
    const alerts = [
      {
        type: 'monsoon',
        severity: 'moderate',
        title: 'Monsoon Season Alert',
        description: 'Southwest monsoon expected to intensify over next 3 days',
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        affectedRegions: ['Western Province', 'Southern Province'],
        recommendations: [
          'Ensure proper drainage in fields',
          'Harvest mature crops before heavy rains',
          'Store fertilizers in dry locations'
        ]
      }
    ];

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
