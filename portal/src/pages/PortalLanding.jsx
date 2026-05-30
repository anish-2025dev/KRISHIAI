import { useNavigate, Link } from 'react-router-dom'

const ROLES = [
  {
    icon: '🏢',
    title: 'Company / Buyer',
    desc: 'Post crop requirements, receive farmer applications, manage contracts and bulk purchases directly.',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,.1)',
    border: 'rgba(59,130,246,.25)',
    role: 'company',
    features: ['Post crop requirements', 'Browse farmer applications', 'Direct farmer contact', 'Manage orders'],
  },
  {
    icon: '🚛',
    title: 'Transport Provider',
    desc: 'List your vehicles, set rates and routes, get booking requests from farmers and companies.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,.1)',
    border: 'rgba(245,158,11,.25)',
    role: 'transport',
    features: ['List trucks & vehicles', 'Set routes & rates', 'Manage availability', 'Get booking requests'],
  },
  {
    icon: '🛡️',
    title: 'Insurance Provider',
    desc: 'List your crop insurance plans. Farmers can compare, contact you and purchase plans directly.',
    color: '#10b981',
    bg: 'rgba(16,185,129,.1)',
    border: 'rgba(16,185,129,.25)',
    role: 'insurance',
    features: ['Add insurance plans', 'Set premium rates', 'Define coverage', 'Get farmer inquiries'],
  },
]

export default function PortalLanding() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1a', color:'#e2e8f0', fontFamily:"'Sora',sans-serif", overflowX:'hidden' }}>

      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 32px', borderBottom:'1px solid rgba(59,130,246,.1)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
          <span style={{ fontWeight:800, fontSize:'1.1rem' }}>Krishi<span style={{ color:'#3b82f6' }}>Portal</span></span>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Link to="/login" style={{ textDecoration:'none' }}>
            <button className="btn-outline" style={{ padding:'9px 20px', fontSize:'.82rem' }}>Sign In</button>
          </Link>
          <button className="btn-primary" style={{ padding:'9px 20px', fontSize:'.82rem' }} onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding:'80px 24px 60px', textAlign:'center', position:'relative' }}>
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,.15) 0%,transparent 70%)', top:'0%', left:'50%', transform:'translateX(-50%)', filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.25)', borderRadius:100, padding:'6px 16px', marginBottom:28, fontSize:'.75rem', color:'#93c5fd', fontWeight:700, letterSpacing:'.1em' }}>
            🌿 KRISHIAI BUSINESS PORTAL
          </div>
          <h1 style={{ fontSize:'clamp(2.2rem,5vw,4rem)', fontWeight:800, lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:16 }}>
            Connect with<br />
            <span style={{ background:'linear-gradient(135deg,#60a5fa,#3b82f6,#1d4ed8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              140M Indian Farmers
            </span>
          </h1>
          <p style={{ fontSize:'1.05rem', color:'#475569', maxWidth:520, margin:'0 auto 36px', lineHeight:1.7 }}>
            The dedicated portal for companies, transporters and insurance providers to connect directly with farmers across India.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn-primary" style={{ padding:'14px 32px', fontSize:'1rem' }} onClick={() => navigate('/register')}>
              🚀 Register Your Business
            </button>
            <Link to="/login" style={{ textDecoration:'none' }}>
              <button className="btn-outline" style={{ padding:'13px 28px', fontSize:'1rem' }}>Sign In →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ROLE CARDS */}
      <section style={{ padding:'20px 24px 80px', maxWidth:1000, margin:'0 auto' }}>
        <p style={{ textAlign:'center', fontSize:'.72rem', fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'#3b82f6', marginBottom:12 }}>Choose Your Role</p>
        <h2 style={{ textAlign:'center', fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:800, marginBottom:40, letterSpacing:'-0.02em' }}>
          Which best describes your business?
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          {ROLES.map(r => (
            <div key={r.role} className="card" style={{ padding:28, border:`1px solid ${r.border}`, background:r.bg, cursor:'pointer' }}
              onClick={() => navigate(`/register?role=${r.role}`)}>
              <div style={{ fontSize:'2.5rem', marginBottom:14 }}>{r.icon}</div>
              <h3 style={{ fontSize:'1.1rem', fontWeight:800, color:'#e2e8f0', marginBottom:8 }}>{r.title}</h3>
              <p style={{ fontSize:'.83rem', color:'#475569', lineHeight:1.6, marginBottom:16 }}>{r.desc}</p>
              <ul style={{ listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:6 }}>
                {r.features.map(f => (
                  <li key={f} style={{ fontSize:'.78rem', color:r.color, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:'.6rem' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button style={{ marginTop:20, width:'100%', padding:'11px', borderRadius:100, border:`1px solid ${r.color}`, background:`rgba(${r.color==='#3b82f6'?'59,130,246':r.color==='#f59e0b'?'245,158,11':'16,185,129'},.15)`, color:r.color, fontWeight:700, fontSize:'.85rem', cursor:'pointer', fontFamily:"'Sora',sans-serif", transition:'all .2s' }}>
                Register as {r.title} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding:'40px 24px 80px', background:'rgba(15,23,42,.5)', borderTop:'1px solid rgba(59,130,246,.08)' }}>
        <div style={{ maxWidth:800, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16 }}>
          {[
            { value:'140M+', label:'Farmers on Platform' },
            { value:'28',    label:'States Covered' },
            { value:'Free',  label:'Registration' },
            { value:'24/7',  label:'Platform Access' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', padding:'24px 16px', background:'rgba(15,23,42,.8)', border:'1px solid rgba(59,130,246,.15)', borderRadius:14 }}>
              <div style={{ fontSize:'2rem', fontWeight:800, color:'#3b82f6', marginBottom:6 }}>{s.value}</div>
              <div style={{ fontSize:'.8rem', color:'#475569' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(59,130,246,.1)', padding:'24px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <span style={{ fontWeight:800, color:'#e2e8f0' }}>Krishi<span style={{ color:'#3b82f6' }}>Portal</span></span>
        <p style={{ fontSize:'.75rem', color:'#334155' }}>© 2026 KrishiAI · Business Portal</p>
        <a href="https://krishiai-mocha.vercel.app" target="_blank" rel="noreferrer" style={{ fontSize:'.78rem', color:'#4ade80', textDecoration:'none', fontWeight:600 }}>
          🌾 Farmer App ↗
        </a>
      </footer>
    </div>
  )
}
