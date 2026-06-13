import { useState } from 'react'
import { Key, Eye, EyeOff, CheckCircle, X } from 'lucide-react'
import { setAnthropicKey, getAnthropicKey } from '../utils/claude'

export default function ApiKeySetup({ onClose, onSaved }) {
  const [key, setKey] = useState(getAnthropicKey())
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setAnthropicKey(key.trim())
    setSaved(true)
    setTimeout(() => {
      onSaved && onSaved()
      onClose && onClose()
    }, 800)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '28px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: '#fdf4ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} color="#a855f7" />
            </div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Clé API Anthropic</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
        </div>

        <div style={{ background: '#fdf4ff', borderRadius: '12px', padding: '12px', marginBottom: '20px', fontSize: '12px', color: '#7e22ce', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 4px', fontWeight: 600 }}>🔑 À quoi ça sert ?</p>
          <p style={{ margin: 0 }}>La clé API Claude active le vrai chatbot IA pour répondre aux objections, suggérer des approches, et vous aider en temps réel. Elle est stockée uniquement sur votre navigateur, jamais envoyée ailleurs.</p>
        </div>

        <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Votre clé Anthropic (sk-ant-...)</p>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            type={show ? 'text' : 'password'}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '11px 44px 11px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
          />
          <button onClick={() => setShow(!show)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: '11px', color: '#9ca3af' }}>
          Obtenez votre clé sur{' '}
          <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7' }}>console.anthropic.com/keys</a>
        </p>

        <button onClick={handleSave} disabled={!key.trim() || saved} style={{
          width: '100%', padding: '12px', background: saved ? '#16a34a' : 'linear-gradient(135deg,#a855f7,#7c3aed)',
          border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background 0.3s'
        }}>
          {saved ? <><CheckCircle size={16} /> Clé enregistrée !</> : <><Key size={16} /> Enregistrer la clé</>}
        </button>
      </div>
    </div>
  )
}
