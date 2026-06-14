import React, { useState } from 'react'
import { mk } from '../lib/db'
import { toast } from './Toast'

const LABELS = {
  full_address: '📍 Adresse',
  phone: '📞 Téléphone',
  email: '📧 Email',
  opening_hours: '🕐 Horaires',
  description: '📝 Description',
  google_rating: '⭐ Note Google',
  employees_approx: '👥 Employés',
  key_decision_maker: '🎯 Décisionnaire',
}

export default function EnrichmentButton({ prospectId, prospectName, website, type, city }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [data, setData] = useState(null)
  const [expanded, setExpanded] = useState(true)
  const [errMsg, setErrMsg] = useState('')

  async function enrich() {
    setStatus('loading')
    setData(null)
    setErrMsg('')
    try {
      const res = await fetch('/.netlify/functions/enrich-prospect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId, prospectName, website, type, city }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json.enrichedData)
      setStatus('done')
      setExpanded(true)
    } catch (e) {
      setErrMsg(e.message || 'Erreur inconnue')
      setStatus('error')
    }
  }

  function save() {
    if (!data || !prospectId) return
    const Pros = mk('pros')
    const notes = Object.entries(data)
      .filter(([, v]) => v && v !== 'null')
      .map(([k, v]) => `${LABELS[k] || k}: ${v}`)
      .join('\n')
    Pros.upd(prospectId, { notes })
    toast('Infos sauvegardées dans les notes !')
  }

  const hasData = data && Object.values(data).some(v => v && v !== 'null')

  return (
    <div style={{ marginTop: 10 }}>
      {status !== 'done' && (
        <button
          className="btn btn-blue btn-sm"
          onClick={enrich}
          disabled={status === 'loading'}
          style={{ fontSize: 13 }}
        >
          {status === 'loading' ? (
            <>
              <span style={{
                display: 'inline-block', width: 12, height: 12,
                border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                borderRadius: '50%', animation: 'spin .7s linear infinite',
              }} />
              Recherche en cours...
            </>
          ) : '⚡ Enrichir ce prospect'}
        </button>
      )}

      {status === 'error' && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px' }}>
          ❌ {errMsg}
          <button className="btn btn-sm" onClick={enrich} style={{ marginLeft: 10, fontSize: 11, padding: '4px 10px' }}>Réessayer</button>
        </div>
      )}

      {status === 'done' && hasData && (
        <div className="enrich-panel" style={{ marginTop: 10 }}>
          <div
            onClick={() => setExpanded(e => !e)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', cursor: 'pointer', borderBottom: expanded ? '1px solid rgba(59,130,246,0.15)' : 'none' }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>⚡ Infos enrichies</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {expanded && (
                <button
                  className="btn btn-sm"
                  onClick={e => { e.stopPropagation(); save() }}
                  style={{ fontSize: 11, padding: '4px 10px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 7 }}
                >
                  💾 Sauvegarder
                </button>
              )}
              <button
                className="btn btn-blue btn-sm"
                onClick={e => { e.stopPropagation(); enrich() }}
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                ↺
              </button>
              <span style={{ color: 'var(--text3)', fontSize: 16 }}>{expanded ? '▲' : '▼'}</span>
            </div>
          </div>

          {expanded && (
            <div>
              {Object.entries(LABELS).map(([key, label]) => {
                const val = data[key]
                if (!val || val === 'null') return null
                return (
                  <div key={key} className="enrich-row">
                    <span className="enrich-label">{label}</span>
                    <span className="enrich-value">{val}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
