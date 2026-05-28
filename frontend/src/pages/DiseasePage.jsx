import { useState, useRef } from 'react'
import Layout from '../components/Layout'
import API from '../utils/api'

export default function DiseasePage() {
  const [image,    setImage]    = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [history,  setHistory]  = useState([])
  const fileRef = useRef()

  const onFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setResult(null)
    setError('')
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!image) return
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('image', image)
      const { data } = await API.post('/disease/detect', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data.analysis)
    } catch (e) {
      setError(e.response?.data?.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const SCOLOR = { Low:'#66bb6a', Medium:'#ffa726', High:'#ef5350', Critical:'#b71c1c' }

  return (
    <Layout>
      <div style={{ maxWidth:860, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'#c8e6c9', marginBottom:4 }}>🔬 Crop Disease Detection</h1>
          <p style={{ color:'#4a7c4e', fontSize:'.85rem' }}>Upload a photo of your crop leaf or plant — AI will detect disease, severity, and give treatment advice</p>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileRef.current.click()}
          style={{ border:`2px dashed ${preview?'#4caf50':'rgba(76,175,80,.3)'}`, borderRadius:20, padding:preview?0:40, textAlign:'center', cursor:'pointer', transition:'all .3s', background: preview?'transparent':'rgba(27,45,28,.3)', overflow:'hidden', minHeight: preview?200:160 }}
        >
          {preview ? (
            <img src={preview} alt="Crop" style={{ width:'100%', maxHeight:320, objectFit:'cover', borderRadius:18 }} />
          ) : (
            <>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>📸</div>
              <div style={{ color:'#66bb6a', fontWeight:700, marginBottom:6 }}>Click to upload crop photo</div>
              <div style={{ color:'#3d6b40', fontSize:'.8rem' }}>JPG, PNG, WEBP · Max 5MB</div>
              <div style={{ marginTop:12, fontSize:'.78rem', color:'#2d4d2e' }}>Works best with: leaf close-ups, stem damage, fruit discoloration</div>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display:'none' }} />

        {/* Action buttons */}
        {image && (
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-primary" style={{ flex:1, padding:'14px', fontSize:'1rem' }} onClick={analyze} disabled={loading}>
              {loading ? '🔬 Analyzing with AI...' : '🔬 Detect Disease'}
            </button>
            <button className="btn-outline" style={{ padding:'14px 20px' }} onClick={() => { setImage(null); setPreview(null); setResult(null) }}>
              🗑️ Clear
            </button>
          </div>
        )}

        {error && <div style={{ background:'rgba(229,57,53,.1)', border:'1px solid rgba(229,57,53,.3)', borderRadius:12, padding:'12px 16px', color:'#ef5350' }}>⚠️ {error}</div>}

        {/* Results */}
        {result && (
          <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeUp .5s ease' }}>
            {/* Summary card */}
            <div className="card" style={{ padding:24 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:'.72rem', color:'#66bb6a', fontWeight:700, letterSpacing:'.1em', marginBottom:4 }}>DETECTED CROP</div>
                  <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#c8e6c9' }}>{result.crop_name} <span style={{ fontSize:'1rem', color:'#4a7c4e' }}>{result.crop_hindi}</span></div>
                  <div style={{ fontSize:'1.1rem', fontWeight:700, color: result.is_healthy?'#66bb6a':'#ef5350', marginTop:4 }}>
                    {result.is_healthy ? '✅ Healthy Plant' : `⚠️ ${result.disease_name}`}
                  </div>
                  {result.disease_hindi && !result.is_healthy && (
                    <div style={{ fontSize:'.85rem', color:'#81c784' }}>{result.disease_hindi}</div>
                  )}
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'2rem', fontWeight:800, color: SCOLOR[result.severity] || '#66bb6a' }}>{result.severity_score}/10</div>
                  <div style={{ fontSize:'.7rem', color:'#4a7c4e', marginBottom:6 }}>Severity Score</div>
                  <div style={{ padding:'4px 12px', borderRadius:100, fontSize:'.75rem', fontWeight:700, background:`rgba(${result.severity==='High'||result.severity==='Critical'?'229,57,53':result.severity==='Medium'?'255,143,0':'76,175,80'},.15)`, color: SCOLOR[result.severity]||'#66bb6a', border:`1px solid ${SCOLOR[result.severity]||'#66bb6a'}40` }}>
                    {result.severity || 'Healthy'}
                  </div>
                  <div style={{ fontSize:'.7rem', color:'#4a7c4e', marginTop:6 }}>{result.confidence}% confidence</div>
                </div>
              </div>

              {/* Severity bar */}
              {!result.is_healthy && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ height:8, background:'rgba(76,175,80,.1)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${result.severity_score*10}%`, background: SCOLOR[result.severity]||'#ef5350', borderRadius:4, transition:'width 1s ease' }} />
                  </div>
                </div>
              )}

              {/* Symptoms */}
              {result.symptoms?.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:'.78rem', fontWeight:700, color:'#66bb6a', marginBottom:8, letterSpacing:'.05em' }}>SYMPTOMS OBSERVED</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {result.symptoms.map(s => (
                      <span key={s} style={{ background:'rgba(229,57,53,.08)', border:'1px solid rgba(229,57,53,.2)', borderRadius:100, padding:'4px 12px', fontSize:'.78rem', color:'#ef9a9a' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.spread_risk && (
                <div style={{ padding:'10px 14px', background:'rgba(255,143,0,.08)', border:'1px solid rgba(255,143,0,.2)', borderRadius:10, fontSize:'.82rem', color:'#ffa726' }}>
                  🔄 Spread Risk: {result.spread_risk}
                </div>
              )}
            </div>

            {/* Treatment */}
            {!result.is_healthy && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="card" style={{ padding:20 }}>
                  <div style={{ fontSize:'.78rem', fontWeight:700, color:'#66bb6a', marginBottom:12, letterSpacing:'.05em' }}>🌿 ORGANIC TREATMENT</div>
                  <ul style={{ display:'flex', flexDirection:'column', gap:8, paddingLeft:0, listStyle:'none' }}>
                    {result.organic_treatment?.map(t => (
                      <li key={t} style={{ fontSize:'.82rem', color:'#a5d6a7', lineHeight:1.5, paddingLeft:16, position:'relative' }}>
                        <span style={{ position:'absolute', left:0, color:'#4caf50' }}>•</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card" style={{ padding:20 }}>
                  <div style={{ fontSize:'.78rem', fontWeight:700, color:'#ffa726', marginBottom:12, letterSpacing:'.05em' }}>⚗️ CHEMICAL TREATMENT</div>
                  <ul style={{ display:'flex', flexDirection:'column', gap:8, paddingLeft:0, listStyle:'none' }}>
                    {result.chemical_treatment?.map(t => (
                      <li key={t} style={{ fontSize:'.82rem', color:'#ffcc80', lineHeight:1.5, paddingLeft:16, position:'relative' }}>
                        <span style={{ position:'absolute', left:0, color:'#ffa726' }}>•</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Immediate action */}
            {result.immediate_action && (
              <div style={{ background:'rgba(229,57,53,.08)', border:'1px solid rgba(229,57,53,.25)', borderRadius:14, padding:'16px 20px', display:'flex', gap:12, alignItems:'flex-start' }}>
                <span style={{ fontSize:'1.3rem', flexShrink:0 }}>🚨</span>
                <div>
                  <div style={{ fontWeight:700, color:'#ef5350', marginBottom:4 }}>Immediate Action Required</div>
                  <div style={{ fontSize:'.85rem', color:'#ef9a9a', lineHeight:1.5 }}>{result.immediate_action}</div>
                </div>
              </div>
            )}

            {result.government_helpline && (
              <div style={{ background:'rgba(66,165,245,.08)', border:'1px solid rgba(66,165,245,.2)', borderRadius:12, padding:'12px 16px', fontSize:'.82rem', color:'#90caf9' }}>
                📞 {result.government_helpline}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
