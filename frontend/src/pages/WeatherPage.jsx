import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'

const ICON_URL = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`

const WIND_DIR = (deg) => {
  const dirs = ['N','NE','E','SE','S','SW','W','NW']
  return dirs[Math.round(deg / 45) % 8]
}

export default function WeatherPage() {
  const { user }         = useAuth()
  const [current, setCurrent]   = useState(null)
  const [forecast, setForecast] = useState([])
  const [advice, setAdvice]     = useState([])
  const [city, setCity]         = useState(user?.location?.district || user?.location?.state || 'Jaipur')
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const fetchWeather = async (cityName) => {
    setLoading(true)
    setError('')
    try {
      const [cur, fore, adv] = await Promise.all([
        API.get(`/weather/current?city=${cityName}`),
        API.get(`/weather/forecast?city=${cityName}`),
        API.get(`/weather/farming-advice?city=${cityName}`),
      ])
      setCurrent(cur.data.data)
      setForecast(fore.data.forecast)
      setAdvice(adv.data.advice)
      setCity(cityName)
    } catch (e) {
      setError('City not found. Please check spelling.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWeather(city) }, [])

  const ALERT_COLORS = { danger:'#ef5350', warning:'#ffa726', success:'#66bb6a', info:'#42a5f5' }

  const Card = ({ children, style = {} }) => (
    <div className="card" style={{ padding:20, ...style }}>{children}</div>
  )

  if (loading) return (
    <Layout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>🌤️</div>
          <div style={{ color:'#66bb6a' }}>Fetching live weather...</div>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth:900, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Search bar */}
        <div style={{ display:'flex', gap:10 }}>
          <input
            className="input-field"
            placeholder="Search city, district... e.g. Jaipur, Ludhiana"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search && fetchWeather(search)}
            style={{ flex:1 }}
          />
          <button className="btn-primary" style={{ padding:'12px 20px', flexShrink:0 }} onClick={() => search && fetchWeather(search)}>
            🔍 Search
          </button>
        </div>

        {error && <div style={{ background:'rgba(229,57,53,.1)', border:'1px solid rgba(229,57,53,.3)', borderRadius:12, padding:'12px 16px', color:'#ef5350' }}>⚠️ {error}</div>}

        {current && (
          <>
            {/* Current weather hero */}
            <Card style={{ background:'linear-gradient(135deg,rgba(30,60,32,.9),rgba(16,36,18,.95))' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                <div>
                  <div style={{ fontSize:'.75rem', color:'#66bb6a', fontWeight:700, letterSpacing:'.1em', marginBottom:4 }}>LIVE WEATHER</div>
                  <div style={{ fontSize:'1.3rem', fontWeight:800, color:'#c8e6c9', marginBottom:2 }}>📍 {current.city}, {current.country}</div>
                  <div style={{ fontSize:'clamp(3rem,8vw,5rem)', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', lineHeight:1 }}>
                    {current.temp}°<span style={{ fontSize:'50%', color:'#81c784' }}>C</span>
                  </div>
                  <div style={{ fontSize:'1rem', color:'#81c784', marginTop:4, textTransform:'capitalize' }}>{current.description}</div>
                  <div style={{ fontSize:'.82rem', color:'#4a7c4e', marginTop:4 }}>Feels like {current.feels_like}°C</div>
                </div>
                {current.icon && (
                  <img src={ICON_URL(current.icon)} alt={current.description} style={{ width:100, height:100, filter:'drop-shadow(0 0 20px rgba(76,175,80,.3))' }} />
                )}
              </div>

              {/* Details grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:12, marginTop:20 }}>
                {[
                  { icon:'💧', label:'Humidity',   value:`${current.humidity}%` },
                  { icon:'💨', label:'Wind',       value:`${current.wind_speed} m/s ${WIND_DIR(current.wind_deg)}` },
                  { icon:'🌡️', label:'Pressure',   value:`${current.pressure} hPa` },
                  { icon:'👁️', label:'Visibility', value:`${(current.visibility/1000).toFixed(1)} km` },
                  { icon:'☁️', label:'Cloud Cover',value:`${current.clouds}%` },
                  { icon:'🌅', label:'Sunrise',    value:new Date(current.sunrise*1000).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) },
                ].map(item => (
                  <div key={item.label} style={{ background:'rgba(255,255,255,.04)', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                    <div style={{ fontSize:'1.2rem', marginBottom:4 }}>{item.icon}</div>
                    <div style={{ fontSize:'.65rem', color:'#4a7c4e', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' }}>{item.label}</div>
                    <div style={{ fontSize:'.82rem', color:'#c8e6c9', fontWeight:700, marginTop:2 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Farming advice */}
            {advice.length > 0 && (
              <Card>
                <div style={{ fontWeight:700, fontSize:'.95rem', color:'#c8e6c9', marginBottom:14 }}>🌾 AI Farming Advice</div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {advice.map((a, i) => (
                    <div key={i} style={{ display:'flex', gap:12, padding:'12px 14px', borderRadius:10, background:`rgba(${a.type==='danger'?'229,57,53':a.type==='warning'?'255,143,0':a.type==='success'?'76,175,80':'66,165,245'},.08)`, border:`1px solid rgba(${a.type==='danger'?'229,57,53':a.type==='warning'?'255,143,0':a.type==='success'?'76,175,80':'66,165,245'},.2)` }}>
                      <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{a.icon}</span>
                      <span style={{ fontSize:'.85rem', color:'#c8e6c9', lineHeight:1.5 }}>{a.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 7-day forecast */}
            {forecast.length > 0 && (
              <Card>
                <div style={{ fontWeight:700, fontSize:'.95rem', color:'#c8e6c9', marginBottom:14 }}>📅 7-Day Forecast</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {forecast.map((day, i) => (
                    <div key={day.date} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, background: i===0?'rgba(76,175,80,.1)':'rgba(255,255,255,.02)', border:`1px solid ${i===0?'rgba(76,175,80,.2)':'rgba(255,255,255,.04)'}` }}>
                      <div style={{ width:90 }}>
                        <div style={{ fontSize:'.8rem', fontWeight:700, color:'#c8e6c9' }}>
                          {i===0 ? 'Today' : new Date(day.date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}
                        </div>
                      </div>
                      {day.icon && <img src={ICON_URL(day.icon)} alt={day.description} style={{ width:36, height:36 }} />}
                      <div style={{ fontSize:'.78rem', color:'#81c784', flex:1, textAlign:'center', textTransform:'capitalize' }}>{day.description}</div>
                      <div style={{ display:'flex', gap:10, fontSize:'.85rem', fontWeight:700 }}>
                        <span style={{ color:'#ff8f00' }}>{day.temp_max}°</span>
                        <span style={{ color:'#4a7c4e' }}>{day.temp_min}°</span>
                      </div>
                      {day.rain_mm > 0 && (
                        <div style={{ fontSize:'.75rem', color:'#42a5f5', marginLeft:10, flexShrink:0 }}>💧{day.rain_mm}mm</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
