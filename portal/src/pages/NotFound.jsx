import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24, fontFamily:"'Sora',sans-serif", color:'#e2e8f0' }}>
      <div style={{ fontSize:'4rem', marginBottom:12 }}>🏢</div>
      <h1 style={{ fontSize:'4rem', fontWeight:800, color:'#3b82f6', marginBottom:8 }}>404</h1>
      <p style={{ fontSize:'1rem', color:'#60a5fa', marginBottom:6 }}>Page not found.</p>
      <p style={{ fontSize:'.85rem', color:'#334155', marginBottom:28 }}>This portal page doesn't exist.</p>
      <Link to="/" style={{ background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', color:'#fff', textDecoration:'none', padding:'12px 28px', borderRadius:100, fontWeight:700, fontSize:'.9rem' }}>
        ← Back to Portal Home
      </Link>
    </div>
  )
}
