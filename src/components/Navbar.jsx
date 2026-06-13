import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Phone, Calendar, LayoutDashboard, LogOut, Menu, X, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/appointments', label: 'Rendez-vous', icon: Calendar },
    { to: '/cold-call', label: 'Session cold call', icon: Phone },
    { to: '/scripts', label: 'Scripts', icon: BookOpen },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>ProspectPro</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px',
              fontSize: '14px', fontWeight: 500, textDecoration: 'none',
              background: isActive(to) ? '#f0f9ff' : 'transparent',
              color: isActive(to) ? '#0284c7' : '#6b7280',
            }}>
              <Icon size={16} />{label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280', background: '#f3f4f6', padding: '4px 12px', borderRadius: '20px' }}>
            {user?.name || user?.username}
          </span>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'none' }}>
            <LogOut size={15} />Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}
