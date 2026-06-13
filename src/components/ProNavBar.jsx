import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Calendar, Phone, BookOpen, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Rendez-vous', path: '/appointments', icon: Calendar },
  { label: 'Appels', path: '/cold-call', icon: Phone },
  { label: 'Scripts', path: '/scripts', icon: BookOpen }
]

export default function ProNavBar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = () => {
    logout()
  }

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-violet-500/20 backdrop-blur-lg z-40">
        <div className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center w-16 h-16 transition-colors ${
                  isActive ? 'text-violet-500' : 'text-gray-400 hover:text-violet-400'
                }`}
              >
                <Icon size={24} />
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 bg-black/50 border-b border-violet-500/20 backdrop-blur-xl z-40"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
            <Phone size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">ProspectPro</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-violet-500/20 rounded-full p-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-full transition-all flex items-center gap-2 text-sm font-medium ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={16} />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden sm:inline">{user?.name || user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-400 hover:text-violet-400 transition-colors flex items-center gap-2 text-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
