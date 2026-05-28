const express = require('express');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/farmer/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      farmer: {
        name:       user.name,
        location:   user.location,
        land_acres: user.land_acres,
        soil_type:  user.soil_type,
        crops:      user.crops,
        language:   user.language,
        member_since: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
