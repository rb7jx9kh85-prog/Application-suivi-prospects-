import { useState } from 'react'

const USERS_KEY = 'app_users'
const SESSION_KEY = 'app_session'

function initUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([
      { id: '1', username: 'admin', password: 'admin123', name: 'Administrateur' }
    ]))
  }
}

initUsers()

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY)
      return session ? JSON.parse(session) : null
    } catch {
      return null
    }
  })

  const login = (identifier, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const found = users.find(u =>
      (u.username === identifier || u.email === identifier) && u.password === password
    )
    if (found) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(found))
      setUser(found)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return { user, isAuthenticated: !!user, login, logout }
}
