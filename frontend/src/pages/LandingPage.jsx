import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const MODULES = [
  { icon:'🌦️', title:'AI Weather Intelligence',       desc:'7-day forecast, heatwave & flood alerts, AI farming tips tailored to your location.' },
  { icon:'🌱', title:'Crop Recommendation Engine',    desc:'Input soil, budget & season — get top crops with profit estimates & yield predictions.' },
  { icon:'🔬', title:'AI Disease Detection',          desc:'Upload a leaf photo. Gemini Vision detects disease, severity score & treatment plan instantly.' },
  { icon:'🏪', title:'Farmer-to-Company Marketplace', desc:'Connect directly with verified companies. Apply for supply contracts. No middlemen.' },
  { icon:'📜', title:'Digital Contract Farming',      desc:'Legally binding agreements with digital signatures, delivery terms & PDF export.' },
  { icon:'🛡️', title:'Crop Insurance Marketplace',   desc:'Compare insurance providers, estimate premiums, analyze risk & file claims digitally.' },
  { icon:'🚜', title:'Equipment Rental',              desc:'Find tractors, harvesters & drones nearby. Book instantly with scheduling support.' },
  { icon:'🤖', title:'AI Farming Chatbot',            desc:'Speak in Hindi, English, or Hinglish. Voice-friendly step-by-step farming guidance.' },
  { icon:'📊', title:'Smart Market & Mandi',          desc:'Live crop prices, AI price predictions, nearby mandi finder & transport cost estimates.' },
]

const STATS = [
  { value:'140M+', label:'Farmers in India' },
  { value:'₹50K',  label:'Avg loss from middlemen/season' },
  { value:'30%',   label:'Crop loss due to disease & poor info' },
  { value:'1',     label:'Unified platform to solve it all' },
]

const ROLES = ['Farmers','Companies','Insurers','Transporters','Equipment Owners','Agri Experts']

