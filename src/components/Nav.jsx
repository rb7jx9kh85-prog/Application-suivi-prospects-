import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Auth } from '../lib/auth'
import { initials } from '../lib/storage'

const NAV = [
  { path: '/dashboard', label: 'Dashboard', ic: '📊' },
  { path: '/appointments', label: 'Rendez-vous', ic: '📅' },
  { path: '/cold-call', label: 'Appels', ic: '📞' },
  { path: '/scripts', label: 'Scripts IA', ic: '✨' },
]

export default function Nav() {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const active = '/' + (hash.replace('#', '') || 'dashboard').replace(/^\//, '')
  const me = Auth.me()
  const av = initials(me?.name || me?.email || '?')

  function logout() { Auth.logout(); navigate('/') }

  return (
    <>
      <nav className="app-nav">
        <div className="app-logo" onClick={() => navigate('/dashboard')}>
          <div className="app-logo-icon">📞</div>
          ProspectPro
        </div>
        <div className="nav-pills">
          {NAV.map(n => (
            <button
              key={n.path}
              className={`nav-pill${active === n.path ? ' active' : ''}`}
              onClick={() => navigate(n.path)}
            >
              {n.label}
            </button>
          ))}
        </div>
        <div className="nav-user">
          <span className="nav-name">{me?.name || me?.email || ''}</span>
          <div className="nav-avatar">{av}</div>
          <button className="btn-out" onClick={logout}>Déco</button>
        </div>
      </nav>
      <nav className="mob-nav">
        <div className="mob-nav-inner">
          {NAV.map(n => (
            <button
              key={n.path}
              className={`mob-btn${active === n.path ? ' active' : ''}`}
              onClick={() => navigate(n.path)}
            >
              <span className="ic">{n.ic}</span>
              {n.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
