import { useState, useEffect } from 'react'
import PortalLayout from '../components/PortalLayout'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'

const CROPS = ['Wheat','Rice','Maize','Mustard','Soybean','Cotton','Onion','Potato','Tomato','Chickpea','Bajra','Groundnut','Sugarcane','Turmeric']
const STATES = ['Rajasthan','Punjab','Haryana','Uttar Pradesh','Madhya Pradesh','Maharashtra','Gujarat','Bihar','West Bengal','Andhra Pradesh','Karnataka','Tamil Nadu']
const GRADES = ['A+','A','B','C','Any Grade']

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [tab,  setTab]  = useState('browse')
  const [reqs, setReqs] = useState([])
  const [mine, setMine] = useState([])
  const [loading, setLoading]   = useState(false)
  const [posting, setPosting]   = useState(false)
  const [msg, setMsg]           = useState({ type:'', text:'' })
  const [filterCrop, setFilterCrop]   = useState('')
  const [filterState, setFilterState] = useState('')

  const [form, setForm] = useState({
    company_name:  user?.name || '',
    company_phone: user?.phone || '',
    crop:          'Wheat',
    quantity_tons: '',
    price_per_ton: '',
    quality_grade: 'A',
    location:      '',
    state:         'Rajasthan',
    deadline:      '',
    description:   '',
    contact_email: user?.email || '',
  })

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    fetchBrowse()
  }, [filterCrop, filterState])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [b, m] = await Promise.all([
        API.get('/portal/requirements'),
        API.get('/portal/requirements/mine'),
      ])
      setReqs(b.data.requirements || [])
      setMine(m.data.requirements || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchBrowse = async () => {
    try {
      const params = new URLSearchParams()
      if (filterCrop)  params.append('crop', filterCrop)
      if (filterState) params.append('state', filterState)
      const { data } = await API.get(`/portal/requirements?${params}`)
      setReqs(data.requirements || [])
    } catch (e) { console.error(e) }
  }

  const postRequirement = async () => {
    if (!form.crop || !form.quantity_tons || !form.price_per_ton || !form.location)
      return setMsg({ type:'error', text:'Please fill all required fields' })
    setPosting(true)
    setMsg({ type:'', text:'' })
    try {
      await API.post('/portal/requirements', form)
      setMsg({ type:'success', text:'✅ Requirement posted! Farmers can now apply.' })
      setTab('mine')
      fetchAll()
      setForm(f => ({ ...f, quantity_tons:'', price_per_ton:'', location:'', description:'', deadline:'' }))
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.message || 'Failed to post requirement' })
    } finally {
      setPosting(false)
    }
  }

  const deleteReq = async (id) => {
    if (!confirm('Delete this requirement?')) return
    try {
      await API.delete(`/portal/requirements/${id}`)
      fetchAll()
    } catch (e) { alert('Failed to delete') }
  }

  const Card = ({ children, style={} }) => (
    <div className="card" style={{ padding:20, ...style }}>{children}</div>
  )

  const labelStyle = { display:'block', fontSize:'.7rem', fontWeight:700, color:'#3b82f6', marginBottom:5, letterSpacing:'.07em', textTransform:'uppercase' }

  return (
    <PortalLayout>
      <div style={{ maxWidth:900, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Header */}
        <Card style={{ background:'linear-gradient(135deg,rgba(15,40,80,.9),rgba(10,20,50,.95))' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:'.7rem', color:'#3b82f6', fontWeight:700, letterSpacing:'.1em', marginBottom:6 }}>COMPANY DASHBOARD</div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#e2e8f0', marginBottom:4 }}>Welcome, {user?.name} 🏢</div>
              <div style={{ fontSize:'.82rem', color:'#334155' }}>{user?.location?.state || 'India'} · {user?.email || user?.phone}</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ textAlign:'center', padding:'12px 18px', background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.2)', borderRadius:12 }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#60a5fa' }}>{mine.length}</div>
                <div style={{ fontSize:'.68rem', color:'#334155' }}>Requirements Posted</div>
              </div>
              <div style={{ textAlign:'center', padding:'12px 18px', background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', borderRadius:12 }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#34d399' }}>{mine.reduce((a,r) => a + (r.applicants?.length||0), 0)}</div>
                <div style={{ fontSize:'.68rem', color:'#334155' }}>Total Applicants</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[['browse','🌾 Browse Market'],['post','➕ Post Requirement'],['mine','📋 My Requirements']].map(([val,label]) => (
            <button key={val} onClick={() => { setTab(val); setMsg({type:'',text:''}) }}
              style={{ padding:'10px 20px', borderRadius:100, fontSize:'.82rem', fontWeight:700, border:`1px solid ${tab===val?'#3b82f6':'rgba(59,130,246,.2)'}`, background:tab===val?'rgba(59,130,246,.15)':'transparent', color:tab===val?'#60a5fa':'#334155', cursor:'pointer', fontFamily:"'Sora',sans-serif", transition:'all .2s' }}>
              {label}
            </button>
          ))}
        </div>

        {msg.text && (
          <div style={{ padding:'12px 16px', borderRadius:12, background:msg.type==='success'?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)', border:`1px solid ${msg.type==='success'?'rgba(16,185,129,.3)':'rgba(239,68,68,.3)'}`, color:msg.type==='success'?'#34d399':'#f87171', fontSize:'.85rem' }}>
            {msg.text}
          </div>
        )}

        {/* Browse Tab — see all farmer market listings */}
        {tab === 'browse' && (
          <Card>
            <div style={{ fontWeight:700, fontSize:'.92rem', color:'#e2e8f0', marginBottom:14 }}>🌾 Active Farmer Supply Listings</div>
            <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
              <select className="input-field" style={{ width:'auto', padding:'9px 14px' }} value={filterCrop} onChange={e => setFilterCrop(e.target.value)}>
                <option value="">All Crops</option>
                {CROPS.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="input-field" style={{ width:'auto', padding:'9px 14px' }} value={filterState} onChange={e => setFilterState(e.target.value)}>
                <option value="">All States</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {loading ? (
              <div style={{ textAlign:'center', padding:40, color:'#334155' }}>⏳ Loading...</div>
            ) : reqs.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#334155' }}>No requirements found. Post one to attract farmers!</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {reqs.map(r => (
                  <div key={r._id} style={{ padding:'16px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(59,130,246,.1)', borderRadius:12 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                          <span style={{ fontWeight:800, fontSize:'1rem', color:'#e2e8f0' }}>{r.crop}</span>
                          <span className="badge badge-blue">{r.quality_grade} Grade</span>
                        </div>
                        <div style={{ fontSize:'.8rem', color:'#475569', marginBottom:4 }}>
                          🏢 {r.company_name} · 📍 {r.location}, {r.state}
                        </div>
                        {r.description && <div style={{ fontSize:'.78rem', color:'#334155', marginTop:4 }}>{r.description}</div>}
                        {r.deadline && <div style={{ fontSize:'.72rem', color:'#f59e0b', marginTop:4 }}>⏰ Deadline: {new Date(r.deadline).toLocaleDateString('en-IN')}</div>}
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:'1.3rem', fontWeight:800, color:'#34d399' }}>₹{r.price_per_ton?.toLocaleString()}</div>
                        <div style={{ fontSize:'.68rem', color:'#334155' }}>per ton</div>
                        <div style={{ fontSize:'.82rem', fontWeight:700, color:'#60a5fa', marginTop:4 }}>{r.quantity_tons} tons needed</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
                      <a href={`tel:${r.company_phone}`} style={{ textDecoration:'none' }}>
                        <button className="btn-primary" style={{ padding:'8px 16px', fontSize:'.78rem' }}>📞 Call Company</button>
                      </a>
                      {r.contact_email && (
                        <a href={`mailto:${r.contact_email}`} style={{ textDecoration:'none' }}>
                          <button className="btn-outline" style={{ padding:'7px 16px', fontSize:'.78rem' }}>✉️ Email</button>
                        </a>
                      )}
                      <span style={{ fontSize:'.72rem', color:'#334155', alignSelf:'center' }}>
                        {r.applicants?.length || 0} applicants
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Post Requirement Tab */}
        {tab === 'post' && (
          <Card>
            <div style={{ fontWeight:700, fontSize:'.92rem', color:'#e2e8f0', marginBottom:20 }}>➕ Post New Crop Requirement</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
              <div>
                <label style={labelStyle}>Company Name</label>
                <input className="input-field" value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="Your company name" />
              </div>
              <div>
                <label style={labelStyle}>Contact Phone</label>
                <input className="input-field" type="tel" value={form.company_phone} onChange={e => set('company_phone', e.target.value)} placeholder="9876543210" />
              </div>
              <div>
                <label style={labelStyle}>Crop Required *</label>
                <select className="input-field" value={form.crop} onChange={e => set('crop', e.target.value)}>
                  {CROPS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Quantity (Tons) *</label>
                <input className="input-field" type="number" placeholder="e.g. 50" value={form.quantity_tons} onChange={e => set('quantity_tons', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Price per Ton (₹) *</label>
                <input className="input-field" type="number" placeholder="e.g. 25000" value={form.price_per_ton} onChange={e => set('price_per_ton', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Quality Grade</label>
                <select className="input-field" value={form.quality_grade} onChange={e => set('quality_grade', e.target.value)}>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Location / City *</label>
                <input className="input-field" placeholder="e.g. Jaipur" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <select className="input-field" value={form.state} onChange={e => set('state', e.target.value)}>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Deadline</label>
                <input className="input-field" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Contact Email</label>
                <input className="input-field" type="email" placeholder="company@email.com" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop:14 }}>
              <label style={labelStyle}>Description / Requirements</label>
              <textarea className="input-field" placeholder="Describe quality requirements, packaging, payment terms..." value={form.description} onChange={e => set('description', e.target.value)} style={{ minHeight:80 }} />
            </div>
            <button className="btn-primary" style={{ width:'100%', padding:'14px', fontSize:'1rem', marginTop:16 }} onClick={postRequirement} disabled={posting}>
              {posting ? '⏳ Posting...' : '📋 Post Requirement'}
            </button>
          </Card>
        )}

        {/* My Requirements Tab */}
        {tab === 'mine' && (
          <Card>
            <div style={{ fontWeight:700, fontSize:'.92rem', color:'#e2e8f0', marginBottom:14 }}>📋 My Posted Requirements</div>
            {mine.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#334155', fontSize:'.85rem' }}>
                No requirements posted yet.
                <br /><button onClick={() => setTab('post')} style={{ marginTop:10, background:'none', border:'none', color:'#60a5fa', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontWeight:700 }}>Post your first requirement →</button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {mine.map(r => (
                  <div key={r._id} style={{ padding:'16px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(59,130,246,.1)', borderRadius:12 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                      <div>
                        <div style={{ fontWeight:800, fontSize:'.95rem', color:'#e2e8f0', marginBottom:4 }}>{r.crop} · {r.quantity_tons} tons</div>
                        <div style={{ fontSize:'.78rem', color:'#475569' }}>₹{r.price_per_ton?.toLocaleString()}/ton · {r.location}, {r.state}</div>
                        <div style={{ fontSize:'.72rem', color:'#334155', marginTop:4 }}>Posted: {new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <div style={{ textAlign:'center', padding:'8px 12px', background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', borderRadius:10 }}>
                          <div style={{ fontSize:'1.2rem', fontWeight:800, color:'#34d399' }}>{r.applicants?.length || 0}</div>
                          <div style={{ fontSize:'.62rem', color:'#334155' }}>Applicants</div>
                        </div>
                        <button onClick={() => deleteReq(r._id)} style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', borderRadius:8, padding:'6px 12px', color:'#f87171', fontSize:'.75rem', cursor:'pointer', fontFamily:"'Sora',sans-serif" }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    {/* Applicants list */}
                    {r.applicants?.length > 0 && (
                      <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid rgba(59,130,246,.08)' }}>
                        <div style={{ fontSize:'.72rem', color:'#3b82f6', fontWeight:700, marginBottom:8, letterSpacing:'.05em' }}>FARMER APPLICANTS</div>
                        {r.applicants.map((a, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', background:'rgba(59,130,246,.05)', borderRadius:8, marginBottom:6, flexWrap:'wrap', gap:8 }}>
                            <div>
                              <span style={{ fontWeight:700, fontSize:'.82rem', color:'#e2e8f0' }}>{a.farmer_name}</span>
                              <span style={{ fontSize:'.75rem', color:'#475569', marginLeft:8 }}>· {a.quantity} tons available</span>
                              {a.message && <div style={{ fontSize:'.72rem', color:'#334155', marginTop:2 }}>{a.message}</div>}
                            </div>
                            <a href={`tel:${a.phone}`} style={{ textDecoration:'none' }}>
                              <button className="btn-primary" style={{ padding:'6px 14px', fontSize:'.75rem' }}>📞 {a.phone}</button>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </PortalLayout>
  )
}
