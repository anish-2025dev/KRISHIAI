import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [weather,   setWeather]   = useState(null)
  const [advice,    setAdvice]    = useState([])
  const [prices,    setPrices]    = useState([])
  const [loading,   setLoading]   = useState(true)

  const city = user?.location?.district || user?.location?.state || 'Jaipur'

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [w, a, p] = await Promise.all([
          API.get(`/weather/current?city=${city}`),
          API.get(`/weather/farming-advice?city=${city}`),
          API.get(`/market/prices?state=${user?.location?.state||'Rajasthan'}`),
        ])
        setWeather(w.data.data)
        setAdvice(a.data.advice)
        setPrices(p.data.prices.slice(0, 6))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const ICON_URL = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`

  const QuickCard = ({ icon, label, value, sub, color, onClick }) => (
    <div className="card" style={{ padding:20, cursor:onClick?'pointer':'default' }} onClick={onClick}>
      <div style={{ fontSize:'1.6rem', marginBottom:10 }}>{icon}</div>
      <div style={{ fontSize:'.62rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#3d6b40', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:'1.4rem', fontWeight:800, color:color||'#4caf50', letterSpacing:'-0.02em', marginBottom:2 }}>{value}</div>
      {sub && <div style={{ fontSize:'.72rem', color:'#4a7c4e' }}>{sub}</div>}
    </div>
  )

  const ShortcutBtn = ({ icon, label, path }) => (
    <button
      onClick={() => navigate(path)}
      style={{ background:'rgba(27,45,28,.6)', border:'1px solid rgba(76,175,80,.15)', borderRadius:14, padding:'16px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:8, cursor:'pointer', transition:'all .3s', fontFamily:"'Sora',sans-serif", flex:1, minWidth:80 }}
      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(76,175,80,.45)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='rgba(76,175,80,.15)'}
    >
      <span style={{ fontSize:'1.6rem' }}>{icon}</span>
      <span style={{ fontSize:'.72rem', color:'#81c784', fontWeight:600 }}>{label}</span>
    </button>
  )

  if (loading) return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:12, animation:'spin 2s linear infinite', display:'inline-block' }}>🌿</div>
          <div style={{ color:'#66bb6a' }}>Loading your dashboard...</div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth:960, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Welcome banner */}
        <div style={{ background:'linear-gradient(135deg,rgba(30,60,32,.9),rgba(16,36,18,.95))', border:'1px solid rgba(76,175,80,.2)', borderRadius:20, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:'.75rem', color:'#66bb6a', fontWeight:700, letterSpacing:'.1em', marginBottom:6 }}>WELCOME BACK</div>
            <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#c8e6c9', marginBottom:4 }}>
              नमस्ते, {user?.name} 👋
            </div>
            <div style={{ fontSize:'.85rem', color:'#4a7c4e' }}>
              {user?.land_acres || 0} acres · {user?.location?.state || 'India'} · {user?.soil_type || 'Unknown'} soil
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-outline" style={{ padding:'10px 20px', fontSize:'.85rem' }} onClick={() => navigate('/crops')}>
              🌱 Get Crop Advice
            </button>
            <button className="btn-primary" style={{ padding:'10px 20px', fontSize:'.85rem' }} onClick={() => navigate('/chat')}>
              🤖 Ask AI
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14 }}>
          <QuickCard
            icon={weather?.icon ? <img src={ICON_URL(weather.icon)} style={{ width:40, height:40 }} /> : '🌤️'}
            label="Weather Now"
            value={weather ? `${weather.temp}°C` : '--'}
            sub={weather?.description || city}
            color="#ff8f00"
            onClick={() => navigate('/weather')}
          />
          <QuickCard icon="📊" label="Market" value={prices[0]?.crop || 'Live'} sub={prices[0] ? `₹${prices[0].current_price}/qt` : 'Tap to check'} color="#42a5f5" onClick={() => navigate('/market')} />
          <QuickCard icon="💧" label="Humidity" value={weather ? `${weather.humidity}%` : '--'} sub="Current reading" color="#29b6f6" />
          <QuickCard icon="💨" label="Wind" value={weather ? `${weather.wind_speed} m/s` : '--'} sub="Current speed" color="#66bb6a" />
        </div>

        {/* Quick navigation */}
        <div className="card" style={{ padding:20 }}>
          <div style={{ fontWeight:700, fontSize:'.85rem', color:'#c8e6c9', marginBottom:14 }}>⚡ Quick Access</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <ShortcutBtn icon="🌦️" label="Weather"    path="/weather" />
            <ShortcutBtn icon="🌱" label="Crop AI"    path="/crops" />
            <ShortcutBtn icon="🔬" label="Disease"    path="/disease" />
            <ShortcutBtn icon="📊" label="Market"     path="/market" />
            <ShortcutBtn icon="🤖" label="AI Chat"    path="/chat" />
          </div>
        </div>

        {/* Farming alerts + Market prices */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:16 }}>
          {/* Alerts */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:'.9rem', color:'#c8e6c9', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>🚨 AI Farming Alerts</span>
              <span style={{ fontSize:'.65rem', background:'rgba(76,175,80,.1)', border:'1px solid rgba(76,175,80,.2)', borderRadius:100, padding:'2px 8px', color:'#66bb6a' }}>{advice.length} active</span>
            </div>
            {advice.length === 0 ? (
              <div style={{ textAlign:'center', padding:20, color:'#3d6b40', fontSize:'.82rem' }}>✅ No alerts — conditions look good!</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {advice.map((a, i) => {
                  const bgMap = { danger:'rgba(229,57,53,.08)', warning:'rgba(255,143,0,.08)', success:'rgba(76,175,80,.08)', info:'rgba(66,165,245,.08)' }
                  const borderMap = { danger:'rgba(229,57,53,.2)', warning:'rgba(255,143,0,.2)', success:'rgba(76,175,80,.2)', info:'rgba(66,165,245,.2)' }
                  return (
                    <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', borderRadius:10, background:bgMap[a.type]||'rgba(76,175,80,.08)', border:`1px solid ${borderMap[a.type]||'rgba(76,175,80,.2)'}` }}>
                      <span style={{ fontSize:'1rem', flexShrink:0 }}>{a.icon}</span>
                      <span style={{ fontSize:'.8rem', color:'#c8e6c9', lineHeight:1.5 }}>{a.text}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Live prices */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontWeight:700, fontSize:'.9rem', color:'#c8e6c9', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>💰 Live Mandi Prices</span>
              <button onClick={() => navigate('/market')} style={{ fontSize:'.72rem', color:'#66bb6a', background:'none', border:'none', cursor:'pointer', fontFamily:"'Sora',sans-serif", fontWeight:600 }}>View All →</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {prices.map(p => (
                <div key={p.crop} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:10, background:'rgba(255,255,255,.02)', border:'1px solid rgba(76,175,80,.06)' }}>
                  <div>
                    <span style={{ fontWeight:700, fontSize:'.875rem', color:'#c8e6c9' }}>{p.crop}</span>
                    <span style={{ fontSize:'.7rem', color:'#4a7c4e', marginLeft:8 }}>{p.crop_hindi}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontWeight:800, color:'#4caf50', fontSize:'.9rem' }}>₹{p.current_price}</span>
                    <span style={{ fontSize:'.72rem', fontWeight:700, padding:'2px 7px', borderRadius:100, background:p.trend==='up'?'rgba(76,175,80,.12)':'rgba(229,57,53,.1)', color:p.trend==='up'?'#66bb6a':'#ef5350' }}>
                      {p.trend==='up'?'↑':'↓'}{Math.abs(p.change_pct)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Chat teaser */}
        <div style={{ background:'linear-gradient(135deg,rgba(27,55,28,.7),rgba(16,28,17,.9))', border:'1px solid rgba(76,175,80,.2)', borderRadius:18, padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>🤖</div>
            <div>
              <div style={{ fontWeight:700, fontSize:'.95rem', color:'#c8e6c9', marginBottom:2 }}>AI Farming Assistant</div>
              <div style={{ fontSize:'.78rem', color:'#4a7c4e' }}>Ask anything in Hindi, English, or Hinglish</div>
            </div>
          </div>
          <button className="btn-primary" style={{ padding:'11px 24px', fontSize:'.88rem' }} onClick={() => navigate('/chat')}>
            💬 Start Chat
          </button>
        </div>

      </div>
    </Layout>
  )
}
