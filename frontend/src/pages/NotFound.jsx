import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'#0d1a0f', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:24, fontFamily:"'Sora',sans-serif", color:'#e8f5e9' }}>
      <div style={{ fontSize:'4rem', marginBottom:12 }}>🌾</div>
      <h1 style={{ fontSize:'4rem', fontWeight:800, color:'#4caf50', marginBottom:8 }}>404</h1>
      <p style={{ fontSize:'1.1rem', color:'#81c784', marginBottom:6 }}>This field is empty.</p>
      <p style={{ fontSize:'.85rem', color:'#4a7c4e', marginBottom:28 }}>The page you're looking for doesn't exist.</p>
      <Link to="/" style={{ background:'linear-gradient(135deg,#4caf50,#2e7d32)', color:'#fff', textDecoration:'none', padding:'12px 28px', borderRadius:100, fontWeight:700, fontSize:'.9rem' }}>← Back to Home</Link>
    </div>
  )
}
