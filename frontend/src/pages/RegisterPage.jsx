import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STATES = ['Rajasthan','Punjab','Haryana','Uttar Pradesh','Madhya Pradesh','Maharashtra','Gujarat','Bihar','West Bengal','Andhra Pradesh','Karnataka','Tamil Nadu','Telangana','Odisha','Assam']
const SOILS  = ['Loamy','Sandy','Clay','Silty','Black (Regur)','Red','Alluvial','Laterite']

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [step, setStep]     = useState(1)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name:'', phone:'', password:'', role:'farmer',
    state:'Rajasthan', district:'', land_acres:'', soil_type:'Loamy',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      await register({
        name:       form.name,
        phone:      form.phone,
        password:   form.password,
        role:       form.role,
        location:   { state: form.state, district: form.district },
        land_acres: parseFloat(form.land_acres) || 0,
        soil_type:  form.soil_type,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width:'100%' }

  return (
    <div style={{ minHeight:'100vh', background:'#0d1a0f', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Sora',sans-serif" }}>
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(46,125,50,.2) 0%,transparent 70%)', top:'10%', left:'50%', transform:'translateX(-50%)', filter:'blur(60px)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:460, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link to="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
            <span style={{ fontWeight:800, fontSize:'1.3rem', color:'#e8f5e9' }}>Krishi<span style={{ color:'#66bb6a' }}>AI</span></span>
          </Link>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:8, marginBottom:28 }}>
          {[1,2].map(s => (
            <div key={s} style={{ flex:1, height:4, borderRadius:4, background: step >= s ? '#4caf50' : 'rgba(76,175,80,.15)', transition:'background .3s' }} />
          ))}
        </div>

        <div style={{ background:'linear-gradient(145deg,rgba(27,45,28,.8),rgba(19,32,20,.9))', border:'1px solid rgba(76,175,80,.2)', borderRadius:24, padding:32, backdropFilter:'blur(10px)' }}>
          {error && (
            <div style={{ background:'rgba(229,57,53,.1)', border:'1px solid rgba(229,57,53,.3)', borderRadius:10, padding:'10px 14px', marginBottom:20, color:'#ef5350', fontSize:'.85rem' }}>⚠️ {error}</div>
          )}

          {step === 1 && (
            <>
              <h2 style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:4, color:'#c8e6c9' }}>Create Account 🌱</h2>
              <p style={{ color:'#4a7c4e', fontSize:'.82rem', marginBottom:24 }}>Step 1: Basic Information</p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.06em' }}>FULL NAME</label>
                  <input className="input-field" placeholder="Ramesh Kumar" value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.06em' }}>MOBILE NUMBER</label>
                  <input className="input-field" type="tel" placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.06em' }}>PASSWORD</label>
                  <input className="input-field" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, color:'#66bb6a', marginBottom:8, letterSpacing:'.06em' }}>I AM A</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[['farmer','👨‍🌾 Farmer'],['company','🏢 Company'],['insurance','🛡️ Insurer'],['transport','🚛 Transport']].map(([val, label]) => (
                      <div key={val} onClick={() => set('role', val)} style={{ padding:'10px 12px', borderRadius:10, border:`1.5px solid ${form.role===val?'#4caf50':'rgba(76,175,80,.15)'}`, background: form.role===val?'rgba(76,175,80,.15)':'transparent', cursor:'pointer', fontSize:'.82rem', fontWeight:600, color: form.role===val?'#81c784':'#4a7c4e', textAlign:'center', transition:'all .2s' }}>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" style={{ padding:'14px', marginTop:8 }}
                  onClick={() => { if (form.name && form.phone && form.password) setStep(2); else setError('Please fill all fields') }}
                >
                  Next Step →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:4, color:'#c8e6c9' }}>Farm Details 🌾</h2>
              <p style={{ color:'#4a7c4e', fontSize:'.82rem', marginBottom:24 }}>Step 2: Your farm information</p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.06em' }}>STATE</label>
                  <select className="input-field" value={form.state} onChange={e => set('state', e.target.value)} style={inputStyle}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.06em' }}>DISTRICT / VILLAGE</label>
                  <input className="input-field" placeholder="e.g. Jaipur" value={form.district} onChange={e => set('district', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.06em' }}>LAND AREA (ACRES)</label>
                  <input className="input-field" type="number" placeholder="e.g. 3.5" value={form.land_acres} onChange={e => set('land_acres', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.75rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.06em' }}>SOIL TYPE</label>
                  <select className="input-field" value={form.soil_type} onChange={e => set('soil_type', e.target.value)} style={inputStyle}>
                    {SOILS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:8 }}>
                  <button className="btn-outline" style={{ padding:'13px' }} onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-primary" style={{ padding:'13px' }} onClick={handleSubmit} disabled={loading}>
                    {loading ? '⏳ Creating...' : '✅ Create Account'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontSize:'.82rem', color:'#4a7c4e' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color:'#66bb6a', fontWeight:700, textDecoration:'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  )
}
