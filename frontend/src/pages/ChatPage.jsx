import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import API from '../utils/api'
import { useAuth } from '../context/AuthContext'

const QUICK = [
  'मेरी फसल के लिए पानी कब देना चाहिए?',
  'गेहूं में कौन सी खाद डालें?',
  'What is the best time to sow mustard?',
  'Pest control ke liye kya karein?',
  'सरकारी योजनाएं कौन सी हैं किसानों के लिए?',
  'How to increase crop yield?',
]

const LANG_CODE = { hindi:'hi-IN', english:'en-IN', hinglish:'hi-IN' }

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    { role:'assistant', content:`नमस्ते ${user?.name || 'किसान भाई'}! मैं KrishiAI आपका खेती सहायक हूँ। हिंदी, English, या Hinglish में पूछें — या माइक दबाकर बोलें।` }
  ])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [language,  setLanguage]  = useState(user?.language || 'hindi')
  const [listening, setListening] = useState(false)
  const [voiceOK,   setVoiceOK]   = useState(false)
  const bottomRef      = useRef()
  const recognitionRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setVoiceOK(true)
    const r = new SR()
    r.continuous     = false
    r.interimResults = true
    r.lang           = LANG_CODE[language]
    r.onstart  = () => setListening(true)
    r.onend    = () => setListening(false)
    r.onresult = (e) => {
      let t = ''
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript
      setInput(t)
      if (e.results[e.results.length - 1].isFinal && t.trim()) {
        setTimeout(() => sendMessage(t.trim()), 400)
      }
    }
    r.onerror = (e) => {
      setListening(false)
      if (e.error === 'not-allowed') alert('Please allow microphone access')
    }
    recognitionRef.current = r
  }, [language])

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.lang = LANG_CODE[language]
      setInput('')
      try { recognitionRef.current.start() } catch(e) {}
    }
  }

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role:'user', content:msg }])
    setLoading(true)
    try {
      const history = messages.slice(-10).map(m => ({
        role:    m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }))
      const { data } = await API.post('/ai/chat', {
        message: msg, history, language,
        user_context: { location:user?.location?.state, crops:user?.crops, land_acres:user?.land_acres },
      })
      setMessages(prev => [...prev, { role:'assistant', content:data.reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role:'assistant', content:'माफ़ करें, अभी समस्या है। कृपया दोबारा कोशिश करें।' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth:720, margin:'0 auto', display:'flex', flexDirection:'column', height:'calc(100vh - 130px)', minHeight:500 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:10 }}>
          <div>
            <h1 style={{ fontSize:'1.2rem', fontWeight:800, color:'#c8e6c9' }}>🤖 AI Farming Assistant</h1>
            <p style={{ fontSize:'.75rem', color:'#4a7c4e' }}>
              Powered by Gemini 2.5 · {voiceOK ? '🎤 Voice enabled' : 'Text only'}
            </p>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {[['hindi','हिं'],['english','EN'],['hinglish','HIN']].map(([val,label]) => (
              <button key={val} onClick={() => setLanguage(val)} style={{ padding:'6px 12px', borderRadius:100, fontSize:'.72rem', fontWeight:700, border:`1px solid ${language===val?'#4caf50':'rgba(76,175,80,.2)'}`, background:language===val?'rgba(76,175,80,.15)':'transparent', color:language===val?'#81c784':'#4a7c4e', cursor:'pointer', fontFamily:"'Sora',sans-serif" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick questions */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => sendMessage(q)} style={{ padding:'5px 11px', fontSize:'.7rem', borderRadius:100, border:'1px solid rgba(76,175,80,.2)', background:'rgba(27,45,28,.6)', color:'#66bb6a', cursor:'pointer', fontFamily:"'Sora',sans-serif" }}>
              {q.length > 28 ? q.slice(0,28)+'…' : q}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, paddingRight:4, marginBottom:12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', alignItems:'flex-end', gap:8 }}>
              {m.role==='assistant' && (
                <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', flexShrink:0 }}>🤖</div>
              )}
              <div style={{ maxWidth:'78%', padding:'11px 15px', borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px', background:m.role==='user'?'linear-gradient(135deg,#4caf50,#2e7d32)':'rgba(27,45,28,.85)', border:m.role==='user'?'none':'1px solid rgba(76,175,80,.15)', color:'#e8f5e9', fontSize:'.86rem', lineHeight:1.65, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                {m.content}
              </div>
              {m.role==='user' && (
                <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(76,175,80,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem', flexShrink:0 }}>👨‍🌾</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#4caf50,#1b5e20)', display:'flex', alignItems:'center', justifyContent:'center' }}>🤖</div>
              <div style={{ padding:'11px 16px', background:'rgba(27,45,28,.85)', border:'1px solid rgba(76,175,80,.15)', borderRadius:'18px 18px 18px 4px', display:'flex', gap:5 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#4caf50', animation:`bounce .8s ${i*0.15}s infinite alternate` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Voice status */}
        {listening && (
          <div style={{ textAlign:'center', marginBottom:8, fontSize:'.75rem', color:'#ef5350', fontWeight:600, animation:'pulse-text 1s infinite' }}>
            🔴 सुन रहा हूँ... बोलिए / Listening... speak now
          </div>
        )}

        {/* Input bar */}
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {voiceOK && (
            <button onClick={toggleVoice} title={listening?'Stop':'Speak in Hindi'}
              style={{ width:44, height:44, borderRadius:'50%', border:'none', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', transition:'all .3s', background:listening?'linear-gradient(135deg,#ef5350,#c62828)':'rgba(76,175,80,.15)', boxShadow:listening?'0 0 0 4px rgba(239,83,80,.3)':'none' }}>
              {listening ? '⏹' : '🎤'}
            </button>
          )}
          <input
            className="input-field"
            placeholder={listening ? '🎤 Listening...' : language==='hindi'?'खेती के बारे में पूछें...':language==='hinglish'?'Khet ke baare mein poochhen...':'Ask about farming...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendMessage()}
            style={{ flex:1 }}
          />
          <button className="btn-primary" style={{ padding:'12px 18px', flexShrink:0 }} onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            ➤
          </button>
        </div>

        <style>{`
          @keyframes bounce{ from{transform:translateY(0)} to{transform:translateY(-6px)} }
          @keyframes pulse-text{ 0%,100%{opacity:1} 50%{opacity:.5} }
        `}</style>
      </div>
    </Layout>
  )
}
