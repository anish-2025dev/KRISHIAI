const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ── POST /api/ai/crop-recommend ──────────────────────────────────
router.post('/crop-recommend', optionalAuth, async (req, res) => {
  try {
    const { soil_type, location, water_availability, budget, land_acres, season, current_weather } = req.body;

    const prompt = `You are an expert Indian agricultural advisor. Based on the following farm details, recommend the top 5 best crops.

Farm Details:
- Soil Type: ${soil_type || 'Loamy'}
- Location/State: ${location || 'Rajasthan'}
- Season: ${season || 'Rabi (Winter)'}
- Water Availability: ${water_availability || 'Medium'}
- Budget: Rs.${budget || '20000'}
- Land Area: ${land_acres || '2'} acres
- Current Weather: ${current_weather || 'Moderate'}

Respond ONLY with a valid JSON array (no markdown, no extra text):
[
  {
    "rank": 1,
    "crop": "Wheat",
    "hindi_name": "गेहूं",
    "estimated_profit": "Rs.45,000",
    "profit_per_acre": 22500,
    "market_demand": "High",
    "risk_level": "Low",
    "harvest_days": 120,
    "water_requirement": "Medium",
    "expected_yield": "20 quintals/acre",
    "best_month_to_sow": "October-November",
    "fertilizer_needed": "DAP + Urea",
    "match_score": 95,
    "reason": "Ideal for your soil and season",
    "government_support": "MSP Rs.2,275/quintal"
  }
]`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const crops = JSON.parse(clean);

    res.json({ success: true, crops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/ai/chat ────────────────────────────────────────────
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, history = [], language = 'hindi', user_context = {} } = req.body;

    const systemContext = `You are KrishiAI Assistant — a friendly, expert farming advisor for Indian farmers. 

User Context:
- Location: ${user_context.location || 'India'}
- Crops: ${user_context.crops?.join(', ') || 'General farming'}
- Land: ${user_context.land_acres || 'Unknown'} acres
- Language preference: ${language}

Rules:
1. If language is "hindi", respond in simple Hindi (Devanagari script) mixed with easy English farming terms
2. If language is "english", respond in simple English
3. If language is "hinglish", mix Hindi and English naturally
4. Keep responses SHORT, practical and farmer-friendly
5. Use bullet points for steps
6. Always give actionable advice
7. Mention specific Indian products, brands or government schemes when relevant
8. If asked about prices, give approximate current Indian market rates`;

    const model = getModel();
    const chat  = model.startChat({
      history: history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
    });

    const result = await chat.sendMessage(`${systemContext}\n\nFarmer asks: ${message}`);
    const reply  = result.response.text();

    res.json({ success: true, reply, role: 'assistant' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/ai/soil-analysis ───────────────────────────────────
router.post('/soil-analysis', optionalAuth, async (req, res) => {
  try {
    const { soil_color, texture, location, crops_grown_before } = req.body;

    const prompt = `You are an Indian soil science expert. Analyze this soil description and give recommendations.

Soil Details:
- Color: ${soil_color || 'Brown'}
- Texture: ${texture || 'Loamy'}
- Location: ${location || 'North India'}
- Previous Crops: ${crops_grown_before || 'Wheat'}

Respond ONLY with valid JSON (no markdown):
{
  "soil_type": "Alluvial Soil",
  "quality_score": 7.5,
  "ph_estimate": "6.5-7.0",
  "fertility": "Medium-High",
  "nutrients": {
    "nitrogen": "Medium",
    "phosphorus": "Low",
    "potassium": "High",
    "organic_matter": "Medium"
  },
  "deficiencies": ["Phosphorus", "Zinc"],
  "recommended_fertilizers": ["DAP - 50kg/acre", "Zinc Sulphate - 10kg/acre"],
  "suitable_crops": ["Wheat", "Mustard", "Chickpea"],
  "improvement_tips": ["Add organic compost", "Deep ploughing recommended"],
  "irrigation_advice": "Drip or sprinkler recommended for water conservation"
}`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(text);

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/ai/yield-predict ───────────────────────────────────
router.post('/yield-predict', optionalAuth, async (req, res) => {
  try {
    const { crop, land_acres, soil_type, irrigation, seed_variety, location, season } = req.body;

    const prompt = `As an Indian agriculture expert, predict yield and revenue for this crop.

Details:
- Crop: ${crop || 'Wheat'}
- Land: ${land_acres || 2} acres
- Soil: ${soil_type || 'Loamy'}
- Irrigation: ${irrigation || 'Canal'}
- Seed Variety: ${seed_variety || 'Local'}
- Location: ${location || 'Rajasthan'}
- Season: ${season || 'Rabi'}

Respond ONLY with valid JSON:
{
  "crop": "Wheat",
  "expected_yield_quintals": 40,
  "yield_per_acre": 20,
  "quality_grade": "A",
  "estimated_revenue": "Rs.88,000",
  "estimated_cost": "Rs.32,000",
  "estimated_profit": "Rs.56,000",
  "profit_margin": "63%",
  "msp_price": "Rs.2,275/quintal",
  "market_price": "Rs.2,200/quintal",
  "best_sell_month": "April-May",
  "risk_factors": ["Unseasonal rain", "Aphid attack"],
  "risk_probability": "20%",
  "tips_to_increase_yield": ["Use HD-2967 variety", "Apply second irrigation at jointing stage"]
}`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const prediction = JSON.parse(text);

    res.json({ success: true, prediction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
