import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/LoginPage'
import RegisterPage      from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage     from './pages/DashboardPage'
import WeatherPage       from './pages/WeatherPage'
import DiseasePage       from './pages/DiseasePage'
import ChatPage          from './pages/ChatPage'
import MarketPage        from './pages/MarketPage'
import CropRecommendPage from './pages/CropRecommendPage'
import ProfilePage       from './pages/ProfilePage'
import NotFound          from './pages/NotFound'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0d1a0f', fontFamily:"'Sora',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:12, animation:'spin 2s linear infinite', display:'inline-block' }}>🌿</div>
        <div style={{ color:'#66bb6a', fontSize:'.9rem' }}>Loading KrishiAI...</div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<LandingPage />} />
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Private */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/weather"   element={<PrivateRoute><WeatherPage /></PrivateRoute>} />
      <Route path="/disease"   element={<PrivateRoute><DiseasePage /></PrivateRoute>} />
      <Route path="/chat"      element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/market"    element={<PrivateRoute><MarketPage /></PrivateRoute>} />
      <Route path="/crops"     element={<PrivateRoute><CropRecommendPage /></PrivateRoute>} />
      <Route path="/profile"   element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
