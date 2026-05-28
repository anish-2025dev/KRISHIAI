import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../utils/api'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep]     = useState(1) // 1=phone, 2=otp+newpwd
  const [phone, setPhone]   = useState('')
  const [otp, setOtp]       = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState({ type:'', text:'' })

  const sendOTP = async () => {
    if (!phone) return setMsg({ type:'error', text:'Please enter your phone number' })
    setLoading(true)
    setMsg({ type:'', text:'' })
    try {
      await API.post('/profile/forgot-password', { phone })
      setMsg({ type:'success', text:'✅ OTP sent to your mobile number!' })
      setStep(2)
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.message || 'Failed to send OTP' })
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    if (!otp || !newPwd || !confirm)
      return setMsg({ type:'error', text:'Please fill all fields' })
    if (newPwd !== confirm)
      return setMsg({ type:'error', text:'Passwords do not match' })
    if (newPwd.length < 6)
      return setMsg({ type:'error', text:'Password must be at least 6 characters' })

    setLoading(true)
    setMsg({ type:'', text:'' })
    try {
      await API.post('/profile/reset-password', { phone, otp, new_password: newPwd })
      setMsg({ type:'success', text:'✅ Password reset successfully! Redirecting to login...' })
      setTimeout(() => navigate('/login'), 2000)
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.message || 'Failed to reset password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0d1a0f', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Sora',sans-serif" }}>
      <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(46,125,50,.2) 0%,transparent 70%)', top:'20%', left:'50%', transform:'translateX(-50%)', filter:'blur(60px)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link to="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🌿</div>
            <span style={{ fontWeight:800, fontSize:'1.3rem', color:'#e8f5e9' }}>Krishi<span style={{ color:'#66bb6a' }}>AI</span></span>
          </Link>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {[1,2].map(s => (
            <div key={s} style={{ flex:1, height:4, borderRadius:4, background:step>=s?'#4caf50':'rgba(76,175,80,.15)', transition:'background .3s' }} />
          ))}
        </div>

        <div style={{ background:'linear-gradient(145deg,rgba(27,45,28,.8),rgba(19,32,20,.9))', border:'1px solid rgba(76,175,80,.2)', borderRadius:24, padding:32, backdropFilter:'blur(10px)' }}>
          <h2 style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:4, color:'#c8e6c9' }}>
            {step === 1 ? '🔑 Forgot Password' : '📱 Enter OTP'}
          </h2>
          <p style={{ color:'#4a7c4e', fontSize:'.82rem', marginBottom:24 }}>
            {step === 1 ? 'Enter your registered mobile number to receive OTP' : `OTP sent to +91 ${phone}. Enter it below.`}
          </p>

          {msg.text && (
            <div style={{ padding:'10px 14px', borderRadius:10, background:msg.type==='success'?'rgba(76,175,80,.1)':'rgba(229,57,53,.1)', border:`1px solid ${msg.type==='success'?'rgba(76,175,80,.3)':'rgba(229,57,53,.3)'}`, color:msg.type==='success'?'#81c784':'#ef5350', fontSize:'.82rem', marginBottom:16 }}>
              {msg.text}
            </div>
          )}

          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.07em' }}>MOBILE NUMBER</label>
                <input className="input-field" type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key==='Enter' && sendOTP()} />
              </div>
              <button className="btn-primary" style={{ padding:'14px', fontSize:'1rem' }} onClick={sendOTP} disabled={loading}>
                {loading ? '⏳ Sending OTP...' : '📱 Send OTP'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.07em' }}>6-DIGIT OTP</label>
                <input className="input-field" type="text" placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} style={{ letterSpacing:'0.3em', fontSize:'1.2rem', textAlign:'center' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.07em' }}>NEW PASSWORD</label>
                <input className="input-field" type="password" placeholder="Min 6 characters" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#66bb6a', marginBottom:5, letterSpacing:'.07em' }}>CONFIRM PASSWORD</label>
                <input className="input-field" type="password" placeholder="Repeat new password" value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
              <button className="btn-primary" style={{ padding:'14px', fontSize:'1rem' }} onClick={resetPassword} disabled={loading}>
                {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
              </button>
              <button onClick={() => { setStep(1); setMsg({type:'',text:''}) }} style={{ background:'none', border:'none', color:'#4a7c4e', fontSize:'.82rem', cursor:'pointer', fontFamily:"'Sora',sans-serif" }}>
                ← Resend OTP
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', marginTop:16, fontSize:'.82rem', color:'#4a7c4e' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color:'#66bb6a', fontWeight:700, textDecoration:'none' }}>Login</Link>
        </p>
      </div>
    </div>
  )
}
