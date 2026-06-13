import { useState, useEffect } from 'react'

const CALLS_KEY = 'app_calls'
const APPOINTMENTS_KEY = 'app_appointments'

export function useData() {
  const [calls, setCalls] = useState([])
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    setCalls(JSON.parse(localStorage.getItem(CALLS_KEY) || '[]'))
    setAppointments(JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]'))
  }, [])

  const saveCalls = (data) => {
    localStorage.setItem(CALLS_KEY, JSON.stringify(data))
    setCalls(data)
  }

  const saveAppointments = (data) => {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(data))
    setAppointments(data)
  }

  const addCall = (call) => {
    const newCall = { ...call, id: Date.now().toString(), createdAt: new Date().toISOString() }
    saveCalls([newCall, ...calls])
    return newCall
  }

  const updateCall = (id, updates) => saveCalls(calls.map(c => c.id === id ? { ...c, ...updates } : c))
  const deleteCall = (id) => saveCalls(calls.filter(c => c.id !== id))

  const addAppointment = (appt) => {
    const newAppt = { ...appt, id: Date.now().toString(), createdAt: new Date().toISOString() }
    saveAppointments([newAppt, ...appointments])
    return newAppt
  }

  const updateAppointment = (id, updates) => saveAppointments(appointments.map(a => a.id === id ? { ...a, ...updates } : a))
  const deleteAppointment = (id) => saveAppointments(appointments.filter(a => a.id !== id))

  return { calls, appointments, addCall, updateCall, deleteCall, addAppointment, updateAppointment, deleteAppointment }
}
