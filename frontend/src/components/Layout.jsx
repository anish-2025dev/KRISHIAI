import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { icon:'🏠', label:'Dashboard',  path:'/dashboard' },
  { icon:'🌦️', label:'Weather',    path:'/weather' },
  { icon:'🌱', label:'Crop AI',    path:'/crops' },
  { icon:'🔬', label:'Disease',    path:'/disease' },
  { icon:'📊', label:'Market',     path:'/market' },
  { icon:'🤖', label:'AI Chat',    path:'/chat' },
  { icon:'👤', label:'Profile',    path:'/profile' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0d1a0f', fontFamily:"'Sora',sans-serif", color:'#e8f5e9', overflow:'hidden' }}>

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside style={{
        width:220, flexShrink:0,
        background:'rgba(13,20,14,.98)',
        borderRight:'1px solid rgba(76,175,80,.1)',
        display:'flex', flexDirection:'column', padding:'18px 10px',
        position:'fixed', top:0, left:0, bottom:0, zIndex:50,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform .28s ease',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8, marginBottom:20, padding:'0 6px' }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🌿</div>
          <span style={{ fontWeight:800, fontSize:'1rem', color:'#e8f5e9' }}>Krishi<span style={{ color:'#66bb6a' }}>AI</span></span>
        </Link>

        {/* Farmer info */}
        {user && (
          <div style={{ background:'rgba(46,125,50,.1)', border:'1px solid rgba(76,175,80,.15)', borderRadius:12, padding:'10px 12px', marginBottom:16 }}>
            <div style={{ fontSize:'1.3rem', marginBottom:3 }}>👨‍🌾</div>
            <div style={{ fontWeight:700, fontSize:'.82rem', color:'#c8e6c9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
            <div style={{ fontSize:'.68rem', color:'#4a7c4e' }}>{user.land_acres || 0} ac · {user.location?.state || 'India'}</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>
          {NAV.map(item => (
            <Link key={item.path} to={item.path}
              className={`sidebar-link ${location.pathname===item.path?'active':''}`}
              onClick={() => setOpen(false)}>
              <span style={{ fontSize:'.95rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button onClick={handleLogout}
          style={{ background:'rgba(229,57,53,.08)', border:'1px solid rgba(229,57,53,.18)', borderRadius:10, padding:'9px 12px', color:'#ef9a9a', fontSize:'.82rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8, marginTop:10, fontFamily:"'Sora',sans-serif" }}>
          🚪 Logout
        </button>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:40 }} />
      )}

      {/* Desktop sidebar always visible */}
      <style>{`
        @media(min-width:768px){
          aside{ transform:translateX(0) !important; position:sticky !important; height:100vh; }
          .hide-desktop{ display:none !important; }
        }
        @media(max-width:767px){
          .main-pad{ padding:16px !important; }
        }
      `}</style>

      {/* ── Main ─────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>

        {/* Topbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderBottom:'1px solid rgba(76,175,80,.08)', background:'rgba(13,26,15,.95)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:20, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
            <button className="hide-desktop" onClick={() => setOpen(true)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#66bb6a', fontSize:'1.3rem', padding:'2px 6px', flexShrink:0 }}>
              ☰
            </button>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:'.92rem', color:'#c8e6c9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {NAV.find(n => n.path===location.pathname)?.icon} {NAV.find(n => n.path===location.pathname)?.label || 'KrishiAI'}
              </div>
              <div style={{ fontSize:'.65rem', color:'#3d6b40' }}>
                {new Date().toLocaleDateString('en-IN',{ weekday:'short', day:'numeric', month:'short', year:'numeric' })}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <Link to="/profile" style={{ textDecoration:'none' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.95rem', cursor:'pointer' }} title={user?.name}>
                👨‍🌾
              </div>
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="main-pad" style={{ flex:1, padding:'20px', overflowY:'auto', overflowX:'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
