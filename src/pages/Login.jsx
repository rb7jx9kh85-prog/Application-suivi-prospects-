import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '../lib/auth'
import { toast } from '../components/Toast'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  function submit() {
    if (!email || !pw) { setErr('Remplissez tous les champs.'); return }
    const r = Auth.login(email, pw)
    if (r.err) { setErr(r.err); return }
    toast('Connexion réussie !'); navigate('/dashboard')
  }

  return (
    <div className="auth-wrap">
      <div style={{ position: 'absolute', top: '15%', left: '15%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.15) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-ic">📞</div>
          <div className="auth-t">Bon retour !</div>
          <div className="auth-s">Connectez-vous à votre espace</div>
        </div>
        {err && <div className="auth-err">{err}</div>}
        <div className="fg"><label className="fl">Email</label><input className="fi" type="email" placeholder="vous@exemple.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="fg"><label className="fl">Mot de passe</label><input className="fi" type="password" placeholder="••••••••" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} /></div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} onClick={submit}>Se connecter →</button>
        <p className="auth-foot">Pas encore de compte ? <a onClick={() => navigate('/register')}>Créer un compte gratuit</a></p>
        <p className="auth-foot" style={{ marginTop: 6 }}><a onClick={() => navigate('/')} style={{ color: 'var(--text3)' }}>← Retour à l'accueil</a></p>
      </div>
    </div>
  )
}
