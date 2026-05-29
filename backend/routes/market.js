const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const BASE_PRICES = {
  wheat: { min: 2100, max: 2400, unit: 'quintal', msp: 2275 },
  rice: { min: 2100, max: 2500, unit: 'quintal', msp: 2183 },
  maize: { min: 1800, max: 2200, unit: 'quintal', msp: 1962 },
  mustard: { min: 5000, max: 5800, unit: 'quintal', msp: 5650 },
  soybean: { min: 4200, max: 4800, unit: 'quintal', msp: 4600 },
  cotton: { min: 6200, max: 7100, unit: 'quintal', msp: 7020 },
  onion: { min: 800, max: 2500, unit: 'quintal', msp: null },
  potato: { min: 600, max: 1500, unit: 'quintal', msp: null },
  tomato: { min: 500, max: 3000, unit: 'quintal', msp: null },
  chickpea: { min: 5000, max: 5700, unit: 'quintal', msp: 5440 },
};

// GET /api/market/prices?state=Rajasthan&commodity=Wheat
router.get('/prices', async (req, res) => {
  try {
    const { state = 'Rajasthan', commodity = '' } = req.query;

    const AGKEY = process.env.AGMARKNET_API_KEY;
    const AGRID = process.env.AGMARKNET_RESOURCE_ID;

    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const formatDate = (d) =>
        `${String(d.getDate()).padStart(2, '0')}/${String(
          d.getMonth() + 1
        ).padStart(2, '0')}/${d.getFullYear()}`;

      const params = {
        'api-key': AGKEY,
        format: 'json',
        limit: 100,
        filters: JSON.stringify({
          state,
          ...(commodity ? { commodity } : {}),
        }),
        'api-index': 'arrival_date',
        from: formatDate(yesterday),
        to: formatDate(today),
      };

      const { data } = await axios.get(
        `https://api.data.gov.in/resource/${AGRID}`,
        {
          params,
          timeout: 8000,
        }
      );

      if (data.records && data.records.length > 0) {
        const grouped = {};

        data.records.forEach((r) => {
          const key = r.commodity?.toLowerCase();
          if (!key) return;

          if (
            !grouped[key] ||
            parseIndianDate(r.arrival_date) >
              parseIndianDate(grouped[key].arrival_date)
          ) {
            grouped[key] = r;
          }
        });

        const prices = Object.values(grouped).map((r) => {
          const modal = Number(r.modal_price) || 0;
          const minP = Number(r.min_price) || 0;
          const maxP = Number(r.max_price) || 0;

          const base =
            BASE_PRICES[r.commodity?.toLowerCase()];

          const change = parseFloat(
            ((Math.random() - 0.45) * 6).toFixed(1)
          );

          return {
            crop: r.commodity,
            crop_hindi: getCropHindi(
              r.commodity?.toLowerCase()
            ),
            variety: r.variety || 'General',
            market: r.market || r.district,
            district: r.district,
            current_price:
              modal ||
              Math.round((minP + maxP) / 2),
            min_price: minP,
            max_price: maxP,
            msp: base?.msp || null,
            unit: 'quintal',
            change_pct: change,
            trend: change > 0 ? 'up' : 'down',
            arrival_date: r.arrival_date,
            state: r.state,
            source: 'Agmarknet (Government)',
            last_updated: new Date().toISOString(),
          };
        });

        return res.json({
          success: true,
          state,
          source: 'live',
          prices,
        });
      }
    } catch (apiErr) {
      console.log(
        'Agmarknet API failed, using base prices:',
        apiErr.message
      );
    }

    const prices = Object.entries(BASE_PRICES).map(
      ([crop, data]) => {
        const variance =
          (Math.random() - 0.5) * 200;

        const current = Math.round(
          (data.min + data.max) / 2 + variance
        );

        const change = parseFloat(
          ((Math.random() - 0.45) * 8).toFixed(1)
        );

        return {
          crop:
            crop.charAt(0).toUpperCase() +
            crop.slice(1),
          crop_hindi: getCropHindi(crop),
          variety: 'General',
          current_price: current,
          min_price: data.min,
          max_price: data.max,
          msp: data.msp,
          unit: 'quintal',
          change_pct: change,
          trend: change > 0 ? 'up' : 'down',
          state,
          source: 'estimated',
          last_updated: new Date().toISOString(),
        };
      }
    );

    res.json({
      success: true,
      state,
      source: 'estimated',
      prices,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /api/market/predict?crop=wheat&state=Rajasthan
router.get('/predict', async (req, res) => {
  try {
    const {
      crop = 'wheat',
      state = 'Rajasthan',
      days = '7',
    } = req.query;

    const forecastDays =
      parseInt(days, 10) || 7;

    const base =
      BASE_PRICES[crop.toLowerCase()] || {
        min: 1800,
        max: 2200,
        msp: null,
      };

    const prompt = `
You are an Indian agricultural market analyst.

Predict ${crop} prices for next ${forecastDays} days in ${state}.

Current base price: Rs.${
      (base.min + base.max) / 2
    }/quintal

MSP: Rs.${base.msp || 'N/A'}/quintal

Consider:
- seasonal trends
- festival demand
- harvest timing
- monsoon impact
- export demand

Respond ONLY with valid JSON.
`;

    const model =
      genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });

    const result =
      await model.generateContent(prompt);

    const text = result.response
      .text()
      .replace(/```json|```/g, '')
      .trim();

    let prediction;

    try {
      prediction = JSON.parse(text);
    } catch {
      return res.status(500).json({
        success: false,
        message:
          'Invalid AI prediction response',
      });
    }

    res.json({
      success: true,
      prediction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /api/market/mandis?lat=26.9&lon=75.8
router.get('/mandis', async (req, res) => {
  try {
    const {
      lat = 26.9124,
      lon = 75.7873,
    } = req.query;

    const GEOKEY =
      process.env.GEOAPIFY_API_KEY;

    const { data } = await axios.get(
      'https://api.geoapify.com/v2/places',
      {
        params: {
          categories:
            'commercial.market,commercial.marketplace,commercial.grocery',
          filter: `circle:${lon},${lat},50000`,
          limit: 15,
          apiKey: GEOKEY,
        },
        timeout: 8000,
      }
    );

    let mandis = (data.features || []).map(
      (f, i) => ({
        id:
          f.properties.place_id ||
          `mandi_${i}`,
        name:
          f.properties.name ||
          `Local Mandi ${i + 1}`,
        address:
          f.properties.formatted ||
          'Address not available',
        distance: f.properties.distance
          ? `${(
              f.properties.distance /
              1000
            ).toFixed(1)} km`
          : 'Nearby',
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        type: 'Agricultural Market',
        timing: '6:00 AM - 2:00 PM',
        crops: [
          'Wheat',
          'Vegetables',
          'Fruits',
        ],
      })
    );

    if (mandis.length === 0) {
      mandis = [
        {
          id: 'm1',
          name: 'Jaipur Sabzi Mandi',
          address: 'Muhana, Jaipur',
          distance: '5 km',
          lat: 26.85,
          lng: 75.82,
          timing: '5AM-1PM',
          crops: [
            'Vegetables',
            'Fruits',
          ],
        },
        {
          id: 'm2',
          name: 'Chomu Grain Market',
          address: 'Chomu, Jaipur',
          distance: '28 km',
          lat: 27.15,
          lng: 75.72,
          timing: '7AM-12PM',
          crops: [
            'Wheat',
            'Mustard',
            'Bajra',
          ],
        },
      ];
    }

    res.json({
      success: true,
      mandis,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET /api/market/search?state=Rajasthan&commodity=Wheat&district=Jaipur
router.get('/search', async (req, res) => {
  try {
    const {
      state,
      commodity,
      district,
      limit = 20,
    } = req.query;

    const AGKEY =
      process.env.AGMARKNET_API_KEY;

    const AGRID =
      process.env.AGMARKNET_RESOURCE_ID;

    const filters = {};

    if (state) filters.state = state;
    if (commodity)
      filters.commodity = commodity;
    if (district)
      filters.district = district;

    const today2 = new Date();
    const week = new Date(today2);

    week.setDate(week.getDate() - 7);

    const fmt = (d) =>
      `${String(d.getDate()).padStart(
        2,
        '0'
      )}/${String(
        d.getMonth() + 1
      ).padStart(2, '0')}/${d.getFullYear()}`;

    const { data } = await axios.get(
      `https://api.data.gov.in/resource/${AGRID}`,
      {
        params: {
          'api-key': AGKEY,
          format: 'json',
          limit: parseInt(limit, 10),
          filters: JSON.stringify(filters),
          from: fmt(week),
          to: fmt(today2),
        },
        timeout: 10000,
      }
    );

    res.json({
      success: true,
      total: data.total,
      records: data.records || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

function parseIndianDate(dateStr) {
  if (!dateStr) return new Date(0);

  const [day, month, year] =
    dateStr.split('/');

  return new Date(year, month - 1, day);
}

function getCropHindi(crop) {
  const map = {
    wheat: 'गेहूं',
    rice: 'चावल',
    maize: 'मक्का',
    mustard: 'सरसों',
    soybean: 'सोयाबीन',
    cotton: 'कपास',
    onion: 'प्याज',
    potato: 'आलू',
    tomato: 'टमाटर',
    chickpea: 'चना',
    bajra: 'बाजरा',
    jowar: 'ज्वार',
    groundnut: 'मूंगफली',
    sugarcane: 'गन्ना',
    turmeric: 'हल्दी',
  };

  return (
    map[crop?.toLowerCase()] || crop
  );
}

module.exports = router;
