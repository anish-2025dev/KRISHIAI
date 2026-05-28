import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ phone: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.phone, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0d1a0f', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Sora',sans-serif" }}>
      {/* Glow */}
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(46,125,50,.2) 0%,transparent 70%)', top:'20%', left:'50%', transform:'translateX(-50%)', filter:'blur(60px)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🌿</div>
              <span style={{ fontWeight:800, fontSize:'1.4rem', color:'#e8f5e9' }}>Krishi<span style={{ color:'#66bb6a' }}>AI</span></span>
            </div>
          </Link>
          <p style={{ color:'#4a7c4e', fontSize:'.85rem', marginTop:8 }}>किसान का डिजिटल साथी</p>
        </div>

        {/* Card */}
        <div style={{ background:'linear-gradient(145deg,rgba(27,45,28,.8),rgba(19,32,20,.9))', border:'1px solid rgba(76,175,80,.2)', borderRadius:24, padding:32, backdropFilter:'blur(10px)' }}>
          <h2 style={{ fontSize:'1.4rem', fontWeight:800, marginBottom:4, color:'#c8e6c9' }}>Welcome Back 👋</h2>
          <p style={{ color:'#4a7c4e', fontSize:'.85rem', marginBottom:28 }}>Login to your KrishiAI account</p>

          {error && (
            <div style={{ background:'rgba(229,57,53,.1)', border:'1px solid rgba(229,57,53,.3)', borderRadius:10, padding:'10px 14px', marginBottom:20, color:'#ef5350', fontSize:'.85rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:'.78rem', fontWeight:600, color:'#66bb6a', marginBottom:6, letterSpacing:'.05em' }}>MOBILE NUMBER</label>
              <input
                type="tel"
                className="input-field"
                placeholder="9876543210"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'.78rem', fontWeight:600, color:'#66bb6a', marginBottom:6, letterSpacing:'.05em' }}>PASSWORD</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding:'14px', fontSize:'1rem', marginTop:8 }}
              disabled={loading}
            >
              {loading ? '⏳ Logging in...' : '🌱 Login to KrishiAI'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:16, fontSize:'.82rem', color:'#4a7c4e' }}>
            <Link to="/forgot-password" style={{ color:'#ffa726', fontWeight:600, textDecoration:'none' }}>Forgot Password?</Link>
          </p>
          <p style={{ textAlign:'center', marginTop:10, fontSize:'.85rem', color:'#4a7c4e' }}>
            New farmer?{' '}
            <Link to="/register" style={{ color:'#66bb6a', fontWeight:700, textDecoration:'none' }}>Create Account</Link>
          </p>
        </div>

        {/* Demo hint */}
        <div style={{ textAlign:'center', marginTop:20, padding:'12px', background:'rgba(46,125,50,.08)', border:'1px solid rgba(76,175,80,.12)', borderRadius:12 }}>
          <p style={{ fontSize:'.75rem', color:'#3d6b40' }}>
            📱 Demo: Register with any phone number to explore
          </p>
        </div>
      </div>
    </div>
  )
}
