import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PortalLogin() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ phone:'', password:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await login(form.phone, form.password)
      if (user.role === 'company')   navigate('/company')
      else if (user.role === 'transport') navigate('/transport')
      else if (user.role === 'insurance') navigate('/insurance')
      else if (user.role === 'admin')     navigate('/admin')
      else navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1a', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Sora',sans-serif" }}>
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,.2) 0%,transparent 70%)', top:'20%', left:'50%', transform:'translateX(-50%)', filter:'blur(60px)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link to="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
            <span style={{ fontWeight:800, fontSize:'1.3rem', color:'#e2e8f0' }}>Krishi<span style={{ color:'#3b82f6' }}>Portal</span></span>
          </Link>
          <p style={{ color:'#334155', fontSize:'.82rem', marginTop:8 }}>Business Portal — Companies, Transport & Insurance</p>
        </div>

        <div style={{ background:'linear-gradient(145deg,rgba(15,23,42,.9),rgba(10,15,30,.95))', border:'1px solid rgba(59,130,246,.2)', borderRadius:24, padding:32, backdropFilter:'blur(10px)' }}>
          <h2 style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:4, color:'#e2e8f0' }}>Welcome Back 👋</h2>
          <p style={{ color:'#334155', fontSize:'.82rem', marginBottom:24 }}>Sign in to your business account</p>

          {error && (
            <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:10, padding:'10px 14px', marginBottom:18, color:'#f87171', fontSize:'.82rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em' }}>MOBILE NUMBER</label>
              <input className="input-field" type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({...f, phone:e.target.value}))} required />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em' }}>PASSWORD</label>
              <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({...f, password:e.target.value}))} required />
            </div>
            <button type="submit" className="btn-primary" style={{ padding:'14px', fontSize:'1rem', marginTop:8 }} disabled={loading}>
              {loading ? '⏳ Signing in...' : '🏢 Sign In to Portal'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:18, fontSize:'.82rem', color:'#334155' }}>
            No account?{' '}
            <Link to="/register" style={{ color:'#60a5fa', fontWeight:700, textDecoration:'none' }}>Register your business</Link>
          </p>
        </div>

        <div style={{ textAlign:'center', marginTop:16 }}>
          <a href="https://krishiai-mocha.vercel.app" style={{ fontSize:'.78rem', color:'#4ade80', textDecoration:'none', fontWeight:600 }}>
            🌾 Are you a farmer? Use the Farmer App →
          </a>
        </div>
      </div>
    </div>
  )
}
