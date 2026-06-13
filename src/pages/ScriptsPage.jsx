import { useState, useRef, useEffect } from 'react'
import { Book, Send, MessageCircle, X, Bot } from 'lucide-react'
import Navbar from '../components/Navbar'
import Chatbot from '../components/Chatbot'

const SCRIPTS = {
  cold: {
    label: 'Cold Call (jamais parlé)',
    pro: {
      title: 'Pro & Clair',
      text: `Bonjour [Nom], je m'appelle [Votre Nom] de [Votre Entreprise].

La raison de mon appel : j'ai remarqué que vous êtes dans le domaine [DOMAINE] et j'aimerais vous parler d'une solution qui pourrait vous intéresser.

Avez-vous 5 minutes ? C'est court, promis.`
    },
    humorous: {
      title: 'Humour & Direct',
      text: `Bonjour, écoutez je vais être direct : c'est un appel de prospection.

Mauvaise nouvelle : oui, c'est un appel de vente. Bonne nouvelle : j'ai créé quelque chose de gratuit pour les [DOMAINE] et j'étais sur le point de vous l'envoyer.

Vous avez 15 minutes la semaine prochaine ?`
    },
    hidden: {
      title: 'Accroche Dissimulée',
      text: `Bonjour, un ami m'a dit que vous étiez exceptionnels chez vous.

J'ai essayé de trouver votre [carte/horaires/infos] sur internet, mais franchement je n'ai rien trouvé de clair. C'est normal ou c'est juste moi ?

[Écouter la réponse] - profiter pour envoyer une ressource utile.`
    },
  },
  warm: {
    label: 'Warm Call (connaît la personne)',
    pro: {
      title: 'Professionnel',
      text: `Bonjour [Nom], c'est [Votre Nom], on s'était parlé il y a quelques semaines.

Je voulais vous montrer quelque chose qui pourrait vraiment vous aider. C'est rapide, 10 minutes ?`
    },
    followup: {
      title: 'Relance Naturelle',
      text: `Salut [Nom], j'espère que tout va bien de ton côté.

Je réfléchissais à ce qu'on avait discuté la dernière fois, et j'ai trouvé une solution parfaite pour toi.

Est-ce qu'on peut prendre un café ou un appel cette semaine ?`
    },
  },
  hot: {
    label: 'Hot Call (demande de visio)',
    pro: {
      title: 'Visio Confirmée',
      text: `Bonjour [Nom], excité de vous rencontrer jeudi à 14h.

Avant : avez-vous des questions spécifiques que j'aimerais couvrir ? C'est pour que je sois bien préparé.

À jeudi ! Voici le lien : [LIEN VISIO]`
    },
    engagement: {
      title: 'Engagement Fort',
      text: `[Nom], on arrive enfin au moment où on va vraiment voir si c'est une bonne fit.

Je suis confiant qu'on peut trouver une solution ensemble. Et même si ce n'est pas le cas, vous aurez au minimum quelques idées intéressantes.

À bientôt !`
    },
  }
}

const OBJECTIONS = {
  busy: { q: "Je n'ai pas le temps", a: "Je comprends, vous êtes occupé. C'est pour ça que j'appelle : ça prend 5 minutes et ça peut vous sauver des heures. On peut faire jeudi 15h ?" },
  price: { q: "C'est trop cher", a: "Je comprends. Mais pensez au coût de ne rien faire. Ou on en parle d'abord avant de parler prix ?" },
  interested: { q: "Je ne suis pas intéressé", a: "C'est normal, vous ne me connaissez pas. Je ne vous demande pas de vous engager, juste 15 min pour voir si ça vaut le coup. Vraiment." },
  competitor: { q: "On travaille déjà avec quelqu'un", a: "Parfait, ça veut dire que vous savez comment ça marche. Le seul truc : on peut vous offrir [AVANTAGE] en plus. On en parle 10 min ?" },
}

