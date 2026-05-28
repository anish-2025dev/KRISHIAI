const express = require('express');
const twilio  = require('twilio');
const { protect } = require('../middleware/auth');

const router = express.Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// POST /api/sms/alert
router.post('/alert', protect, async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message)
      return res.status(400).json({ success: false, message: 'Phone number and message required' });

    const msg = await client.messages.create({
      body:                message,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
      to:                  to.startsWith('+') ? to : `+91${to}`,
    });

    res.json({ success: true, sid: msg.sid, status: msg.status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/sms/weather-alert  (send weather alert to farmer)
router.post('/weather-alert', protect, async (req, res) => {
  try {
    const { phone, weather, advice } = req.body;
    const alertText = advice.map(a => a.text).join(' | ');
    const message   = `🌿 KrishiAI Alert: ${weather.main} ${weather.temp}°C. ${alertText}. - KrishiAI`;

    const msg = await client.messages.create({
      body:                message,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
      to:                  phone.startsWith('+') ? phone : `+91${phone}`,
    });

    res.json({ success: true, sid: msg.sid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
