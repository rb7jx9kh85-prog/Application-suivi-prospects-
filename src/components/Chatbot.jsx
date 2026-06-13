import { useState, useRef, useEffect } from 'react'
import { Send, Bot, X, MessageCircle, Calendar, CheckCircle, Key } from 'lucide-react'
import { generateBotResponse, parseAppointmentFromText } from '../utils/chatbot'
import { generateGoogleCalendarUrl } from '../utils/calendar'
import { sendAppointmentEmail } from '../utils/email'
import { askClaude, hasAnthropicKey } from '../utils/claude'
import { useData } from '../hooks/useData'
import ApiKeySetup from './ApiKeySetup'

const SYSTEM_PROMPT = `Tu es un assistant commercial expert en prospection pour ProspectPro.
Tu aides à gérer des appels, créer des rendez-vous, et donner des conseils de vente.
Réponds toujours en français, de manière concise et professionnelle.
Si l'utilisateur parle d'un rendez-vous avec une date/heure/établissement, propose de le créer.
Tu peux aussi répondre aux objections commerciales et proposer des scripts adaptés.`

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [showKeySetup, setShowKeySetup] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: 'Bonjour ! Je suis votre assistant ProspectPro.\nTapez "aide" pour voir ce que je peux faire.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingAppt, setPendingAppt] = useState(null)
  const bottomRef = useRef(null)
  const { calls, appointments, addAppointment } = useData()

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { id: Date.now(), role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    const msgText = input
    setInput('')
    setLoading(true)

    try {
      if (hasAnthropicKey()) {
        // Use real Claude AI
        const history = messages.slice(-8).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
        history.push({ role: 'user', content: msgText })

        const aiText = await askClaude(history, SYSTEM_PROMPT)

        // Check if AI response suggests creating an appointment
        const parsed = parseAppointmentFromText(msgText)
        const wantsAppt = /rdv|rendez.vous|réunion|rencontre/i.test(msgText) && (parsed.date || parsed.establishment)

        if (wantsAppt && (parsed.date || parsed.establishment)) {
          setPendingAppt(parsed)
          setMessages(prev => [...prev, {
            id: Date.now() + 1, role: 'bot', text: aiText,
            type: 'create_appointment', appointmentData: parsed
          }])
        } else {
          setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: aiText }])
        }
      } else {
        // Fallback to rule-based
        await new Promise(r => setTimeout(r, 500))
        const response = generateBotResponse(msgText, appointments, calls)
        if (response.type === 'create_appointment' && response.appointmentData) {
          setPendingAppt(response.appointmentData)
        }
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', ...response }])
      }
    } catch (e) {
      if (e.message === 'NO_KEY') {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'bot',
          text: '🔑 Aucune clé API configurée. Cliquez sur l\'icône clé pour activer l\'IA complète.',
          type: 'no_key'
        }])
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'bot',
          text: `❌ Erreur : ${e.message}. Vérifiez votre clé API.`
        }])
      }
    }

    setLoading(false)
  }

  const confirmAppointment = async (data) => {
    try {
      const apptData = { ...data, title: `RDV - ${data.establishment || 'Rendez-vous'}`, status: 'scheduled' }
      const newAppt = addAppointment(apptData)
      let emailSent = false
      try {
        emailSent = await Promise.race([
          sendAppointmentEmail({ ...apptData, ...newAppt }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
        ])
      } catch {}
      const calUrl = generateGoogleCalendarUrl({ ...apptData, ...newAppt })
      setMessages(prev => [...prev, {
        id: Date.now(), role: 'bot', type: 'confirmed',
        text: `✅ Rendez-vous créé !${emailSent ? '\n📧 Email envoyé à NoéVouillamoz3@gmail.com' : ''}\n\nCliquez ci-dessous pour ajouter à votre agenda :`,
        calendarUrl: calUrl
      }])
      setPendingAppt(null)
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: '⚠️ Erreur lors de la création du RDV.' }])
    }
  }

  const renderText = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    )
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px',
        background: hasAnthropicKey() ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'linear-gradient(135deg, #0ea5e9, #2563eb)',
        borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: hasAnthropicKey() ? '0 4px 20px rgba(168,85,247,0.4)' : '0 4px 20px rgba(14,165,233,0.4)',
        zIndex: 50, transition: 'transform 0.2s'
      }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
         onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        <MessageCircle size={24} color="white" />
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px', width: '380px', maxWidth: 'calc(100vw - 2rem)',
          background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', zIndex: 50, height: '520px', overflow: 'hidden'
        }}>
          <div style={{ background: hasAnthropicKey() ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'linear-gradient(135deg, #0ea5e9, #2563eb)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '14px' }}>
                  {hasAnthropicKey() ? 'Claude IA ✨' : 'Assistant ProspectPro'}
                </p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>
                  {hasAnthropicKey() ? 'Propulsé par Claude · IA complète' : 'Mode basique · Ajoutez une clé API pour l\'IA'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setShowKeySetup(true)} title="Configurer la clé API" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white' }}>
                <Key size={16} />
              </button>
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    padding: '10px 13px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user'
                      ? (hasAnthropicKey() ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'linear-gradient(135deg, #0ea5e9, #2563eb)')
                      : '#f3f4f6',
                    color: msg.role === 'user' ? 'white' : '#1f2937',
                    fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-line'
                  }}>
                    {renderText(msg.text)}
                  </div>
                  {msg.type === 'create_appointment' && msg.appointmentData && pendingAppt && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => confirmAppointment(msg.appointmentData)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        <CheckCircle size={13} /> Confirmer
                      </button>
                      <button onClick={() => setPendingAppt(null)} style={{ background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        Annuler
                      </button>
                    </div>
                  )}
                  {msg.type === 'no_key' && (
                    <button onClick={() => setShowKeySetup(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fdf4ff', color: '#a855f7', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      <Key size={12} /> Configurer la clé API
                    </button>
                  )}
                  {msg.calendarUrl && (
                    <a href={msg.calendarUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                      <Calendar size={13} /> Ajouter à Google Calendar
                    </a>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#f3f4f6', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: '4px' }}>
                  {[0, 150, 300].map(delay => (
                    <span key={delay} style={{ width: '7px', height: '7px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={hasAnthropicKey() ? 'Demandez n\'importe quoi à Claude...' : 'Écrivez votre message...'}
                style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', outline: 'none' }}
              />
              <button onClick={send} disabled={!input.trim() || loading} style={{
                width: '40px', height: '40px',
                background: input.trim()
                  ? (hasAnthropicKey() ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'linear-gradient(135deg,#0ea5e9,#2563eb)')
                  : '#e5e7eb',
                border: 'none', borderRadius: '12px', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Send size={16} color={input.trim() ? 'white' : '#9ca3af'} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showKeySetup && <ApiKeySetup onClose={() => setShowKeySetup(false)} onSaved={() => window.location.reload()} />}
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} } @keyframes spin { to{transform:rotate(360deg)} }`}</style>
    </>
  )
}