export default function ScriptsPage() {
  const [callType, setCallType] = useState('cold')
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Bonjour ! Je suis votre assistant pour les objections. Posez-moi votre question ou décrivez l'objection que vous avez reçue." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: 'user', text: input }])
    const query = input.toLowerCase()
    setInput('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 800))

    let response = "Je n'ai pas bien compris. Pouvez-vous être plus spécifique ? Par exemple : 'Comment répondre à "je n'ai pas le temps"' ?"

    for (const [key, objection] of Object.entries(OBJECTIONS)) {
      if (query.includes(objection.q.toLowerCase().split(' ')[0])) {
        response = `**À l'objection : "${objection.q}"**\n\nRéponse suggérée :\n"${objection.a}"\n\n💡 Conseil : gardez toujours un ton respectueux et honnête, même face à un refus.`
        break
      }
    }

    setMessages(prev => [...prev, { role: 'bot', text: response }])
    setLoading(false)
  }

  const renderText = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
    )
  }

  const scripts = SCRIPTS[callType] || {}

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Book size={24} color="#0284c7" />
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#111827' }}>Scripts de Cold Calling</h1>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {Object.entries(SCRIPTS).map(([key, config]) => (
              <button key={key} onClick={() => setCallType(key)}
                style={{
                  padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: callType === key ? 'linear-gradient(135deg,#0ea5e9,#2563eb)' : '#e5e7eb',
                  color: callType === key ? 'white' : '#374151',
                }}>
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
          {Object.entries(scripts).map(([key, script]) => {
            if (key === 'label') return null
            return (
              <div key={key} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>{script.title}</h3>
                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', fontSize: '13px', color: '#374151', lineHeight: 1.6, fontFamily: 'monospace', marginBottom: '12px', minHeight: '140px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {script.text}
                </div>
                <button onClick={() => {
                  navigator.clipboard.writeText(script.text)
                  alert('Script copié !')
                }} style={{ width: '100%', padding: '9px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  Copier le script
                </button>
              </div>
            )
          })}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f0f9ff, #eff6ff)', borderRadius: '16px', padding: '24px', border: '1px solid #bae6fd' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>💡 Tips de Pro</h2>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: 1.8 }}>
            <li>Appelez le matin (9-11h) ou fin d'après (16-17h) pour plus de chances d'avoir le décideur</li>
            <li>Souriez avant d'appeler — ça s'entend !</li>
            <li>Posez plus de questions que vous ne faites de pitchs</li>
            <li>Mémorisez le script jusqu'à le maîtriser, puis adaptez-le naturellement</li>
            <li>Si on vous dit non : "Puis-je juste vous demander pourquoi ?" est votre meilleur ami</li>
          </ul>
        </div>
      </main>

      {/* Objections Chatbot */}
      <button onClick={() => setChatOpen(true)} style={{
        position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px',
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '50%',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(139,92,246,0.4)', zIndex: 50, transition: 'transform 0.2s'
      }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
         onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        <MessageCircle size={24} color="white" />
      </button>

      {chatOpen && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px', width: '380px', maxWidth: 'calc(100vw - 2rem)',
          background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', zIndex: 50, height: '500px', overflow: 'hidden'
        }}>
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '14px' }}>Aide Objections</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>Conseils en temps réel</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 13px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#f3f4f6',
                  color: msg.role === 'user' ? 'white' : '#1f2937',
                  fontSize: '13px', lineHeight: '1.5'
                }}>
                  {renderText(msg.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#f3f4f6', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: '4px' }}>
                  {[0, 150, 300].map(delay => (
                    <span key={delay} style={{
                      width: '7px', height: '7px', background: '#9ca3af', borderRadius: '50%',
                      animation: 'bounce 1s infinite', animationDelay: `${delay}ms`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Quelle objection avez-vous reçue ?"
                style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', outline: 'none' }}
              />
              <button onClick={sendMessage} disabled={!input.trim() || loading} style={{
                width: '40px', height: '40px', background: input.trim() ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)' : '#e5e7eb',
                border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Send size={16} color={input.trim() ? 'white' : '#9ca3af'} />
              </button>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
    </div>
  )
}
