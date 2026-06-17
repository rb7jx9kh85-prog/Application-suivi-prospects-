import { useState, useEffect, useCallback } from 'react'
import { mk } from '../lib/db'

export function useProspects() {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const Pros = mk('pros')

  const fetchProspects = useCallback(() => {
    setLoading(true)
    setError(null)
    try {
      setProspects(Pros.all())
    } catch (e) {
      setError(e.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProspects() }, [fetchProspects])

  const updateProspect = useCallback((id, data) => {
    setError(null)
    try {
      Pros.upd(id, data)
      setProspects(Pros.all())
    } catch (e) {
      setError(e.message || 'Erreur lors de la mise à jour')
      throw e
    }
  }, [])

  const addProspect = useCallback((data) => {
    setError(null)
    try {
      Pros.add(data)
      setProspects(Pros.all())
    } catch (e) {
      setError(e.message || 'Erreur lors de l\'ajout')
      throw e
    }
  }, [])

  const deleteProspect = useCallback((id) => {
    setError(null)
    try {
      Pros.del(id)
      setProspects(p => p.filter(x => x.id !== id))
    } catch (e) {
      setError(e.message || 'Erreur lors de la suppression')
      throw e
    }
  }, [])

  return { prospects, loading, error, fetchProspects, updateProspect, addProspect, deleteProspect }
}