export default function LandingPage() {
  const navigate     = useNavigate()
  const [role, setRole]     = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const cardRefs = useRef([])
  const [visible, setVisible] = useState(new Set())

  useEffect(() => {
    const t = setInterval(() => setRole(r => (r + 1) % ROLES.length), 2000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setVisible(prev => new Set([...prev, e.target.dataset.index])) }),
      { threshold: 0.15 }
    )
    cardRefs.current.forEach(r => r && observer.observe(r))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ background:'#0d1a0f', color:'#e8f5e9', minHeight:'100vh', overflowX:'hidden', fontFamily:"'Sora',sans-serif" }}>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'16px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'all .4s', ...(scrolled ? { background:'rgba(13,26,15,.92)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(76,175,80,.1)' } : {}) }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
          <span style={{ fontWeight:800, fontSize:'1.1rem', color:'#e8f5e9' }}>Krishi<span style={{ color:'#66bb6a' }}>AI</span></span>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <Link to="/login" style={{ textDecoration:'none' }}><button className="btn-outline" style={{ padding:'9px 20px', fontSize:'.82rem' }}>Sign In</button></Link>
          <button className="btn-primary" style={{ padding:'9px 20px', fontSize:'.82rem' }} onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'120px 24px 80px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(46,125,50,.25) 0%,transparent 70%)', top:'10%', left:'50%', transform:'translateX(-50%)', filter:'blur(60px)', pointerEvents:'none' }} />

        {/* Live badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(46,125,50,.15)', border:'1px solid rgba(76,175,80,.3)', borderRadius:100, padding:'6px 16px', marginBottom:32, position:'relative', zIndex:2 }}>
          <div style={{ position:'relative', width:8, height:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#4caf50' }} />
            <div className="pulse-ring" style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid #4caf50' }} />
          </div>
          <span style={{ fontSize:'.72rem', color:'#81c784', fontWeight:700, letterSpacing:'.1em' }}>NOW IN EARLY ACCESS · 9+ AI MODULES LIVE</span>
        </div>

        <div style={{ position:'relative', zIndex:2, maxWidth:800 }}>
          <p style={{ marginBottom:12, color:'#558b57' }}>
            <span className="devanagari" style={{ fontSize:'1.3rem', color:'#66bb6a' }}>कृषि</span> · Smart India Agriculture
          </p>
          <h1 style={{ fontSize:'clamp(2.8rem,7vw,5.5rem)', fontWeight:800, lineHeight:1.05, letterSpacing:'-0.03em', marginBottom:20 }}>
            India's Most Complete<br />
            <span className="gradient-text">AI Farming Ecosystem</span>
          </h1>
          <p style={{ fontSize:'clamp(.95rem,2vw,1.15rem)', color:'#6a9e6d', maxWidth:560, margin:'0 auto 20px', lineHeight:1.7 }}>
            From seed to sale — connecting farmers with AI, markets, insurance, equipment & companies on one platform.
          </p>

          {/* Role badges */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', marginBottom:36 }}>
            {ROLES.map((r, i) => (
              <span key={r} className={`role-badge ${i === role ? 'active' : 'inactive'}`}>{r}</span>
            ))}
          </div>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn-primary" style={{ fontSize:'1.05rem', padding:'16px 36px' }} onClick={() => navigate('/register')}>
              🌱 Start for Free
            </button>
            <Link to="/login" style={{ textDecoration:'none' }}>
              <button className="btn-outline" style={{ fontSize:'1.05rem', padding:'15px 32px' }}>Sign In →</button>
            </Link>
          </div>
          <p style={{ marginTop:16, fontSize:'.75rem', color:'#3d5c3e' }}>No credit card · Hindi & English · Real AI</p>
        </div>

        {/* Mini dashboard preview */}
        <div className="animate-float" style={{ marginTop:64, position:'relative', zIndex:2, width:'100%', maxWidth:800, padding:'0 16px' }}>
          <div style={{ background:'linear-gradient(160deg,rgba(27,45,28,.95),rgba(16,28,17,.98))', border:'1px solid rgba(76,175,80,.2)', borderRadius:22, padding:'24px 28px', backdropFilter:'blur(20px)', boxShadow:'0 40px 100px rgba(0,0,0,.6)' }}>
            <div style={{ display:'flex', gap:8, marginBottom:18 }}>
              {['#ff5f57','#ffbd2e','#28c840'].map(c => <div key={c} style={{ width:12, height:12, borderRadius:'50%', background:c }} />)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {[
                { icon:'🌡️', label:'Weather', value:'32°C · Sunny', color:'#ff8f00' },
                { icon:'🌾', label:'Top Crop', value:'Wheat · ₹2,275/q', color:'#4caf50' },
                { icon:'⚠️', label:'AI Alert', value:'Blight Risk: Low', color:'#66bb6a' },
                { icon:'📈', label:'Market', value:'+8.4% this week', color:'#42a5f5' },
              ].map(item => (
                <div key={item.label} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.05)', borderRadius:12, padding:'14px 12px' }}>
                  <div style={{ fontSize:'1.3rem', marginBottom:8 }}>{item.icon}</div>
                  <div style={{ fontSize:'.6rem', color:'#4a7c4e', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:3 }}>{item.label}</div>
                  <div style={{ fontSize:'.8rem', color:item.color, fontWeight:700 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap" style={{ padding:'18px 0', borderTop:'1px solid rgba(76,175,80,.08)', borderBottom:'1px solid rgba(76,175,80,.08)', background:'rgba(16,26,17,.8)' }}>
        <div className="ticker-line">
          {[0,1].map(pass => (
            <div key={pass} style={{ display:'flex', gap:48, alignItems:'center' }}>
              {['AI Crop Recommendation','Disease Detection','Contract Farming','Insurance Marketplace','Equipment Rental','Mandi Price Tracker','Weather AI','Transport Booking','Government Schemes'].map(t => (
                <span key={`${pass}-${t}`} style={{ color:'#3d6b40', fontSize:'.78rem', fontWeight:600, letterSpacing:'.06em', display:'flex', alignItems:'center', gap:10, whiteSpace:'nowrap' }}>
                  <span style={{ color:'#4caf50', fontSize:8 }}>◆</span> {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{ padding:'80px 24px', maxWidth:1000, margin:'0 auto' }}>
        <p className="section-label" style={{ textAlign:'center' }}>The Problem We Solve</p>
        <h2 style={{ textAlign:'center', fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:800, marginBottom:48, letterSpacing:'-0.02em' }}>
          Indian farming is <span style={{ color:'#ef5350' }}>broken.</span><br />We're fixing it with AI.
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background:'rgba(16,28,17,.6)', border:'1px solid rgba(76,175,80,.2)', borderRadius:16, padding:'28px 20px', textAlign:'center', backdropFilter:'blur(8px)' }}>
              <div style={{ fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:800, color:'#4caf50', letterSpacing:'-0.03em', marginBottom:8 }}>{s.value}</div>
              <div style={{ fontSize:'.85rem', color:'#558b57', lineHeight:1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section style={{ padding:'80px 24px', background:'rgba(10,20,11,.6)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <p className="section-label" style={{ textAlign:'center' }}>What's Inside</p>
          <h2 style={{ textAlign:'center', fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:800, marginBottom:10, letterSpacing:'-0.02em' }}>
            Everything a farmer needs,<br /><span style={{ color:'#66bb6a' }}>in one ecosystem</span>
          </h2>
          <p style={{ textAlign:'center', color:'#4a7c4e', marginBottom:48, fontSize:'.9rem' }}>9 live AI modules · more coming soon</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 }}>
            {MODULES.map((m, i) => (
              <div
                key={m.title}
                className={`module-card ${visible.has(String(i)) ? 'visible' : ''}`}
                data-index={i}
                ref={el => cardRefs.current[i] = el}
                style={{ padding:'26px 22px', transitionDelay:`${(i % 3) * 70}ms` }}
              >
                <div style={{ fontSize:'2rem', marginBottom:14 }}>{m.icon}</div>
                <h3 style={{ fontSize:'.95rem', fontWeight:700, marginBottom:8, color:'#c8e6c9' }}>{m.title}</h3>
                <p style={{ fontSize:'.82rem', color:'#4a7c4e', lineHeight:1.65 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'100px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(46,125,50,.2) 0%,transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ fontSize:'3.5rem', marginBottom:16 }}>🌾</div>
          <h2 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, marginBottom:14, letterSpacing:'-0.03em', lineHeight:1.1 }}>
            Join the future of<br /><span style={{ color:'#66bb6a' }}>Indian Agriculture</span>
          </h2>
          <p style={{ color:'#4a7c4e', fontSize:'1rem', marginBottom:36, maxWidth:460, margin:'0 auto 36px' }}>
            Farmers, companies, and agri-experts transforming India's farming with AI.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn-primary" style={{ fontSize:'1.1rem', padding:'18px 44px' }} onClick={() => navigate('/register')}>
              🚀 Create Free Account
            </button>
            <Link to="/login" style={{ textDecoration:'none' }}>
              <button className="btn-outline" style={{ fontSize:'1rem', padding:'17px 36px' }}>Sign In</button>
            </Link>
          </div>
          <p style={{ marginTop:18, fontSize:'.75rem', color:'#2d4d2e' }}>Hindi · English · Hinglish · Real Gemini AI</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(76,175,80,.1)', padding:'28px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, background:'rgba(10,18,11,.8)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🌿</div>
          <span style={{ fontWeight:800, color:'#e8f5e9', fontSize:'.95rem' }}>KrishiAI</span>
        </div>
        <p style={{ color:'#2d4d2e', fontSize:'.75rem' }}>© 2026 KrishiAI · Empowering Indian Farmers with AI</p>
        <div style={{ display:'flex', gap:20 }}>
          {['Privacy','Terms','Contact'].map(l => (
            <span key={l} style={{ color:'#3d6b40', fontSize:'.78rem', cursor:'pointer', fontWeight:500 }}>{l}</span>
          ))}
        </div>
      </footer>

      <style>{`.role-badge{display:inline-block;padding:5px 16px;border-radius:100px;font-size:.78rem;font-weight:600;letter-spacing:.07em;border:1px solid;transition:all .3s}.role-badge.active{background:rgba(76,175,80,.2);border-color:#4caf50;color:#81c784}.role-badge.inactive{background:transparent;border-color:rgba(76,175,80,.2);color:#558b57}`}</style>
    </div>
  )
}
