import { useState } from 'react'
import Layout from '../components/Layout'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'

const STATES = ['Rajasthan','Punjab','Haryana','Uttar Pradesh','Madhya Pradesh','Maharashtra','Gujarat','Bihar','West Bengal','Andhra Pradesh','Karnataka','Tamil Nadu','Telangana','Odisha','Assam']
const SOILS  = ['Loamy','Sandy','Clay','Silty','Black (Regur)','Red','Alluvial','Laterite']
const CROPS_LIST = ['Wheat','Rice','Maize','Mustard','Soybean','Cotton','Onion','Potato','Tomato','Chickpea','Bajra','Jowar','Groundnut','Sugarcane','Turmeric']

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [tab, setTab]   = useState('profile')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]   = useState({ type:'', text:'' })

  const [form, setForm] = useState({
    name:       user?.name || '',
    email:      user?.email || '',
    state:      user?.location?.state || 'Rajasthan',
    district:   user?.location?.district || '',
    village:    user?.location?.village || '',
    land_acres: user?.land_acres || '',
    soil_type:  user?.soil_type || 'Loamy',
    crops:      user?.crops || [],
    language:   user?.language || 'hindi',
  })

  const [pwd, setPwd] = useState({ current:'', new_pwd:'', confirm:'' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleCrop = (crop) => {
    setForm(f => ({
      ...f,
      crops: f.crops.includes(crop)
        ? f.crops.filter(c => c !== crop)
        : [...f.crops, crop]
    }))
  }

  const saveProfile = async () => {
    setSaving(true)
    setMsg({ type:'', text:'' })
    try {
      const { data } = await API.put('/profile/update', {
        name:       form.name,
        email:      form.email,
        location:   { state: form.state, district: form.district, village: form.village },
        land_acres: parseFloat(form.land_acres) || 0,
        soil_type:  form.soil_type,
        crops:      form.crops,
        language:   form.language,
      })
      localStorage.setItem('krishiai_user', JSON.stringify(data.user))
      setMsg({ type:'success', text:'✅ Profile updated successfully!' })
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (pwd.new_pwd !== pwd.confirm)
      return setMsg({ type:'error', text:'New passwords do not match' })
    if (pwd.new_pwd.length < 6)
      return setMsg({ type:'error', text:'Password must be at least 6 characters' })
    setSaving(true)
    setMsg({ type:'', text:'' })
    try {
      await API.post('/profile/change-password', {
        current_password: pwd.current,
        new_password:     pwd.new_pwd,
      })
      setMsg({ type:'success', text:'✅ Password changed successfully!' })
      setPwd({ current:'', new_pwd:'', confirm:'' })
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.message || 'Failed to change password' })
    } finally {
      setSaving(false)
    }
  }

  const labelStyle = { display:'block', fontSize:'.72rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.07em', textTransform:'uppercase' }
  const Card = ({ children, style={} }) => (
    <div style={{ background:'linear-gradient(145deg,rgba(27,45,28,.8),rgba(19,32,20,.9))', border:'1px solid rgba(76,175,80,.15)', borderRadius:16, padding:24, ...style }}>
      {children}
    </div>
  )

  const ROLE_ICONS = { farmer:'👨‍🌾', company:'🏢', insurance:'🛡️', transport:'🚛', admin:'⚙️' }

  return (
    <Layout>
      <div style={{ maxWidth:760, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Profile header */}
        <Card style={{ background:'linear-gradient(135deg,rgba(30,60,32,.9),rgba(16,36,18,.95))' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', flexShrink:0 }}>
              {ROLE_ICONS[user?.role] || '👨‍🌾'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#c8e6c9', marginBottom:4 }}>{user?.name}</div>
              <div style={{ fontSize:'.82rem', color:'#66bb6a', marginBottom:4 }}>📱 {user?.phone}</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:'.72rem', padding:'3px 10px', borderRadius:100, background:'rgba(76,175,80,.15)', border:'1px solid rgba(76,175,80,.3)', color:'#81c784', fontWeight:600, textTransform:'capitalize' }}>
                  {user?.role || 'Farmer'}
                </span>
                <span style={{ fontSize:'.72rem', padding:'3px 10px', borderRadius:100, background:'rgba(66,165,245,.1)', border:'1px solid rgba(66,165,245,.2)', color:'#90caf9', fontWeight:600 }}>
                  📍 {user?.location?.state || 'India'}
                </span>
                <span style={{ fontSize:'.72rem', padding:'3px 10px', borderRadius:100, background:'rgba(255,143,0,.1)', border:'1px solid rgba(255,143,0,.2)', color:'#ffa726', fontWeight:600 }}>
                  🌾 {user?.land_acres || 0} acres
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8 }}>
          {[['profile','👤 Profile'],['password','🔒 Password'],['crops','🌾 My Crops']].map(([val, label]) => (
            <button key={val} onClick={() => { setTab(val); setMsg({type:'',text:''}) }}
              style={{ padding:'10px 20px', borderRadius:100, fontSize:'.82rem', fontWeight:700, border:`1px solid ${tab===val?'#4caf50':'rgba(76,175,80,.2)'}`, background:tab===val?'rgba(76,175,80,.15)':'transparent', color:tab===val?'#81c784':'#4a7c4e', cursor:'pointer', fontFamily:"'Sora',sans-serif", transition:'all .2s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Message */}
        {msg.text && (
          <div style={{ padding:'12px 16px', borderRadius:12, background:msg.type==='success'?'rgba(76,175,80,.1)':'rgba(229,57,53,.1)', border:`1px solid ${msg.type==='success'?'rgba(76,175,80,.3)':'rgba(229,57,53,.3)'}`, color:msg.type==='success'?'#81c784':'#ef5350', fontSize:'.85rem' }}>
            {msg.text}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <Card>
            <div style={{ fontWeight:700, fontSize:'.9rem', color:'#c8e6c9', marginBottom:20 }}>📝 Edit Profile</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label style={labelStyle}>Email (optional)</label>
                <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <select className="input-field" value={form.state} onChange={e => set('state', e.target.value)}>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>District</label>
                <input className="input-field" value={form.district} onChange={e => set('district', e.target.value)} placeholder="e.g. Jaipur" />
              </div>
              <div>
                <label style={labelStyle}>Village / Town</label>
                <input className="input-field" value={form.village} onChange={e => set('village', e.target.value)} placeholder="e.g. Chomu" />
              </div>
              <div>
                <label style={labelStyle}>Land Area (Acres)</label>
                <input className="input-field" type="number" value={form.land_acres} onChange={e => set('land_acres', e.target.value)} placeholder="e.g. 3.5" />
              </div>
              <div>
                <label style={labelStyle}>Soil Type</label>
                <select className="input-field" value={form.soil_type} onChange={e => set('soil_type', e.target.value)}>
                  {SOILS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Language Preference</label>
                <select className="input-field" value={form.language} onChange={e => set('language', e.target.value)}>
                  <option value="hindi">हिंदी (Hindi)</option>
                  <option value="english">English</option>
                  <option value="hinglish">Hinglish</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" style={{ width:'100%', padding:'14px', marginTop:20, fontSize:'1rem' }} onClick={saveProfile} disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Profile'}
            </button>
          </Card>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <Card>
            <div style={{ fontWeight:700, fontSize:'.9rem', color:'#c8e6c9', marginBottom:20 }}>🔒 Change Password</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input className="input-field" type="password" value={pwd.current} onChange={e => setPwd(p => ({...p, current:e.target.value}))} placeholder="Enter current password" />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <input className="input-field" type="password" value={pwd.new_pwd} onChange={e => setPwd(p => ({...p, new_pwd:e.target.value}))} placeholder="Min 6 characters" />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input className="input-field" type="password" value={pwd.confirm} onChange={e => setPwd(p => ({...p, confirm:e.target.value}))} placeholder="Repeat new password" />
              </div>
              <button className="btn-primary" style={{ padding:'14px', fontSize:'1rem', marginTop:4 }} onClick={changePassword} disabled={saving}>
                {saving ? '⏳ Changing...' : '🔐 Change Password'}
              </button>
            </div>
          </Card>
        )}

        {/* Crops Tab */}
        {tab === 'crops' && (
          <Card>
            <div style={{ fontWeight:700, fontSize:'.9rem', color:'#c8e6c9', marginBottom:8 }}>🌾 Select Your Crops</div>
            <div style={{ fontSize:'.8rem', color:'#4a7c4e', marginBottom:16 }}>Select all crops you grow — this helps AI give better recommendations</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
              {CROPS_LIST.map(crop => (
                <div key={crop} onClick={() => toggleCrop(crop)}
                  style={{ padding:'8px 16px', borderRadius:100, fontSize:'.82rem', fontWeight:600, cursor:'pointer', border:`1px solid ${form.crops.includes(crop)?'#4caf50':'rgba(76,175,80,.2)'}`, background:form.crops.includes(crop)?'rgba(76,175,80,.2)':'transparent', color:form.crops.includes(crop)?'#81c784':'#4a7c4e', transition:'all .2s' }}>
                  {form.crops.includes(crop) ? '✓ ' : ''}{crop}
                </div>
              ))}
            </div>
            <div style={{ fontSize:'.78rem', color:'#4a7c4e', marginBottom:16 }}>
              Selected: {form.crops.length > 0 ? form.crops.join(', ') : 'None selected'}
            </div>
            <button className="btn-primary" style={{ width:'100%', padding:'14px', fontSize:'1rem' }} onClick={saveProfile} disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Crops'}
            </button>
          </Card>
        )}
      </div>
    </Layout>
  )
}
