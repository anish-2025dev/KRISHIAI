const express = require('express');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const twilio  = require('twilio');

const router = express.Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

// GET /api/profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/profile/update
router.put('/update', protect, async (req, res) => {
  try {
    const allowed = ['name', 'email', 'location', 'land_acres', 'soil_type', 'crops', 'language', 'avatar'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/profile/change-password
router.post('/change-password', protect, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ success: false, message: 'Both passwords required' });

    const user = await User.findById(req.user._id);
    const match = await user.matchPassword(current_password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = new_password;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/profile/forgot-password  (send OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this phone number' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 min expiry

    // Send SMS
    await client.messages.create({
      body: `KrishiAI Password Reset OTP: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
      to: phone.startsWith('+') ? phone : `+91${phone}`,
    });

    res.json({ success: true, message: 'OTP sent to your mobile number' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/profile/reset-password  (verify OTP + set new password)
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, new_password } = req.body;
    if (!phone || !otp || !new_password)
      return res.status(400).json({ success: false, message: 'Phone, OTP and new password required' });

    const stored = otpStore.get(phone);
    if (!stored) return res.status(400).json({ success: false, message: 'OTP not found. Please request again.' });
    if (Date.now() > stored.expires) return res.status(400).json({ success: false, message: 'OTP expired. Please request again.' });
    if (stored.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = new_password;
    await user.save();
    otpStore.delete(phone);

    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/profile/send-alert  (SMS weather/price alert)
router.post('/send-alert', protect, async (req, res) => {
  try {
    const { message, phone } = req.body;
    const toPhone = phone || req.user.phone;
    if (!toPhone) return res.status(400).json({ success: false, message: 'Phone number required' });

    await client.messages.create({
      body: `🌿 KrishiAI Alert: ${message}`,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
      to: toPhone.startsWith('+') ? toPhone : `+91${toPhone}`,
    });

    res.json({ success: true, message: 'Alert sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
