import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import PortalLanding      from './pages/PortalLanding'
import PortalLogin        from './pages/PortalLogin'
import PortalRegister     from './pages/PortalRegister'
import CompanyDashboard   from './pages/CompanyDashboard'
import TransportDashboard from './pages/TransportDashboard'
import InsuranceDashboard from './pages/InsuranceDashboard'
import AdminDashboard     from './pages/AdminDashboard'
import NotFound           from './pages/NotFound'

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0a0f1a', fontFamily:"'Sora',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:12, animation:'spin 2s linear infinite', display:'inline-block' }}>🌿</div>
        <div style={{ color:'#60a5fa', fontSize:'.9rem' }}>Loading KrishiAI Portal...</div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  // Redirect to role-specific dashboard after login
  const getDashboard = () => {
    if (!user) return '/login'
    if (user.role === 'company')   return '/company'
    if (user.role === 'transport') return '/transport'
    if (user.role === 'insurance') return '/insurance'
    if (user.role === 'admin')     return '/admin'
    return '/login'
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<PortalLanding />} />
      <Route path="/login"    element={<PortalLogin />} />
      <Route path="/register" element={<PortalRegister />} />

      {/* Auto redirect /dashboard to role page */}
      <Route path="/dashboard" element={<Navigate to={getDashboard()} replace />} />

      {/* Role-specific dashboards */}
      <Route path="/company"   element={<PrivateRoute roles={['company','admin']}  ><CompanyDashboard /></PrivateRoute>} />
      <Route path="/transport" element={<PrivateRoute roles={['transport','admin']} ><TransportDashboard /></PrivateRoute>} />
      <Route path="/insurance" element={<PrivateRoute roles={['insurance','admin']} ><InsuranceDashboard /></PrivateRoute>} />
      <Route path="/admin"     element={<PrivateRoute roles={['admin']}             ><AdminDashboard /></PrivateRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
