import { useState, useEffect } from 'react'
import PortalLayout from '../components/PortalLayout'
import API from '../utils/api'

export default function AdminDashboard() {
  const [tab,     setTab]     = useState('pending')
  const [pending, setPending] = useState([])
  const [allPlans,setAllPlans]= useState([])
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState({ type:'', text:'' })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [pend, all] = await Promise.all([
        API.get('/portal/admin/pending-insurance'),
        API.get('/portal/insurance'),
      ])
      setPending(pend.data.plans || [])
      setAllPlans(all.data.plans   || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const approvePlan = async (id) => {
    try {
      await API.put(`/portal/insurance/${id}/approve`)
      setMsg({ type:'success', text:'✅ Plan approved and now live to farmers!' })
      fetchAll()
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.message || 'Approval failed' })
    }
  }

  const PlanCard = ({ plan, showApprove = false }) => (
    <div style={{ padding:'18px', background:'rgba(255,255,255,.02)', border:`1px solid ${plan.is_approved?'rgba(139,92,246,.2)':'rgba(245,158,11,.2)'}`, borderRadius:12 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
            <span style={{ fontWeight:800, fontSize:'.95rem', color:'#e2e8f0' }}>{plan.plan_name}</span>
            <span style={{ fontSize:'.72rem', color:'#a78bfa', background:'rgba(139,92,246,.1)', padding:'2px 8px', borderRadius:100, border:'1px solid rgba(139,92,246,.25)' }}>
              {plan.provider_name}
            </span>
            <span className={`badge ${plan.is_approved?'badge-green':'badge-orange'}`}>
              {plan.is_approved ? '✅ Approved' : '⏳ Pending'}
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:8, marginBottom:10 }}>
            {[
              { label:'Premium',  value:`₹${plan.premium_per_acre}/acre/yr` },
              { label:'Coverage', value:`₹${plan.max_coverage_per_acre}/acre` },
              { label:'Duration', value:`${plan.duration_months} months` },
            ].map(item => (
              <div key={item.label} style={{ background:'rgba(139,92,246,.06)', border:'1px solid rgba(139,92,246,.12)', borderRadius:8, padding:'7px 10px' }}>
                <div style={{ fontSize:'.6rem', color:'#6b7280', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em' }}>{item.label}</div>
                <div style={{ fontSize:'.82rem', fontWeight:700, color:'#a78bfa', marginTop:2 }}>{item.value}</div>
              </div>
            ))}
          </div>
          {plan.crop_covered?.length > 0 && (
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
              {plan.crop_covered.map(c => (
                <span key={c} style={{ fontSize:'.68rem', padding:'2px 7px', borderRadius:100, background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)', color:'#34d399' }}>{c}</span>
              ))}
            </div>
          )}
          <div style={{ fontSize:'.75rem', color:'#6b7280' }}>
            📞 {plan.contact_phone} {plan.contact_email && `· ✉️ ${plan.contact_email}`}
          </div>
          <div style={{ fontSize:'.7rem', color:'#4b5563', marginTop:3 }}>
            Submitted: {new Date(plan.createdAt).toLocaleDateString('en-IN')}
          </div>
        </div>
        {showApprove && !plan.is_approved && (
          <button className="btn-primary" style={{ padding:'10px 20px', fontSize:'.82rem', flexShrink:0 }} onClick={() => approvePlan(plan._id)}>
            ✅ Approve & Go Live
          </button>
        )}
      </div>

      {plan.features?.length > 0 && (
        <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid rgba(139,92,246,.08)' }}>
          <div style={{ fontSize:'.68rem', color:'#4b5563', fontWeight:700, marginBottom:6, letterSpacing:'.05em' }}>PLAN FEATURES</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {plan.features.map(f => (
              <span key={f} style={{ fontSize:'.72rem', color:'#9ca3af', background:'rgba(255,255,255,.03)', padding:'3px 10px', borderRadius:100, border:'1px solid rgba(255,255,255,.06)' }}>{f}</span>
            ))}
          </div>
        </div>
      )}

      {plan.claim_process && (
        <div style={{ marginTop:10, padding:'10px 12px', background:'rgba(59,130,246,.05)', border:'1px solid rgba(59,130,246,.12)', borderRadius:10, fontSize:'.75rem', color:'#93c5fd' }}>
          📋 Claim Process: {plan.claim_process}
        </div>
      )}
    </div>
  )

  return (
    <PortalLayout>
      <div style={{ maxWidth:900, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,rgba(30,10,50,.9),rgba(15,5,30,.95))', border:'1px solid rgba(139,92,246,.2)', borderRadius:20, padding:'24px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:'.7rem', color:'#8b5cf6', fontWeight:700, letterSpacing:'.1em', marginBottom:6 }}>ADMIN PANEL</div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#e2e8f0', marginBottom:4 }}>KrishiAI Admin ⚙️</div>
              <div style={{ fontSize:'.82rem', color:'#4b5563' }}>Manage insurance approvals and platform content</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ textAlign:'center', padding:'12px 18px', background:'rgba(245,158,11,.1)', border:'1px solid rgba(245,158,11,.2)', borderRadius:12 }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#fbbf24' }}>{pending.length}</div>
                <div style={{ fontSize:'.68rem', color:'#4b5563' }}>Pending Approval</div>
              </div>
              <div style={{ textAlign:'center', padding:'12px 18px', background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', borderRadius:12 }}>
                <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#34d399' }}>{allPlans.length}</div>
                <div style={{ fontSize:'.68rem', color:'#4b5563' }}>Live Plans</div>
              </div>
            </div>
          </div>
        </div>

        {msg.text && (
          <div style={{ padding:'12px 16px', borderRadius:12, background:msg.type==='success'?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)', border:`1px solid ${msg.type==='success'?'rgba(16,185,129,.3)':'rgba(239,68,68,.3)'}`, color:msg.type==='success'?'#34d399':'#f87171', fontSize:'.85rem' }}>
            {msg.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[
            ['pending', `⏳ Pending Approval (${pending.length})`],
            ['live',    `✅ Live Plans (${allPlans.length})`],
          ].map(([val,label]) => (
            <button key={val} onClick={() => setTab(val)}
              style={{ padding:'10px 20px', borderRadius:100, fontSize:'.82rem', fontWeight:700, border:`1px solid ${tab===val?'#8b5cf6':'rgba(139,92,246,.2)'}`, background:tab===val?'rgba(139,92,246,.15)':'transparent', color:tab===val?'#a78bfa':'#4b5563', cursor:'pointer', fontFamily:"'Sora',sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Pending Plans */}
        {tab === 'pending' && (
          <div style={{ background:'linear-gradient(145deg,rgba(15,23,42,.9),rgba(10,15,30,.95))', border:'1px solid rgba(139,92,246,.15)', borderRadius:16, padding:20 }}>
            <div style={{ fontWeight:700, fontSize:'.92rem', color:'#e2e8f0', marginBottom:14 }}>⏳ Insurance Plans Awaiting Approval</div>
            {loading ? (
              <div style={{ textAlign:'center', padding:40, color:'#4b5563' }}>⏳ Loading...</div>
            ) : pending.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#4b5563', fontSize:'.85rem' }}>
                ✅ No pending plans — all caught up!
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {pending.map(p => <PlanCard key={p._id} plan={p} showApprove={true} />)}
              </div>
            )}
          </div>
        )}

        {/* Live Plans */}
        {tab === 'live' && (
          <div style={{ background:'linear-gradient(145deg,rgba(15,23,42,.9),rgba(10,15,30,.95))', border:'1px solid rgba(139,92,246,.15)', borderRadius:16, padding:20 }}>
            <div style={{ fontWeight:700, fontSize:'.92rem', color:'#e2e8f0', marginBottom:14 }}>✅ Approved Live Plans</div>
            {loading ? (
              <div style={{ textAlign:'center', padding:40, color:'#4b5563' }}>⏳ Loading...</div>
            ) : allPlans.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#4b5563', fontSize:'.85rem' }}>No approved plans yet.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {allPlans.map(p => <PlanCard key={p._id} plan={p} showApprove={false} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
