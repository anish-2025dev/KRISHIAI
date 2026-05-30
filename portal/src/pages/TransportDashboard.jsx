import { useState, useEffect } from 'react'
import PortalLayout from '../components/PortalLayout'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'

const VEHICLE_TYPES = ['Truck (Large)','Truck (Medium)','Mini Truck','Tempo','Pickup Van','Tractor Trolley','Refrigerated Truck']
const STATES = ['Rajasthan','Punjab','Haryana','Uttar Pradesh','Madhya Pradesh','Maharashtra','Gujarat','Bihar','West Bengal','Andhra Pradesh','Karnataka','Tamil Nadu']
const CROPS  = ['Wheat','Rice','Vegetables','Fruits','Cotton','Sugarcane','All Crops']

export default function TransportDashboard() {
  const { user }  = useAuth()
  const [tab,     setTab]     = useState('my-vehicles')
  const [listings,setListings]= useState([])
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState({ type:'', text:'' })

  const [form, setForm] = useState({
    provider_name:    user?.name || '',
    vehicle_type:     'Truck (Large)',
    vehicle_number:   '',
    capacity_tons:    '',
    rate_per_km:      '',
    rate_per_ton:     '',
    base_location:    '',
    state:            user?.location?.state || 'Rajasthan',
    routes:           '',
    contact_phone:    user?.phone || '',
    crops_handled:    [],
    has_refrigeration:false,
    description:      '',
  })

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const toggleCrop = (c) => setForm(f => ({
    ...f,
    crops_handled: f.crops_handled.includes(c)
      ? f.crops_handled.filter(x => x !== c)
      : [...f.crops_handled, c]
  }))

  useEffect(() => { fetchMine() }, [])

  const fetchMine = async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/portal/transport/mine')
      setListings(data.listings || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const addVehicle = async () => {
    if (!form.vehicle_type || !form.capacity_tons || !form.rate_per_km || !form.base_location || !form.contact_phone)
      return setMsg({ type:'error', text:'Please fill all required fields' })
    setSaving(true)
    setMsg({ type:'', text:'' })
    try {
      await API.post('/portal/transport', {
        ...form,
        routes: form.routes.split('\n').filter(r => r.trim()),
      })
      setMsg({ type:'success', text:'✅ Vehicle listed successfully!' })
      setTab('my-vehicles')
      fetchMine()
      setForm(f => ({ ...f, vehicle_number:'', capacity_tons:'', rate_per_km:'', rate_per_ton:'', routes:'', description:'' }))
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.message || 'Failed to add vehicle' })
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailability = async (id) => {
    try {
      const { data } = await API.put(`/portal/transport/${id}/toggle`)
      setListings(prev => prev.map(l => l._id===id ? {...l, available:data.available} : l))
    } catch (e) { alert('Failed to update') }
  }

  const labelStyle = { display:'block', fontSize:'.7rem', fontWeight:700, color:'#f59e0b', marginBottom:5, letterSpacing:'.07em', textTransform:'uppercase' }

  return (
    <PortalLayout>
      <div style={{ maxWidth:900, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,rgba(40,30,5,.9),rgba(20,15,5,.95))', border:'1px solid rgba(245,158,11,.2)', borderRadius:20, padding:'24px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:'.7rem', color:'#f59e0b', fontWeight:700, letterSpacing:'.1em', marginBottom:6 }}>TRANSPORT DASHBOARD</div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#e2e8f0', marginBottom:4 }}>Welcome, {user?.name} 🚛</div>
              <div style={{ fontSize:'.82rem', color:'#78716c' }}>{user?.location?.state || 'India'} · {user?.phone}</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ textAlign:'center', padding:'12px 18px', background:'rgba(245,158,11,.1)', border:'1px solid rgba(245,158,11,.2)', borderRadius:12 }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#fbbf24' }}>{listings.length}</div>
                <div style={{ fontSize:'.68rem', color:'#78716c' }}>Vehicles Listed</div>
              </div>
              <div style={{ textAlign:'center', padding:'12px 18px', background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', borderRadius:12 }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#34d399' }}>{listings.filter(l => l.available).length}</div>
                <div style={{ fontSize:'.68rem', color:'#78716c' }}>Available Now</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8 }}>
          {[['my-vehicles','🚛 My Vehicles'],['add','➕ Add Vehicle']].map(([val,label]) => (
            <button key={val} onClick={() => { setTab(val); setMsg({type:'',text:''}) }}
              style={{ padding:'10px 20px', borderRadius:100, fontSize:'.82rem', fontWeight:700, border:`1px solid ${tab===val?'#f59e0b':'rgba(245,158,11,.2)'}`, background:tab===val?'rgba(245,158,11,.15)':'transparent', color:tab===val?'#fbbf24':'#78716c', cursor:'pointer', fontFamily:"'Sora',sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {msg.text && (
          <div style={{ padding:'12px 16px', borderRadius:12, background:msg.type==='success'?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)', border:`1px solid ${msg.type==='success'?'rgba(16,185,129,.3)':'rgba(239,68,68,.3)'}`, color:msg.type==='success'?'#34d399':'#f87171', fontSize:'.85rem' }}>
            {msg.text}
          </div>
        )}

        {/* My Vehicles */}
        {tab === 'my-vehicles' && (
          <div style={{ background:'linear-gradient(145deg,rgba(15,23,42,.9),rgba(10,15,30,.95))', border:'1px solid rgba(245,158,11,.15)', borderRadius:16, padding:20 }}>
            <div style={{ fontWeight:700, fontSize:'.92rem', color:'#e2e8f0', marginBottom:14 }}>🚛 My Vehicle Listings</div>
            {loading ? (
              <div style={{ textAlign:'center', padding:40, color:'#78716c' }}>⏳ Loading...</div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#78716c', fontSize:'.85rem' }}>
                No vehicles listed yet.
                <br /><button onClick={() => setTab('add')} style={{ marginTop:10, background:'none', border:'none', color:'#fbbf24', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontWeight:700 }}>Add your first vehicle →</button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {listings.map(l => (
                  <div key={l._id} style={{ padding:'16px', background:'rgba(255,255,255,.02)', border:`1px solid ${l.available?'rgba(16,185,129,.2)':'rgba(239,68,68,.15)'}`, borderRadius:12 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                          <span style={{ fontWeight:800, fontSize:'1rem', color:'#e2e8f0' }}>{l.vehicle_type}</span>
                          {l.vehicle_number && <span style={{ fontSize:'.75rem', color:'#fbbf24', background:'rgba(245,158,11,.1)', padding:'2px 8px', borderRadius:100, border:'1px solid rgba(245,158,11,.25)' }}>{l.vehicle_number}</span>}
                          <span className={`badge ${l.available?'badge-green':'badge-red'}`}>{l.available?'Available':'Unavailable'}</span>
                          {l.has_refrigeration && <span className="badge badge-blue">❄️ Refrigerated</span>}
                        </div>
                        <div style={{ fontSize:'.8rem', color:'#78716c', marginBottom:4 }}>
                          📍 {l.base_location}, {l.state} · ⚖️ {l.capacity_tons} tons
                        </div>
                        <div style={{ fontSize:'.78rem', color:'#fbbf24' }}>
                          ₹{l.rate_per_km}/km {l.rate_per_ton ? `· ₹${l.rate_per_ton}/ton` : ''}
                        </div>
                        {l.routes?.length > 0 && (
                          <div style={{ fontSize:'.72rem', color:'#475569', marginTop:4 }}>
                            🛣️ {l.routes.slice(0,2).join(' · ')}{l.routes.length>2?` +${l.routes.length-2} more`:''}
                          </div>
                        )}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                        <button onClick={() => toggleAvailability(l._id)}
                          style={{ padding:'8px 14px', borderRadius:100, fontSize:'.75rem', fontWeight:700, border:`1px solid ${l.available?'rgba(239,68,68,.3)':'rgba(16,185,129,.3)'}`, background:l.available?'rgba(239,68,68,.1)':'rgba(16,185,129,.1)', color:l.available?'#f87171':'#34d399', cursor:'pointer', fontFamily:"'Sora',sans-serif" }}>
                          {l.available ? '⏸ Mark Unavailable' : '▶ Mark Available'}
                        </button>
                        <a href={`tel:${l.contact_phone}`} style={{ textDecoration:'none', fontSize:'.72rem', color:'#60a5fa' }}>📞 {l.contact_phone}</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Vehicle */}
        {tab === 'add' && (
          <div style={{ background:'linear-gradient(145deg,rgba(15,23,42,.9),rgba(10,15,30,.95))', border:'1px solid rgba(245,158,11,.15)', borderRadius:16, padding:20 }}>
            <div style={{ fontWeight:700, fontSize:'.92rem', color:'#e2e8f0', marginBottom:20 }}>➕ Add New Vehicle</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
              <div>
                <label style={labelStyle}>Your Name *</label>
                <input className="input-field" value={form.provider_name} onChange={e => set('provider_name', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Vehicle Type *</label>
                <select className="input-field" value={form.vehicle_type} onChange={e => set('vehicle_type', e.target.value)}>
                  {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Vehicle Number</label>
                <input className="input-field" placeholder="RJ14CA1234" value={form.vehicle_number} onChange={e => set('vehicle_number', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Capacity (Tons) *</label>
                <input className="input-field" type="number" placeholder="e.g. 10" value={form.capacity_tons} onChange={e => set('capacity_tons', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Rate per KM (₹) *</label>
                <input className="input-field" type="number" placeholder="e.g. 25" value={form.rate_per_km} onChange={e => set('rate_per_km', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Rate per Ton (₹)</label>
                <input className="input-field" type="number" placeholder="e.g. 500" value={form.rate_per_ton} onChange={e => set('rate_per_ton', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Base Location *</label>
                <input className="input-field" placeholder="e.g. Jaipur" value={form.base_location} onChange={e => set('base_location', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <select className="input-field" value={form.state} onChange={e => set('state', e.target.value)}>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Contact Phone *</label>
                <input className="input-field" type="tel" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop:14 }}>
              <label style={labelStyle}>Routes (one per line)</label>
              <textarea className="input-field" placeholder={"Jaipur to Delhi\nRajasthan to Punjab\nJaipur to Mumbai"} value={form.routes} onChange={e => set('routes', e.target.value)} style={{ minHeight:80 }} />
            </div>

            <div style={{ marginTop:14 }}>
              <label style={labelStyle}>Crops Handled</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
                {CROPS.map(c => (
                  <div key={c} onClick={() => toggleCrop(c)}
                    style={{ padding:'5px 12px', borderRadius:100, fontSize:'.75rem', fontWeight:600, cursor:'pointer', border:`1px solid ${form.crops_handled.includes(c)?'#f59e0b':'rgba(245,158,11,.2)'}`, background:form.crops_handled.includes(c)?'rgba(245,158,11,.15)':'transparent', color:form.crops_handled.includes(c)?'#fbbf24':'#78716c', transition:'all .2s' }}>
                    {form.crops_handled.includes(c)?'✓ ':''}{c}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:14 }}>
              <input type="checkbox" id="fridge" checked={form.has_refrigeration} onChange={e => set('has_refrigeration', e.target.checked)} style={{ width:16, height:16 }} />
              <label htmlFor="fridge" style={{ fontSize:'.82rem', color:'#e2e8f0', cursor:'pointer' }}>❄️ Vehicle has refrigeration / cold storage</label>
            </div>

            <div style={{ marginTop:14 }}>
              <label style={labelStyle}>Additional Info</label>
              <textarea className="input-field" placeholder="Any additional details about your vehicle or service..." value={form.description} onChange={e => set('description', e.target.value)} style={{ minHeight:70 }} />
            </div>

            <button className="btn-orange" style={{ width:'100%', padding:'14px', fontSize:'1rem', marginTop:16 }} onClick={addVehicle} disabled={saving}>
              {saving ? '⏳ Adding...' : '🚛 Add Vehicle Listing'}
            </button>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
