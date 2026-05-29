# 🌿 KrishiAI — AI-Powered Smart Agriculture Ecosystem

> India's most complete AI farming platform — real Gemini AI, live weather, disease detection, crop recommendations, market prices & more.

![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)

---

## 🚀 Quick Start (Local)

### 1. Clone & Install

```bash
git clone https://github.com/anish-2025dev/krishi-ai.git
cd krishi-ai

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Environment Variables

Both `.env` files are pre-configured. Just verify them:

- `backend/.env` — MongoDB, Gemini, Twilio, Cloudinary, OpenWeatherMap
- `frontend/.env` — API base URL, Gemini key, Geoapify

### 3. Run

Open two terminals:

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Visit: **http://localhost:3000**

---

## 📁 Project Structure

```
krishi-ai/
├── backend/
│   ├── config/
│   │   └── cloudinary.js        # Cloudinary + Multer setup
│   ├── middleware/
│   │   └── auth.js              # JWT auth middleware
│   ├── models/
│   │   ├── User.js              # User model (farmer/company/insurer)
│   │   └── DiseaseReport.js     # Disease detection history
│   ├── routes/
│   │   ├── auth.js              # Register, Login, Me, Update
│   │   ├── weather.js           # Live weather + farming advice
│   │   ├── ai.js                # Crop recommend, Chat, Soil, Yield
│   │   ├── disease.js           # Gemini Vision disease detection
│   │   ├── market.js            # Prices, AI prediction, Mandi finder
│   │   ├── farmer.js            # Farmer dashboard data
│   │   └── sms.js               # Twilio SMS alerts
│   └── server.js                # Express app entry
│
├── frontend/
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx  # JWT auth state
│       ├── utils/
│       │   └── api.js           # Axios instance with auth headers
│       ├── components/
│       │   └── Layout.jsx       # Sidebar + topbar layout
│       └── pages/
│           ├── LandingPage.jsx  # Public landing page
│           ├── LoginPage.jsx    # Phone + password login
│           ├── RegisterPage.jsx # 2-step registration
│           ├── DashboardPage.jsx# Live weather + prices + alerts
│           ├── WeatherPage.jsx  # 7-day forecast + farming advice
│           ├── DiseasePage.jsx  # Gemini Vision disease detection
│           ├── ChatPage.jsx     # AI chat (Hindi/English/Hinglish)
│           ├── MarketPage.jsx   # Live prices + AI prediction + mandis
│           └── CropRecommendPage.jsx # AI crop + yield prediction
│
└── README.md
```

---

## ✅ What's Fully Working

| Feature | Status | Powered By |
|---|---|---|
| User Registration & Login | ✅ Live | JWT + MongoDB |
| Live Weather (current + 7-day) | ✅ Live | OpenWeatherMap |
| AI Farming Alerts | ✅ Live | OpenWeatherMap + Logic |
| Crop Recommendation (top 5) | ✅ Live | Gemini 1.5 Flash |
| Yield & Profit Prediction | ✅ Live | Gemini 1.5 Flash |
| Soil Analysis | ✅ Live | Gemini 1.5 Flash |
| AI Chat (Hindi/Hinglish/English) | ✅ Live | Gemini 1.5 Flash |
| Crop Disease Detection | ✅ Live | Gemini Vision |
| Image Upload | ✅ Live | Cloudinary |
| Live Mandi Prices | ✅ Live | Real data + logic |
| AI Price Prediction | ✅ Live | Gemini 1.5 Flash |
| Nearby Mandi Finder | ✅ Live | Geoapify API |
| Disease Report History | ✅ Live | MongoDB |
| SMS Alerts | ✅ Live | Twilio |
| Role-Based Auth | ✅ Live | JWT middleware |

---

## 🌐 Deploy to GitHub + Vercel

### Push to GitHub

```bash
cd krishi-ai
git init
git add .
git commit -m "Initial commit — KrishiAI full stack"
git remote add origin https://github.com/YOUR_USERNAME/krishi-ai.git
git push -u origin main
```

### Deploy Backend (Render — Free)

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. **Root directory:** `backend`
4. **Build command:** `npm install`
5. **Start command:** `npm start`
6. Add all environment variables from `backend/.env`
7. Copy the deployed URL e.g. `https://krishiai-api.onrender.com`

### Deploy Frontend (Vercel — Free)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your GitHub repo
3. **Root directory:** `frontend`
4. **Framework:** Vite
5. Add environment variable:
   ```
   VITE_API_BASE_URL = https://krishiai-api.onrender.com/api
   ```
6. Deploy ✅

---

## 🔐 API Endpoints

```
POST   /api/auth/register          Register farmer/company
POST   /api/auth/login             Login
GET    /api/auth/me                Get current user (protected)

GET    /api/weather/current        Live weather by city or lat/lon
GET    /api/weather/forecast       7-day forecast
GET    /api/weather/farming-advice AI farming advice based on weather

POST   /api/ai/crop-recommend      Top 5 crop recommendations
POST   /api/ai/chat                AI chatbot (Hindi/English/Hinglish)
POST   /api/ai/soil-analysis       Soil analysis from description
POST   /api/ai/yield-predict       Yield & revenue prediction

POST   /api/disease/detect         Upload image → AI disease detection
GET    /api/disease/history        User's disease report history

GET    /api/market/prices          Live mandi prices by state
GET    /api/market/predict         AI price prediction for crop
GET    /api/market/mandis          Nearby agricultural markets

POST   /api/sms/alert              Send SMS alert via Twilio
```

---

## 📱 Pages

| Route | Page | Auth |
|---|---|---|
| `/` | Landing Page | Public |
| `/login` | Login | Public |
| `/register` | 2-step Registration | Public |
| `/dashboard` | Live dashboard | 🔒 Private |
| `/weather` | Weather + Forecast | 🔒 Private |
| `/crops` | AI Crop Recommendation | 🔒 Private |
| `/disease` | Disease Detection | 🔒 Private |
| `/market` | Market Prices + Mandis | 🔒 Private |
| `/chat` | AI Chatbot | 🔒 Private |

---

## 🛠️ Tech Stack

**Frontend:** React 18 · Vite · Tailwind CSS · React Router · Axios

**Backend:** Node.js · Express · MongoDB Atlas · Mongoose · JWT · Multer

**AI:** Google Gemini 1.5 Flash · Gemini Vision API

**Services:** OpenWeatherMap · Cloudinary · Twilio · Geoapify

**Deploy:** Vercel (frontend) · Render (backend) · MongoDB Atlas (DB)

---

## 📄 License

MIT — free to use, modify and deploy.

---

<div align="center">
  <p>🌿 <strong>KrishiAI</strong> — Built for 140 million Indian farmers</p>
</div>
