import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '../lib/auth'
import { toast } from '../components/Toast'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  function submit() {
    if (!name || !email || !pw) { setErr('Remplissez tous les champs.'); return }
    if (pw.length < 6) { setErr('Mot de passe trop court (min. 6 caractères).'); return }
    const r = Auth.register(name, email, pw)
    if (r.err) { setErr(r.err); return }
    toast('Compte créé ! Bienvenue 🎉'); navigate('/dashboard')
  }

  return (
    <div className="auth-wrap">
      <div style={{ position: 'absolute', top: '15%', left: '15%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-ic">🚀</div>
          <div className="auth-t">Créer un compte</div>
          <div className="auth-s">Gratuit · 30 secondes · Aucune CB</div>
        </div>
        {err && <div className="auth-err">{err}</div>}
        <div className="fg"><label className="fl">Prénom & Nom</label><input className="fi" placeholder="Jean Dupont" autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="fg"><label className="fl">Email</label><input className="fi" type="email" placeholder="vous@exemple.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="fg"><label className="fl">Mot de passe (min. 6 caractères)</label><input className="fi" type="password" placeholder="••••••••" autoComplete="new-password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} /></div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} onClick={submit}>Créer mon compte gratuit →</button>
        <p className="auth-foot">Déjà un compte ? <a onClick={() => navigate('/login')}>Se connecter</a></p>
        <p className="auth-foot" style={{ marginTop: 6 }}><a onClick={() => navigate('/')} style={{ color: 'var(--text3)' }}>← Retour à l'accueil</a></p>
      </div>
    </div>
  )
}
