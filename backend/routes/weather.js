const express = require('express');
const axios   = require('axios');
const router  = express.Router();

const OWM = 'https://api.openweathermap.org/data/2.5';
const KEY  = process.env.OPENWEATHER_API_KEY;

// GET /api/weather/current?lat=26.9&lon=75.8
router.get('/current', async (req, res) => {
  try {
    const { lat = 26.9124, lon = 75.7873, city } = req.query;
    const params = city
      ? { q: city, appid: KEY, units: 'metric', lang: 'en' }
      : { lat, lon, appid: KEY, units: 'metric', lang: 'en' };

    const { data } = await axios.get(`${OWM}/weather`, { params });

    res.json({
      success: true,
      data: {
        city:        data.name,
        country:     data.sys.country,
        temp:        Math.round(data.main.temp),
        feels_like:  Math.round(data.main.feels_like),
        humidity:    data.main.humidity,
        pressure:    data.main.pressure,
        description: data.weather[0].description,
        icon:        data.weather[0].icon,
        main:        data.weather[0].main,
        wind_speed:  data.wind.speed,
        wind_deg:    data.wind.deg,
        visibility:  data.visibility,
        clouds:      data.clouds.all,
        sunrise:     data.sys.sunrise,
        sunset:      data.sys.sunset,
        dt:          data.dt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.response?.data?.message || err.message });
  }
});

// GET /api/weather/forecast?lat=26.9&lon=75.8
router.get('/forecast', async (req, res) => {
  try {
    const { lat = 26.9124, lon = 75.7873, city } = req.query;
    const params = city
      ? { q: city, appid: KEY, units: 'metric', cnt: 40 }
      : { lat, lon, appid: KEY, units: 'metric', cnt: 40 };

    const { data } = await axios.get(`${OWM}/forecast`, { params });

    // Group by day
    const days = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!days[date]) days[date] = [];
      days[date].push(item);
    });

    const forecast = Object.entries(days).slice(0, 7).map(([date, items]) => {
      const temps = items.map(i => i.main.temp);
      const rains = items.map(i => i.rain?.['3h'] || 0);
      return {
        date,
        temp_max:    Math.round(Math.max(...temps)),
        temp_min:    Math.round(Math.min(...temps)),
        temp_avg:    Math.round(temps.reduce((a, b) => a + b) / temps.length),
        humidity:    Math.round(items.reduce((a, b) => a + b.main.humidity, 0) / items.length),
        rain_mm:     parseFloat(rains.reduce((a, b) => a + b, 0).toFixed(1)),
        description: items[Math.floor(items.length / 2)].weather[0].description,
        icon:        items[Math.floor(items.length / 2)].weather[0].icon,
        wind_speed:  items[Math.floor(items.length / 2)].wind.speed,
      };
    });

    res.json({ success: true, city: data.city.name, forecast });
  } catch (err) {
    res.status(500).json({ success: false, message: err.response?.data?.message || err.message });
  }
});

// GET /api/weather/farming-advice?lat=&lon=
router.get('/farming-advice', async (req, res) => {
  try {
    const { lat = 26.9124, lon = 75.7873 } = req.query;
    const { data: w } = await axios.get(`${OWM}/weather`, {
      params: { lat, lon, appid: KEY, units: 'metric' },
    });

    const temp     = w.main.temp;
    const humidity = w.main.humidity;
    const main     = w.weather[0].main;
    const wind     = w.wind.speed;

    const advice = [];

    if (main === 'Rain' || main === 'Drizzle')
      advice.push({ type: 'warning', icon: '🌧️', text: 'Rain expected — avoid spraying pesticides or fertilizers today.' });
    if (temp > 38)
      advice.push({ type: 'danger',  icon: '🌡️', text: `High heat (${Math.round(temp)}°C) — water crops in early morning or evening only.` });
    if (temp < 10)
      advice.push({ type: 'warning', icon: '❄️', text: `Cold temperature (${Math.round(temp)}°C) — protect frost-sensitive seedlings overnight.` });
    if (humidity > 80)
      advice.push({ type: 'warning', icon: '💧', text: 'High humidity — increased risk of fungal disease. Monitor crops closely.' });
    if (wind > 10)
      advice.push({ type: 'info',    icon: '💨', text: `Strong winds (${wind} m/s) — postpone aerial spraying or drone operations.` });
    if (main === 'Clear' && temp >= 20 && temp <= 35)
      advice.push({ type: 'success', icon: '☀️', text: 'Excellent farming conditions — good day for field work, harvesting or sowing.' });
    if (humidity < 30)
      advice.push({ type: 'info',    icon: '🏜️', text: 'Low humidity — increase irrigation frequency, especially for young plants.' });

    if (advice.length === 0)
      advice.push({ type: 'success', icon: '✅', text: 'Weather conditions are moderate — normal farming activities recommended.' });

    res.json({ success: true, weather: { temp: Math.round(temp), humidity, main, wind }, advice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
