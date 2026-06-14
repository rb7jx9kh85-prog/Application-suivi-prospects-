import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Auth } from './lib/auth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import ColdCall from './pages/ColdCall'
import Scripts from './pages/Scripts'
import Toast from './components/Toast'

function Private({ children }) {
  return Auth.loggedIn() ? children : <Navigate to="/login" replace />
}
function Guest({ children }) {
  return Auth.loggedIn() ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <HashRouter>
      <Toast />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Guest><Login /></Guest>} />
        <Route path="/register" element={<Guest><Register /></Guest>} />
        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="/appointments" element={<Private><Appointments /></Private>} />
        <Route path="/cold-call" element={<Private><ColdCall /></Private>} />
        <Route path="/scripts" element={<Private><Scripts /></Private>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
