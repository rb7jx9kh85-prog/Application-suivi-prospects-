import { useState, useEffect } from 'react'

const PROSPECTS_KEY = 'app_prospects'

export function useColdCall() {
  const [prospects, setProspects] = useState([])

  useEffect(() => {
    setProspects(JSON.parse(localStorage.getItem(PROSPECTS_KEY) || '[]'))
  }, [])

  const saveProspects = (data) => {
    localStorage.setItem(PROSPECTS_KEY, JSON.stringify(data))
    setProspects(data)
  }

  const addProspect = (prospect) => {
    const newProspect = { ...prospect, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'to_call' }
    saveProspects([newProspect, ...prospects])
    return newProspect
  }

  const updateProspect = (id, updates) => {
    saveProspects(prospects.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deleteProspect = (id) => {
    saveProspects(prospects.filter(p => p.id !== id))
  }

  return { prospects, addProspect, updateProspect, deleteProspect }
}
