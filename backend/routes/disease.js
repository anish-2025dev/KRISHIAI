const express    = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { upload } = require('../config/cloudinary');
const DiseaseReport = require('../models/DiseaseReport');
const { protect, optionalAuth } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();
const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/disease/detect
router.post('/detect', optionalAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a crop image' });

    const imageUrl = req.file.path;

    const imageResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64    = Buffer.from(imageResp.data).toString('base64');
    const mimeType  = req.file.mimetype || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert plant pathologist and agricultural disease specialist. Analyze this crop/plant image carefully.

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "crop_name": "Wheat",
  "crop_hindi": "गेहूं",
  "is_healthy": false,
  "disease_name": "Wheat Leaf Rust",
  "disease_hindi": "गेहूं का पत्ती रतुआ",
  "severity": "Medium",
  "severity_score": 6,
  "confidence": 87,
  "affected_parts": ["leaves", "stem"],
  "symptoms": ["Orange-brown pustules on leaves", "Yellowing around pustules"],
  "causes": ["Puccinia triticina fungus", "High humidity"],
  "spread_risk": "High - airborne spores spread quickly",
  "yield_loss_estimate": "15-30% if untreated",
  "organic_treatment": ["Remove and destroy infected leaves", "Neem oil spray 5ml/L water"],
  "chemical_treatment": ["Propiconazole 25% EC 1ml/L water", "Mancozeb 75% WP 2.5g/L"],
  "when_to_spray": "Early morning or evening, 2-3 sprays at 10-day intervals",
  "prevention": ["Use resistant varieties", "Crop rotation"],
  "immediate_action": "Spray fungicide within 48 hours to prevent spread",
  "government_helpline": "Kisan Call Center: 1800-180-1551"
}

If the plant is healthy, set is_healthy: true and disease_name: "No disease detected".
If image is not a plant/crop, set crop_name: "Unknown" and disease_name: "Not a plant image".`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType } },
    ]);

    const text     = result.response.text().replace(/```json|```/g, '').trim();
    const analysis = JSON.parse(text);

    let report = null;
    if (req.user) {
      report = await DiseaseReport.create({
        user:               req.user._id,
        image_url:          imageUrl,
        crop_name:          analysis.crop_name,
        disease_name:       analysis.disease_name,
        severity:           analysis.severity,
        severity_score:     analysis.severity_score,
        symptoms:           analysis.symptoms,
        causes:             analysis.causes,
        organic_treatment:  analysis.organic_treatment,
        chemical_treatment: analysis.chemical_treatment,
        prevention:         analysis.prevention,
        confidence:         analysis.confidence,
        raw_analysis:       text,
      });
    }

    res.json({ success: true, image_url: imageUrl, analysis, report_id: report?._id });
  } catch (err) {
    console.error('Disease detection error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/disease/history
router.get('/history', protect, async (req, res) => {
  try {
    const reports = await DiseaseReport.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
