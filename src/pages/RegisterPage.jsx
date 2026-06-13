import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'

const USERS_KEY = 'app_users'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const inputStyle = {
    width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px',
    fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 500))

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    if (users.find(u => u.email === form.email || u.username === form.email)) {
      setError('Un compte avec cet email existe déjà.')
      setLoading(false)
      return
    }

    const newUser = { id: Date.now().toString(), username: form.email, email: form.email, password: form.password, name: form.name || form.email.split('@')[0] }
    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    localStorage.setItem('app_session', JSON.stringify(newUser))

    navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #eff6ff 50%, #faf5ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 25px rgba(14,165,233,0.35)' }}>
              <Phone size={28} color="white" />
            </div>
          </Link>
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800, color: '#111827' }}>Créer un compte</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>Rejoignez ProspectPro gratuitement</p>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.06)', padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Prénom / Nom</label>
              <input type="text" style={inputStyle} value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Votre prénom et nom"
                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Adresse email *</label>
              <input type="email" required style={inputStyle} value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="votre@email.com"
                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} required style={{ ...inputStyle, paddingRight: '44px' }}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Confirmer le mot de passe *</label>
              <input type={showPass ? 'text' : 'password'} required style={inputStyle}
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                placeholder="Répétez votre mot de passe"
                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', color: '#dc2626', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', border: '1px solid #fecaca' }}>
                <AlertCircle size={16} />{error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(14,165,233,0.35)', opacity: loading ? 0.75 : 1
            }}>
              {loading
                ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Création...</>
                : <><UserPlus size={16} /> Créer mon compte</>
              }
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Se connecter</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#9ca3af' }}>
          <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>← Retour à l'accueil</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
