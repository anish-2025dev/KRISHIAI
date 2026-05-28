import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import API from '../utils/api'

export default function MarketPage() {
  const [prices,   setPrices]   = useState([])
  const [mandis,   setMandis]   = useState([])
  const [state,    setState]    = useState('Rajasthan')
  const [predict,  setPredict]  = useState(null)
  const [selCrop,  setSelCrop]  = useState('wheat')
  const [loading,  setLoading]  = useState(true)
  const [predLoad, setPredLoad] = useState(false)

  const STATES = ['Rajasthan','Punjab','Haryana','UP','MP','Maharashtra','Gujarat']

  useEffect(() => { fetchData() }, [state])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [p, m] = await Promise.all([
        API.get(`/market/prices?state=${state}`),
        API.get('/market/mandis?lat=26.9124&lon=75.7873'),
      ])
      setPrices(p.data.prices)
      setMandis(m.data.mandis)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchPredict = async () => {
    setPredLoad(true)
    try {
      const { data } = await API.get(`/market/predict?crop=${selCrop}&state=${state}`)
      setPredict(data.prediction)
    } catch (e) {
      console.error(e)
    } finally {
      setPredLoad(false)
    }
  }

  const Card = ({ children, style = {} }) => (
    <div className="card" style={{ padding:20, ...style }}>{children}</div>
  )

  return (
    <Layout>
      <div style={{ maxWidth:960, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'#c8e6c9' }}>📊 Smart Market & Mandi</h1>
            <p style={{ color:'#4a7c4e', fontSize:'.82rem' }}>Live prices · AI predictions · Nearby mandis</p>
          </div>
          <select className="input-field" style={{ width:'auto', padding:'10px 14px' }} value={state} onChange={e => setState(e.target.value)}>
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Prices grid */}
        <Card>
          <div style={{ fontWeight:700, fontSize:'.95rem', color:'#c8e6c9', marginBottom:16 }}>🌾 Live Mandi Prices — {state}</div>
          {loading ? (
            <div style={{ textAlign:'center', padding:40, color:'#4a7c4e' }}>⏳ Fetching prices...</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
              {prices.map(p => (
                <div key={p.crop} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(76,175,80,.1)', borderRadius:12, padding:'14px 16px', cursor:'pointer', transition:'all .2s', borderColor: selCrop===p.crop.toLowerCase()?'#4caf50':'rgba(76,175,80,.1)' }} onClick={() => setSelCrop(p.crop.toLowerCase())}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'.9rem', color:'#c8e6c9' }}>{p.crop}</div>
                      <div style={{ fontSize:'.7rem', color:'#4a7c4e' }}>{p.crop_hindi}</div>
                    </div>
                    <div style={{ fontSize:'.75rem', fontWeight:700, padding:'2px 8px', borderRadius:100, background:p.trend==='up'?'rgba(76,175,80,.15)':'rgba(229,57,53,.12)', color:p.trend==='up'?'#66bb6a':'#ef5350' }}>
                      {p.trend==='up'?'↑':'↓'} {Math.abs(p.change_pct)}%
                    </div>
                  </div>
                  <div style={{ fontSize:'1.2rem', fontWeight:800, color:'#4caf50', letterSpacing:'-0.02em' }}>₹{p.current_price}</div>
                  <div style={{ fontSize:'.68rem', color:'#3d6b40' }}>per {p.unit}</div>
                  {p.msp && <div style={{ fontSize:'.68rem', color:'#42a5f5', marginTop:4 }}>MSP: ₹{p.msp}</div>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Price Prediction */}
        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div style={{ fontWeight:700, fontSize:'.95rem', color:'#c8e6c9' }}>🔮 AI Price Prediction</div>
            <button className="btn-primary" style={{ padding:'10px 20px', fontSize:'.85rem' }} onClick={fetchPredict} disabled={predLoad}>
              {predLoad ? '⏳ Predicting...' : `Predict ${selCrop.charAt(0).toUpperCase()+selCrop.slice(1)} Prices`}
            </button>
          </div>

          {predict ? (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
                {[
                  { label:'Current Price', value:`₹${predict.current_price}`, color:'#c8e6c9' },
                  { label:'Trend', value:predict.prediction_trend, color:predict.prediction_trend==='Rising'?'#66bb6a':'#ef5350' },
                  { label:'Best Time to Sell', value:predict.best_time_to_sell, color:'#ffa726' },
                ].map(item => (
                  <div key={item.label} style={{ background:'rgba(255,255,255,.03)', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:'.65rem', color:'#4a7c4e', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontWeight:700, color:item.color, fontSize:'.9rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Daily forecast table */}
              {predict.daily_forecast?.length > 0 && (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid rgba(76,175,80,.15)' }}>
                        {['Day','Date','Predicted Price','Confidence'].map(h => (
                          <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'#4a7c4e', fontWeight:700, fontSize:'.7rem', letterSpacing:'.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {predict.daily_forecast.slice(0,7).map((d,i) => (
                        <tr key={i} style={{ borderBottom:'1px solid rgba(76,175,80,.06)' }}>
                          <td style={{ padding:'8px 12px', color:'#81c784' }}>Day {d.day}</td>
                          <td style={{ padding:'8px 12px', color:'#4a7c4e' }}>{d.date}</td>
                          <td style={{ padding:'8px 12px', color:'#4caf50', fontWeight:700 }}>₹{d.predicted_price}</td>
                          <td style={{ padding:'8px 12px', color:'#66bb6a' }}>{d.confidence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ padding:'12px 16px', background:'rgba(46,125,50,.08)', border:'1px solid rgba(76,175,80,.15)', borderRadius:10, fontSize:'.85rem', color:'#81c784' }}>
                💡 {predict.recommendation}
              </div>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:30, color:'#3d6b40', fontSize:'.85rem' }}>
              Select a crop above and click "Predict Prices" to get AI-powered price forecast
            </div>
          )}
        </Card>

        {/* Nearby Mandis */}
        <Card>
          <div style={{ fontWeight:700, fontSize:'.95rem', color:'#c8e6c9', marginBottom:16 }}>📍 Nearby Agricultural Markets</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {mandis.map(m => (
              <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(76,175,80,.1)', borderRadius:12, flexWrap:'wrap', gap:10 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:'rgba(76,175,80,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>🏪</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'.9rem', color:'#c8e6c9' }}>{m.name}</div>
                    <div style={{ fontSize:'.75rem', color:'#4a7c4e' }}>{m.address}</div>
                    {m.timing && <div style={{ fontSize:'.7rem', color:'#3d6b40', marginTop:2 }}>⏰ {m.timing}</div>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  {m.crops?.map(c => (
                    <span key={c} style={{ fontSize:'.7rem', padding:'3px 10px', borderRadius:100, background:'rgba(76,175,80,.1)', border:'1px solid rgba(76,175,80,.2)', color:'#66bb6a' }}>{c}</span>
                  ))}
                  <span style={{ fontWeight:700, fontSize:'.82rem', color:'#4caf50', flexShrink:0 }}>{m.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  )
}
