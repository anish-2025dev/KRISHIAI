import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STATES = ['Rajasthan','Punjab','Haryana','Uttar Pradesh','Madhya Pradesh','Maharashtra','Gujarat','Bihar','West Bengal','Andhra Pradesh','Karnataka','Tamil Nadu','Telangana','Odisha','Assam','Delhi']

const ROLE_INFO = {
  company:   { icon:'🏢', label:'Company / Buyer',       color:'#3b82f6', desc:'Post crop requirements and connect with farmers' },
  transport: { icon:'🚛', label:'Transport Provider',    color:'#f59e0b', desc:'List your vehicles and get bookings from farmers' },
  insurance: { icon:'🛡️', label:'Insurance Provider',   color:'#10b981', desc:'List your crop insurance plans for farmers' },
}

export default function PortalRegister() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [params]     = useSearchParams()

  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({
    role:          params.get('role') || 'company',
    name:          '',
    phone:         '',
    password:      '',
    email:         '',
    company_name:  '',
    state:         'Rajasthan',
    district:      '',
    gst_number:    '',
    website:       '',
    description:   '',
  })

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      await register({
        name:     form.name || form.company_name,
        phone:    form.phone,
        password: form.password,
        role:     form.role,
        email:    form.email,
        location: { state: form.state, district: form.district },
      })
      if (form.role === 'company')   navigate('/company')
      else if (form.role === 'transport') navigate('/transport')
      else if (form.role === 'insurance') navigate('/insurance')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const info = ROLE_INFO[form.role]

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1a', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Sora',sans-serif" }}>
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:`radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 70%)`, top:'10%', left:'50%', transform:'translateX(-50%)', filter:'blur(60px)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:480, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <Link to="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>🌿</div>
            <span style={{ fontWeight:800, fontSize:'1.2rem', color:'#e2e8f0' }}>Krishi<span style={{ color:'#3b82f6' }}>Portal</span></span>
          </Link>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {[1,2].map(s => (
            <div key={s} style={{ flex:1, height:4, borderRadius:4, background:step>=s?info.color:'rgba(59,130,246,.15)', transition:'background .3s' }} />
          ))}
        </div>

        <div style={{ background:'linear-gradient(145deg,rgba(15,23,42,.9),rgba(10,15,30,.95))', border:`1px solid rgba(59,130,246,.2)`, borderRadius:24, padding:28, backdropFilter:'blur(10px)' }}>

          {error && (
            <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, color:'#f87171', fontSize:'.82rem' }}>⚠️ {error}</div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h2 style={{ fontSize:'1.2rem', fontWeight:800, color:'#e2e8f0', marginBottom:4 }}>Register Your Business</h2>
              <p style={{ color:'#334155', fontSize:'.8rem', marginBottom:20 }}>Step 1: Choose role & basic info</p>

              {/* Role selector */}
              <div style={{ marginBottom:18 }}>
                <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:8, letterSpacing:'.07em' }}>I AM A</label>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {Object.entries(ROLE_INFO).map(([val, info]) => (
                    <div key={val} onClick={() => set('role', val)}
                      style={{ padding:'12px 14px', borderRadius:12, border:`1.5px solid ${form.role===val?info.color:'rgba(59,130,246,.15)'}`, background:form.role===val?`rgba(${val==='company'?'59,130,246':val==='transport'?'245,158,11':'16,185,129'},.1)`:'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:12, transition:'all .2s' }}>
                      <span style={{ fontSize:'1.3rem' }}>{info.icon}</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'.85rem', color:form.role===val?info.color:'#94a3b8' }}>{info.label}</div>
                        <div style={{ fontSize:'.7rem', color:'#334155' }}>{info.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em' }}>
                    {form.role === 'company' ? 'COMPANY NAME' : form.role === 'transport' ? 'YOUR FULL NAME' : 'PROVIDER NAME'}
                  </label>
                  <input className="input-field" placeholder={form.role==='company'?'e.g. ABC Agro Foods Pvt Ltd':'Your name'} value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em' }}>MOBILE NUMBER</label>
                  <input className="input-field" type="tel" placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em' }}>PASSWORD</label>
                  <input className="input-field" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                </div>
                <button className="btn-primary" style={{ padding:'13px', marginTop:4 }}
                  onClick={() => { if (form.name && form.phone && form.password) { setError(''); setStep(2) } else setError('Please fill all fields') }}>
                  Next →
                </button>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h2 style={{ fontSize:'1.2rem', fontWeight:800, color:'#e2e8f0', marginBottom:4 }}>{info.icon} Business Details</h2>
              <p style={{ color:'#334155', fontSize:'.8rem', marginBottom:20 }}>Step 2: Tell us about your business</p>

              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em' }}>EMAIL (OPTIONAL)</label>
                  <input className="input-field" type="email" placeholder="business@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em' }}>STATE</label>
                  <select className="input-field" value={form.state} onChange={e => set('state', e.target.value)}>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em' }}>DISTRICT / CITY</label>
                  <input className="input-field" placeholder="e.g. Jaipur" value={form.district} onChange={e => set('district', e.target.value)} />
                </div>
                {form.role === 'company' && (
                  <div>
                    <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em' }}>GST NUMBER (OPTIONAL)</label>
                    <input className="input-field" placeholder="22AAAAA0000A1Z5" value={form.gst_number} onChange={e => set('gst_number', e.target.value)} />
                  </div>
                )}
                <div>
                  <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em' }}>WEBSITE (OPTIONAL)</label>
                  <input className="input-field" placeholder="https://yourwebsite.com" value={form.website} onChange={e => set('website', e.target.value)} />
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:8 }}>
                  <button className="btn-outline" style={{ padding:'12px' }} onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-primary" style={{ padding:'12px' }} onClick={handleSubmit} disabled={loading}>
                    {loading ? '⏳ Creating...' : '✅ Create Account'}
                  </button>
                </div>

                {form.role === 'insurance' && (
                  <div style={{ padding:'10px 14px', background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)', borderRadius:10, fontSize:'.75rem', color:'#6ee7b7' }}>
                    ℹ️ Insurance plans you add will be reviewed by admin before going live to farmers.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign:'center', marginTop:16, fontSize:'.8rem', color:'#334155' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color:'#60a5fa', fontWeight:700, textDecoration:'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
