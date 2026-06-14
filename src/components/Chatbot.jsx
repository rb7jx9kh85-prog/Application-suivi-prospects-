import React, { useState, useRef, useEffect } from 'react'
import { askAI } from '../lib/ai'

const SYSTEM = 'Tu es un assistant commercial expert en prospection B2B. Aide les commerciaux avec: gestion des prospects, réponses aux objections, scripts d\'appel, planification RDV. Réponds en français, de façon concise et actionnable (max 120 mots).'

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([{ role: 'bot', text: 'Bonjour ! Je suis votre assistant commercial. Demandez-moi de l\'aide pour gérer vos prospects, rédiger des scripts ou planifier vos appels. 💼' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const msgsRef = useRef(null)

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight }, [msgs])

  async function send() {
    const msg = input.trim(); if (!msg || loading) return
    setInput('')
    setMsgs(p => [...p, { role: 'user', text: msg }, { role: 'bot', text: '...' }])
    setLoading(true)
    try {
      const r = await askAI(SYSTEM, msg)
      setMsgs(p => { const n = [...p]; n[n.length - 1] = { role: 'bot', text: r }; return n })
    } catch (e) {
      setMsgs(p => { const n = [...p]; n[n.length - 1] = { role: 'bot', text: '⚠️ IA indisponible : ' + (e.message || 'erreur') }; return n })
    }
    setLoading(false)
  }

  return (
    <>
      <button className="chat-fab show" onClick={() => setOpen(o => !o)}>💬</button>
      {open && (
        <div className="chat-panel open">
          <div className="chat-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 30, height: 30, background: 'var(--grad)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Assistant IA</div>
                <div style={{ fontSize: 10, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ width: 5, height: 5, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />En ligne
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
          </div>
          <div className="chat-msgs" ref={msgsRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role === 'user' ? 'u' : 'b'}`}>{m.text}</div>
            ))}
          </div>
          <div className="chat-ir">
            <input
              className="chat-in"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Posez une question..."
            />
            <button className="chat-send" onClick={send} disabled={loading}>→</button>
          </div>
        </div>
      )}
    </>
  )
}
