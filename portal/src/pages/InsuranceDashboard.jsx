import { useState, useEffect } from 'react'
import PortalLayout from '../components/PortalLayout'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'

const CROPS  = ['Wheat','Rice','Maize','Mustard','Soybean','Cotton','Onion','Potato','Tomato','Chickpea','Bajra','Groundnut','Sugarcane','All Crops']
const STATES = ['All India','Rajasthan','Punjab','Haryana','Uttar Pradesh','Madhya Pradesh','Maharashtra','Gujarat','Bihar','West Bengal','Andhra Pradesh','Karnataka','Tamil Nadu']

export default function InsuranceDashboard() {
  const { user }  = useAuth()
  const [tab,     setTab]     = useState('my-plans')
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState({ type:'', text:'' })

  const [form, setForm] = useState({
    provider_name:         user?.name || '',
    plan_name:             '',
    crop_covered:          [],
    premium_per_acre:      '',
    max_coverage_per_acre: '',
    duration_months:       '12',
    features:              '',
    claim_process:         '',
    contact_phone:         user?.phone || '',
    contact_email:         user?.email || '',
    website_url:           '',
    states_covered:        [],
  })

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const toggleCrop  = (c) => setForm(f => ({ ...f, crop_covered:  f.crop_covered.includes(c)  ? f.crop_covered.filter(x=>x!==c)  : [...f.crop_covered, c] }))
  const toggleState = (s) => setForm(f => ({ ...f, states_covered: f.states_covered.includes(s) ? f.states_covered.filter(x=>x!==s) : [...f.states_covered, s] }))

  useEffect(() => { fetchMine() }, [])

  const fetchMine = async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/portal/insurance/mine')
      setPlans(data.plans || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const submitPlan = async () => {
    if (!form.plan_name || !form.premium_per_acre || !form.max_coverage_per_acre || !form.contact_phone)
      return setMsg({ type:'error', text:'Please fill all required fields' })
    if (form.crop_covered.length === 0)
      return setMsg({ type:'error', text:'Please select at least one crop' })

    setSaving(true)
    setMsg({ type:'', text:'' })
    try {
      await API.post('/portal/insurance', {
        ...form,
        features: form.features.split('\n').filter(f => f.trim()),
        duration_months: parseInt(form.duration_months),
        premium_per_acre: parseFloat(form.premium_per_acre),
        max_coverage_per_acre: parseFloat(form.max_coverage_per_acre),
      })
      setMsg({ type:'success', text:'✅ Plan submitted! It will go live after admin approval.' })
      setTab('my-plans')
      fetchMine()
      setForm(f => ({ ...f, plan_name:'', premium_per_acre:'', max_coverage_per_acre:'', features:'', claim_process:'', crop_covered:[], states_covered:[] }))
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.message || 'Failed to submit plan' })
    } finally {
      setSaving(false)
    }
  }

  const labelStyle = { display:'block', fontSize:'.7rem', fontWeight:700, color:'#10b981', marginBottom:5, letterSpacing:'.07em', textTransform:'uppercase' }

  return (
    <PortalLayout>
      <div style={{ maxWidth:900, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,rgba(5,40,25,.9),rgba(5,20,15,.95))', border:'1px solid rgba(16,185,129,.2)', borderRadius:20, padding:'24px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:'.7rem', color:'#10b981', fontWeight:700, letterSpacing:'.1em', marginBottom:6 }}>INSURANCE PROVIDER DASHBOARD</div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#e2e8f0', marginBottom:4 }}>Welcome, {user?.name} 🛡️</div>
              <div style={{ fontSize:'.82rem', color:'#374151' }}>{user?.phone} · {user?.email || 'No email'}</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ textAlign:'center', padding:'12px 18px', background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', borderRadius:12 }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#34d399' }}>{plans.length}</div>
                <div style={{ fontSize:'.68rem', color:'#374151' }}>Plans Submitted</div>
              </div>
              <div style={{ textAlign:'center', padding:'12px 18px', background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.2)', borderRadius:12 }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#60a5fa' }}>{plans.filter(p => p.is_approved).length}</div>
                <div style={{ fontSize:'.68rem', color:'#374151' }}>Live Plans</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div style={{ background:'rgba(59,130,246,.08)', border:'1px solid rgba(59,130,246,.2)', borderRadius:12, padding:'12px 16px', fontSize:'.82rem', color:'#93c5fd' }}>
          ℹ️ Plans you submit will be reviewed by KrishiAI admin before going live to farmers. This ensures quality and trust. Approved plans are shown on the farmer marketplace.
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8 }}>
          {[['my-plans','🛡️ My Plans'],['add','➕ Add Plan']].map(([val,label]) => (
            <button key={val} onClick={() => { setTab(val); setMsg({type:'',text:''}) }}
              style={{ padding:'10px 20px', borderRadius:100, fontSize:'.82rem', fontWeight:700, border:`1px solid ${tab===val?'#10b981':'rgba(16,185,129,.2)'}`, background:tab===val?'rgba(16,185,129,.15)':'transparent', color:tab===val?'#34d399':'#374151', cursor:'pointer', fontFamily:"'Sora',sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {msg.text && (
          <div style={{ padding:'12px 16px', borderRadius:12, background:msg.type==='success'?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)', border:`1px solid ${msg.type==='success'?'rgba(16,185,129,.3)':'rgba(239,68,68,.3)'}`, color:msg.type==='success'?'#34d399':'#f87171', fontSize:'.85rem' }}>
            {msg.text}
          </div>
        )}

        {/* My Plans */}
        {tab === 'my-plans' && (
          <div style={{ background:'linear-gradient(145deg,rgba(15,23,42,.9),rgba(10,15,30,.95))', border:'1px solid rgba(16,185,129,.15)', borderRadius:16, padding:20 }}>
            <div style={{ fontWeight:700, fontSize:'.92rem', color:'#e2e8f0', marginBottom:14 }}>🛡️ My Insurance Plans</div>
            {loading ? (
              <div style={{ textAlign:'center', padding:40, color:'#374151' }}>⏳ Loading...</div>
            ) : plans.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#374151', fontSize:'.85rem' }}>
                No plans submitted yet.
                <br /><button onClick={() => setTab('add')} style={{ marginTop:10, background:'none', border:'none', color:'#34d399', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontWeight:700 }}>Add your first plan →</button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {plans.map(p => (
                  <div key={p._id} style={{ padding:'18px', background:'rgba(255,255,255,.02)', border:`1px solid ${p.is_approved?'rgba(16,185,129,.2)':'rgba(245,158,11,.2)'}`, borderRadius:12 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                          <span style={{ fontWeight:800, fontSize:'1rem', color:'#e2e8f0' }}>{p.plan_name}</span>
                          <span className={`badge ${p.is_approved?'badge-green':'badge-orange'}`}>
                            {p.is_approved ? '✅ Live' : '⏳ Pending Approval'}
                          </span>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:8, marginBottom:10 }}>
                          {[
                            { label:'Premium',  value:`₹${p.premium_per_acre}/acre/yr` },
                            { label:'Coverage', value:`₹${p.max_coverage_per_acre}/acre` },
                            { label:'Duration', value:`${p.duration_months} months` },
                          ].map(item => (
                            <div key={item.label} style={{ background:'rgba(16,185,129,.06)', border:'1px solid rgba(16,185,129,.12)', borderRadius:8, padding:'8px 10px' }}>
                              <div style={{ fontSize:'.62rem', color:'#374151', fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase' }}>{item.label}</div>
                              <div style={{ fontSize:'.85rem', fontWeight:700, color:'#34d399', marginTop:2 }}>{item.value}</div>
                            </div>
                          ))}
                        </div>
                        {p.crop_covered?.length > 0 && (
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                            {p.crop_covered.map(c => (
                              <span key={c} style={{ fontSize:'.68rem', padding:'2px 8px', borderRadius:100, background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', color:'#34d399' }}>{c}</span>
                            ))}
                          </div>
                        )}
                        {p.features?.length > 0 && (
                          <ul style={{ listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:3 }}>
                            {p.features.slice(0,3).map(f => (
                              <li key={f} style={{ fontSize:'.75rem', color:'#6b7280', display:'flex', gap:6 }}>
                                <span style={{ color:'#10b981', flexShrink:0 }}>✓</span>{f}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end', flexShrink:0 }}>
                        {p.contact_phone && (
                          <a href={`tel:${p.contact_phone}`} style={{ textDecoration:'none' }}>
                            <button className="btn-green" style={{ padding:'7px 14px', fontSize:'.75rem' }}>📞 {p.contact_phone}</button>
                          </a>
                        )}
                        {p.website_url && (
                          <a href={p.website_url} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
                            <button className="btn-outline" style={{ padding:'6px 14px', fontSize:'.73rem' }}>🌐 Website</button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Plan */}
        {tab === 'add' && (
          <div style={{ background:'linear-gradient(145deg,rgba(15,23,42,.9),rgba(10,15,30,.95))', border:'1px solid rgba(16,185,129,.15)', borderRadius:16, padding:24 }}>
            <div style={{ fontWeight:700, fontSize:'.92rem', color:'#e2e8f0', marginBottom:6 }}>➕ Add New Insurance Plan</div>
            <p style={{ fontSize:'.78rem', color:'#374151', marginBottom:20 }}>Fill in your plan details. It will be reviewed by admin before going live.</p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
              <div>
                <label style={labelStyle}>Provider Name *</label>
                <input className="input-field" value={form.provider_name} onChange={e => set('provider_name', e.target.value)} placeholder="Your company name" />
              </div>
              <div>
                <label style={labelStyle}>Plan Name *</label>
                <input className="input-field" value={form.plan_name} onChange={e => set('plan_name', e.target.value)} placeholder="e.g. Kisan Suraksha Plus" />
              </div>
              <div>
                <label style={labelStyle}>Premium per Acre/Year (₹) *</label>
                <input className="input-field" type="number" placeholder="e.g. 500" value={form.premium_per_acre} onChange={e => set('premium_per_acre', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Max Coverage per Acre (₹) *</label>
                <input className="input-field" type="number" placeholder="e.g. 50000" value={form.max_coverage_per_acre} onChange={e => set('max_coverage_per_acre', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Duration (Months)</label>
                <select className="input-field" value={form.duration_months} onChange={e => set('duration_months', e.target.value)}>
                  {['3','6','12','24'].map(m => <option key={m} value={m}>{m} months</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Contact Phone *</label>
                <input className="input-field" type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Contact Email</label>
                <input className="input-field" type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="info@insurance.com" />
              </div>
              <div>
                <label style={labelStyle}>Website URL</label>
                <input className="input-field" value={form.website_url} onChange={e => set('website_url', e.target.value)} placeholder="https://yourinsurance.com" />
              </div>
            </div>

            {/* Crops covered */}
            <div style={{ marginTop:16 }}>
              <label style={labelStyle}>Crops Covered *</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
                {CROPS.map(c => (
                  <div key={c} onClick={() => toggleCrop(c)}
                    style={{ padding:'5px 12px', borderRadius:100, fontSize:'.75rem', fontWeight:600, cursor:'pointer', border:`1px solid ${form.crop_covered.includes(c)?'#10b981':'rgba(16,185,129,.2)'}`, background:form.crop_covered.includes(c)?'rgba(16,185,129,.15)':'transparent', color:form.crop_covered.includes(c)?'#34d399':'#374151', transition:'all .2s' }}>
                    {form.crop_covered.includes(c)?'✓ ':''}{c}
                  </div>
                ))}
              </div>
            </div>

            {/* States covered */}
            <div style={{ marginTop:14 }}>
              <label style={labelStyle}>States Covered</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
                {STATES.map(s => (
                  <div key={s} onClick={() => toggleState(s)}
                    style={{ padding:'4px 10px', borderRadius:100, fontSize:'.72rem', fontWeight:600, cursor:'pointer', border:`1px solid ${form.states_covered.includes(s)?'#10b981':'rgba(16,185,129,.15)'}`, background:form.states_covered.includes(s)?'rgba(16,185,129,.12)':'transparent', color:form.states_covered.includes(s)?'#34d399':'#374151', transition:'all .2s' }}>
                    {form.states_covered.includes(s)?'✓ ':''}{s}
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div style={{ marginTop:14 }}>
              <label style={labelStyle}>Plan Features (one per line)</label>
              <textarea className="input-field" placeholder={"Covers flood & drought damage\nNo paperwork for small claims\n48-hour claim processing\nFree soil testing included"} value={form.features} onChange={e => set('features', e.target.value)} style={{ minHeight:90 }} />
            </div>

            {/* Claim process */}
            <div style={{ marginTop:14 }}>
              <label style={labelStyle}>Claim Process</label>
              <textarea className="input-field" placeholder="Describe how farmers can file a claim..." value={form.claim_process} onChange={e => set('claim_process', e.target.value)} style={{ minHeight:70 }} />
            </div>

            <button className="btn-green" style={{ width:'100%', padding:'14px', fontSize:'1rem', marginTop:16 }} onClick={submitPlan} disabled={saving}>
              {saving ? '⏳ Submitting...' : '🛡️ Submit Plan for Approval'}
            </button>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
