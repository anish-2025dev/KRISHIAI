import { useState } from 'react'
import Layout from '../components/Layout'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'

const SOILS   = ['Loamy','Sandy','Clay','Silty','Black (Regur)','Red','Alluvial','Laterite']
const SEASONS = ['Kharif (Monsoon)','Rabi (Winter)','Zaid (Summer)']
const WATER   = ['Low (Rain-fed)','Medium (Well/Borewell)','High (Canal/River)']
const STATES  = ['Rajasthan','Punjab','Haryana','Uttar Pradesh','Madhya Pradesh','Maharashtra','Gujarat','Bihar','West Bengal','Andhra Pradesh','Karnataka','Tamil Nadu']

const RISK_COLOR = { Low:'#66bb6a', Medium:'#ffa726', High:'#ef5350' }
const DEMAND_COLOR = { High:'#66bb6a', Medium:'#ffa726', Low:'#ef5350' }

export default function CropRecommendPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    soil_type:         user?.soil_type || 'Loamy',
    location:          user?.location?.state || 'Rajasthan',
    water_availability:'Medium (Well/Borewell)',
    budget:            '20000',
    land_acres:        user?.land_acres?.toString() || '2',
    season:            'Rabi (Winter)',
  })
  const [crops,   setCrops]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [selected, setSelected] = useState(null)
  const [yieldData, setYieldData] = useState(null)
  const [yieldLoad, setYieldLoad] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const recommend = async () => {
    setLoading(true)
    setError('')
    setCrops([])
    setSelected(null)
    setYieldData(null)
    try {
      const { data } = await API.post('/ai/crop-recommend', form)
      setCrops(data.crops)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to get recommendations. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const predictYield = async (crop) => {
    setSelected(crop)
    setYieldLoad(true)
    setYieldData(null)
    try {
      const { data } = await API.post('/ai/yield-predict', {
        crop:       crop.crop,
        land_acres: form.land_acres,
        soil_type:  form.soil_type,
        irrigation: form.water_availability,
        location:   form.location,
        season:     form.season,
      })
      setYieldData(data.prediction)
    } catch (e) {
      console.error(e)
    } finally {
      setYieldLoad(false)
    }
  }

  const labelStyle = { display:'block', fontSize:'.72rem', fontWeight:700, color:'#66bb6a', marginBottom:6, letterSpacing:'.07em', textTransform:'uppercase' }
  const Card = ({ children, style = {} }) => (
    <div className="card" style={{ padding:20, ...style }}>{children}</div>
  )

  return (
    <Layout>
      <div style={{ maxWidth:960, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'#c8e6c9', marginBottom:4 }}>🌱 AI Crop Recommendation</h1>
          <p style={{ color:'#4a7c4e', fontSize:'.85rem' }}>Fill in your farm details — Gemini AI will suggest the best crops with profit estimates</p>
        </div>

        {/* Input form */}
        <Card>
          <div style={{ fontWeight:700, fontSize:'.9rem', color:'#c8e6c9', marginBottom:18 }}>📋 Your Farm Details</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
            <div>
              <label style={labelStyle}>Soil Type</label>
              <select className="input-field" value={form.soil_type} onChange={e => set('soil_type', e.target.value)}>
                {SOILS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>State / Location</label>
              <select className="input-field" value={form.location} onChange={e => set('location', e.target.value)}>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Season</label>
              <select className="input-field" value={form.season} onChange={e => set('season', e.target.value)}>
                {SEASONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Water Availability</label>
              <select className="input-field" value={form.water_availability} onChange={e => set('water_availability', e.target.value)}>
                {WATER.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Land Area (Acres)</label>
              <input className="input-field" type="number" placeholder="e.g. 3.5" value={form.land_acres} onChange={e => set('land_acres', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Budget (₹)</label>
              <input className="input-field" type="number" placeholder="e.g. 20000" value={form.budget} onChange={e => set('budget', e.target.value)} />
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ width:'100%', padding:'15px', fontSize:'1rem', marginTop:20 }}
            onClick={recommend}
            disabled={loading}
          >
            {loading ? '🤖 Gemini AI is analyzing your farm...' : '🌱 Get AI Crop Recommendations'}
          </button>
        </Card>

        {error && (
          <div style={{ background:'rgba(229,57,53,.1)', border:'1px solid rgba(229,57,53,.3)', borderRadius:12, padding:'14px 18px', color:'#ef5350' }}>⚠️ {error}</div>
        )}

        {/* Loading animation */}
        {loading && (
          <Card style={{ textAlign:'center', padding:40 }}>
            <div style={{ fontSize:'3rem', marginBottom:12, animation:'spin 2s linear infinite', display:'inline-block' }}>🌿</div>
            <div style={{ color:'#66bb6a', fontWeight:700, marginBottom:6 }}>Analyzing your farm with Gemini AI...</div>
            <div style={{ color:'#4a7c4e', fontSize:'.82rem' }}>Checking soil, season, water, budget & market demand</div>
          </Card>
        )}

        {/* Results */}
        {crops.length > 0 && (
          <>
            <div style={{ fontWeight:700, fontSize:'1rem', color:'#c8e6c9' }}>
              ✅ Top {crops.length} Recommendations for your farm
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {crops.map((crop, i) => (
                <div
                  key={crop.crop}
                  className="card"
                  style={{ padding:0, overflow:'hidden', border:`1px solid ${selected?.crop===crop.crop?'#4caf50':'rgba(76,175,80,.15)'}`, cursor:'pointer' }}
                  onClick={() => predictYield(crop)}
                >
                  {/* Rank banner */}
                  <div style={{ height:4, background: i===0?'linear-gradient(90deg,#4caf50,#81c784)':i===1?'linear-gradient(90deg,#ffa726,#ffe082)':'rgba(76,175,80,.2)' }} />

                  <div style={{ padding:20 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                      {/* Left */}
                      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                        <div style={{ width:48, height:48, borderRadius:14, background:'rgba(76,175,80,.1)', border:'1px solid rgba(76,175,80,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0 }}>🌾</div>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                            <span style={{ fontWeight:800, fontSize:'1.1rem', color:'#c8e6c9' }}>{crop.crop}</span>
                            {crop.hindi_name && <span style={{ fontSize:'.9rem', color:'#66bb6a' }}>{crop.hindi_name}</span>}
                            {i === 0 && <span style={{ fontSize:'.65rem', fontWeight:700, background:'rgba(76,175,80,.2)', border:'1px solid rgba(76,175,80,.4)', borderRadius:100, padding:'2px 8px', color:'#81c784' }}>⭐ BEST MATCH</span>}
                          </div>
                          <div style={{ fontSize:'.82rem', color:'#4a7c4e', marginBottom:8 }}>{crop.reason}</div>
                          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                            <span style={{ fontSize:'.72rem', padding:'3px 10px', borderRadius:100, fontWeight:600, background:`rgba(${RISK_COLOR[crop.risk_level]==='#66bb6a'?'76,175,80':crop.risk_level==='Medium'?'255,143,0':'229,57,53'},.12)`, color:RISK_COLOR[crop.risk_level]||'#66bb6a', border:`1px solid ${RISK_COLOR[crop.risk_level]||'#66bb6a'}40` }}>
                              Risk: {crop.risk_level}
                            </span>
                            <span style={{ fontSize:'.72rem', padding:'3px 10px', borderRadius:100, fontWeight:600, background:`rgba(${DEMAND_COLOR[crop.market_demand]==='#66bb6a'?'76,175,80':crop.market_demand==='Medium'?'255,143,0':'229,57,53'},.12)`, color:DEMAND_COLOR[crop.market_demand]||'#66bb6a', border:`1px solid ${DEMAND_COLOR[crop.market_demand]||'#66bb6a'}40` }}>
                              Demand: {crop.market_demand}
                            </span>
                            <span style={{ fontSize:'.72rem', padding:'3px 10px', borderRadius:100, fontWeight:600, background:'rgba(66,165,245,.1)', color:'#90caf9', border:'1px solid rgba(66,165,245,.2)' }}>
                              💧 {crop.water_requirement}
                            </span>
                            <span style={{ fontSize:'.72rem', padding:'3px 10px', borderRadius:100, fontWeight:600, background:'rgba(156,39,176,.1)', color:'#ce93d8', border:'1px solid rgba(156,39,176,.2)' }}>
                              ⏱ {crop.harvest_days} days
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right - profit + score */}
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#4caf50', letterSpacing:'-0.02em' }}>{crop.estimated_profit}</div>
                        <div style={{ fontSize:'.7rem', color:'#3d6b40', marginBottom:8 }}>estimated profit</div>
                        {/* Match score donut */}
                        <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end' }}>
                          <div style={{ fontSize:'.7rem', color:'#4a7c4e' }}>Match</div>
                          <div style={{ width:44, height:44, borderRadius:'50%', background:`conic-gradient(#4caf50 ${crop.match_score*3.6}deg, rgba(76,175,80,.1) 0deg)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <div style={{ width:34, height:34, borderRadius:'50%', background:'#101c11', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.6rem', fontWeight:800, color:'#66bb6a' }}>{crop.match_score}%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* More details */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginTop:16, paddingTop:16, borderTop:'1px solid rgba(76,175,80,.08)' }}>
                      {[
                        { label:'Best Month to Sow', value:crop.best_month_to_sow },
                        { label:'Expected Yield', value:crop.expected_yield },
                        { label:'Fertilizer', value:crop.fertilizer_needed },
                        { label:'Govt Support', value:crop.government_support || 'Check local office' },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ fontSize:'.65rem', color:'#3d6b40', fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:3 }}>{item.label}</div>
                          <div style={{ fontSize:'.8rem', color:'#a5d6a7', fontWeight:600 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop:12, fontSize:'.75rem', color:'#3d6b40', textAlign:'center' }}>
                      {selected?.crop === crop.crop ? '▲ Click to collapse yield prediction' : '▼ Click for detailed yield & profit prediction'}
                    </div>
                  </div>

                  {/* Yield prediction panel */}
                  {selected?.crop === crop.crop && (
                    <div style={{ borderTop:'1px solid rgba(76,175,80,.15)', padding:20, background:'rgba(16,28,17,.6)' }}>
                      {yieldLoad ? (
                        <div style={{ textAlign:'center', padding:20, color:'#66bb6a' }}>🔮 AI predicting yield & revenue...</div>
                      ) : yieldData ? (
                        <div>
                          <div style={{ fontWeight:700, fontSize:'.85rem', color:'#66bb6a', marginBottom:14 }}>📊 Detailed Yield & Profit Prediction</div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10 }}>
                            {[
                              { label:'Expected Yield', value:`${yieldData.expected_yield_quintals} qt`, color:'#4caf50' },
                              { label:'Revenue', value:yieldData.estimated_revenue, color:'#4caf50' },
                              { label:'Input Cost', value:yieldData.estimated_cost, color:'#ef5350' },
                              { label:'Net Profit', value:yieldData.estimated_profit, color:'#66bb6a' },
                              { label:'Margin', value:yieldData.profit_margin, color:'#ffa726' },
                              { label:'Best Sell Month', value:yieldData.best_sell_month, color:'#42a5f5' },
                            ].map(item => (
                              <div key={item.label} style={{ background:'rgba(255,255,255,.03)', borderRadius:10, padding:'12px', textAlign:'center' }}>
                                <div style={{ fontSize:'.62rem', color:'#3d6b40', fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:4 }}>{item.label}</div>
                                <div style={{ fontWeight:800, color:item.color, fontSize:'.95rem' }}>{item.value}</div>
                              </div>
                            ))}
                          </div>
                          {yieldData.tips_to_increase_yield?.length > 0 && (
                            <div style={{ marginTop:14 }}>
                              <div style={{ fontSize:'.72rem', color:'#66bb6a', fontWeight:700, marginBottom:8, letterSpacing:'.06em' }}>💡 TIPS TO INCREASE YIELD</div>
                              {yieldData.tips_to_increase_yield.map(t => (
                                <div key={t} style={{ fontSize:'.8rem', color:'#a5d6a7', padding:'6px 0', borderBottom:'1px solid rgba(76,175,80,.07)', display:'flex', gap:8 }}>
                                  <span style={{ color:'#4caf50', flexShrink:0 }}>→</span>{t}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </Layout>
  )
}
