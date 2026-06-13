import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const ok = login(form.username, form.password)
    if (ok) navigate('/dashboard')
    else setError('Identifiants incorrects. Essayez admin / admin123')
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px',
    fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s'
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
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800, color: '#111827' }}>Bon retour !</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>Connectez-vous à votre espace ProspectPro</p>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.06)', padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Nom d'utilisateur</label>
              <input type="text" required style={inputStyle} value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Entrez votre nom d'utilisateur"
                onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                autoComplete="username"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} required style={{ ...inputStyle, paddingRight: '44px' }}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Entrez votre mot de passe"
                  onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', color: '#dc2626', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', border: '1px solid #fecaca' }}>
                <AlertCircle size={16} />{error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(14,165,233,0.35)', opacity: loading ? 0.75 : 1, transition: 'all 0.2s'
            }}>
              {loading ? (
                <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Connexion...</>
              ) : (
                <><LogIn size={16} /> Se connecter</>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#9ca3af' }}>Compte par défaut</p>
            <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '10px 16px', display: 'inline-block' }}>
              <code style={{ fontSize: '13px', color: '#374151' }}>admin</code>
              <span style={{ color: '#9ca3af', margin: '0 8px' }}>/</span>
              <code style={{ fontSize: '13px', color: '#374151' }}>admin123</code>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#9ca3af' }}>
          <Link to="/" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 500 }}>← Retour à l'accueil</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
