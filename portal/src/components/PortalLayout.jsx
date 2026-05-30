import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_NAV = {
  company: [
    { icon:'🏠', label:'Dashboard',     path:'/company' },
    { icon:'📋', label:'My Requirements',path:'/company#requirements' },
    { icon:'👥', label:'Applicants',    path:'/company#applicants' },
    { icon:'👤', label:'Profile',       path:'/company#profile' },
  ],
  transport: [
    { icon:'🏠', label:'Dashboard',     path:'/transport' },
    { icon:'🚛', label:'My Vehicles',   path:'/transport#vehicles' },
    { icon:'📦', label:'Bookings',      path:'/transport#bookings' },
    { icon:'👤', label:'Profile',       path:'/transport#profile' },
  ],
  insurance: [
    { icon:'🏠', label:'Dashboard',     path:'/insurance' },
    { icon:'🛡️', label:'My Plans',     path:'/insurance#plans' },
    { icon:'📝', label:'Claims',        path:'/insurance#claims' },
    { icon:'👤', label:'Profile',       path:'/insurance#profile' },
  ],
  admin: [
    { icon:'🏠', label:'Dashboard',     path:'/admin' },
    { icon:'✅', label:'Approve Plans', path:'/admin#approve' },
    { icon:'👥', label:'All Users',     path:'/admin#users' },
    { icon:'📊', label:'Analytics',     path:'/admin#analytics' },
  ],
}

const ROLE_COLOR = {
  company:   { primary:'#3b82f6', bg:'rgba(59,130,246,.15)', border:'rgba(59,130,246,.3)' },
  transport: { primary:'#f59e0b', bg:'rgba(245,158,11,.15)', border:'rgba(245,158,11,.3)' },
  insurance: { primary:'#10b981', bg:'rgba(16,185,129,.15)', border:'rgba(16,185,129,.3)' },
  admin:     { primary:'#8b5cf6', bg:'rgba(139,92,246,.15)', border:'rgba(139,92,246,.3)' },
}

const ROLE_ICON = { company:'🏢', transport:'🚛', insurance:'🛡️', admin:'⚙️' }
const ROLE_LABEL = { company:'Company', transport:'Transporter', insurance:'Insurance Provider', admin:'Admin' }

export default function PortalLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const role   = user?.role || 'company'
  const nav    = ROLE_NAV[role]    || ROLE_NAV.company
  const colors = ROLE_COLOR[role]  || ROLE_COLOR.company

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0a0f1a', fontFamily:"'Sora',sans-serif", color:'#e2e8f0', overflow:'hidden' }}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside style={{
        width:220, flexShrink:0,
        background:'rgba(8,12,24,.98)',
        borderRight:`1px solid ${colors.border}`,
        display:'flex', flexDirection:'column', padding:'18px 10px',
        position:'fixed', top:0, left:0, bottom:0, zIndex:50,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform .28s ease',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8, marginBottom:20, padding:'0 6px' }}>
          <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${colors.primary},#1e40af)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🌿</div>
          <span style={{ fontWeight:800, fontSize:'.95rem', color:'#e2e8f0' }}>Krishi<span style={{ color:colors.primary }}>Portal</span></span>
        </Link>

        {/* Role badge */}
        {user && (
          <div style={{ background:colors.bg, border:`1px solid ${colors.border}`, borderRadius:12, padding:'10px 12px', marginBottom:16 }}>
            <div style={{ fontSize:'1.3rem', marginBottom:3 }}>{ROLE_ICON[role]}</div>
            <div style={{ fontWeight:700, fontSize:'.82rem', color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
            <div style={{ fontSize:'.68rem', color:'#475569', marginTop:2 }}>{ROLE_LABEL[role]}</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>
          {nav.map(item => (
            <Link key={item.label} to={item.path}
              className={`sidebar-link ${location.pathname===item.path.split('#')[0]?'active':''}`}
              onClick={() => setOpen(false)}
              style={{ '--active-color': colors.primary }}>
              <span style={{ fontSize:'.95rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Farmer app link */}
        <a href="https://krishiai-mocha.vercel.app" target="_blank" rel="noreferrer"
          style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, background:'rgba(76,175,80,.08)', border:'1px solid rgba(76,175,80,.15)', color:'#4ade80', fontSize:'.78rem', fontWeight:600, textDecoration:'none', marginBottom:8, transition:'all .2s' }}>
          🌾 Farmer App ↗
        </a>

        {/* Logout */}
        <button onClick={handleLogout}
          style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.18)', borderRadius:10, padding:'9px 12px', color:'#fca5a5', fontSize:'.82rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontFamily:"'Sora',sans-serif" }}>
          🚪 Logout
        </button>
      </aside>

      {/* Mobile overlay */}
      {open && <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:40 }} />}

      <style>{`
        @media(min-width:768px){
          aside{ transform:translateX(0) !important; position:sticky !important; height:100vh; }
          .hide-desktop{ display:none !important; }
        }
        .sidebar-link.active{ background:${colors.bg}; color:${colors.primary}; border:1px solid ${colors.border}; }
        .sidebar-link:hover{ color:${colors.primary}; }
      `}</style>

      {/* ── Main ──────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>

        {/* Topbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderBottom:`1px solid ${colors.border}`, background:'rgba(8,12,24,.95)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:20, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button className="hide-desktop" onClick={() => setOpen(true)}
              style={{ background:'none', border:'none', cursor:'pointer', color:colors.primary, fontSize:'1.3rem', padding:'2px 6px', flexShrink:0 }}>☰</button>
            <div>
              <div style={{ fontWeight:700, fontSize:'.92rem', color:'#e2e8f0' }}>
                {ROLE_ICON[role]} KrishiAI {ROLE_LABEL[role]} Portal
              </div>
              <div style={{ fontSize:'.65rem', color:'#334155' }}>
                {new Date().toLocaleDateString('en-IN',{ weekday:'short', day:'numeric', month:'short', year:'numeric' })}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${colors.primary},#1e40af)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.95rem' }}>
              {ROLE_ICON[role]}
            </div>
          </div>
        </div>

        {/* Content */}
        <main style={{ flex:1, padding:'20px', overflowY:'auto', overflowX:'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
