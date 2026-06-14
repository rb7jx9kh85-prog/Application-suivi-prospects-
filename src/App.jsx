import React, { useState } from 'react'
import { useProspects } from './hooks/useProspects'
import EnrichmentButton from './components/EnrichmentButton'

const STATUS_LABELS = {
  to_call: { l: 'À appeler', bg: 'rgba(14,165,233,.15)', c: '#38bdf8' },
  called: { l: 'Appelé', bg: 'rgba(59,130,246,.15)', c: '#60a5fa' },
  voicemail: { l: 'Répondeur', bg: 'rgba(234,179,8,.15)', c: '#facc15' },
  refusal: { l: 'Refus', bg: 'rgba(239,68,68,.15)', c: '#f87171' },
  video_rdv: { l: 'RDV ✅', bg: 'rgba(34,197,94,.15)', c: '#4ade80' },
}

const EMPTY = { establishment: '', website: '', domain: '', city: '', status: 'to_call', contact: '', notes: '' }

function Badge({ status }) {
  const s = STATUS_LABELS[status] || STATUS_LABELS.to_call
  return (
    <span style={{ background: s.bg, color: s.c, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.l}
    </span>
  )
}

function Modal({ prospect, onClose, onSave }) {
  const [form, setForm] = useState(prospect || EMPTY)
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))
  function submit(e) {
    e.preventDefault()
    if (!form.establishment.trim()) return
    onSave(form)
  }
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <form onSubmit={submit}
        style={{ background: '#111', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
          {prospect?.id ? '✏️ Modifier le prospect' : '➕ Nouveau prospect'}
        </h2>
        {[
          { k: 'establishment', l: 'Nom *', ph: 'Ex: Restaurant Le Gourmet' },
          { k: 'website', l: 'Site web', ph: 'https://...' },
          { k: 'domain', l: 'Secteur', ph: 'Ex: Restauration, IT...' },
          { k: 'city', l: 'Ville', ph: 'Paris, Lyon...' },
          { k: 'contact', l: 'Contact', ph: 'Décideur' },
        ].map(({ k, l, ph }) => (
          <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>{l}</label>
            <input value={form[k]} onChange={e => upd(k, e.target.value)} placeholder={ph}
              style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }} />
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>Statut</label>
          <select value={form.status} onChange={e => upd('status', e.target.value)}
            style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}>
            {Object.entries(STATUS_LABELS).map(([v, s]) => <option key={v} value={v}>{s.l}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>Notes</label>
          <textarea value={form.notes} onChange={e => upd('notes', e.target.value)} rows={3} placeholder="Infos utiles..."
            style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onClose}
            style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '9px 20px', color: '#aaa', fontSize: 14, cursor: 'pointer' }}>
            Annuler
          </button>
          <button type="submit"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: 10, padding: '9px 20px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}

export default function App() {
  const { prospects, addProspect, updateProspect, deleteProspect } = useProspects()
  const [expanded, setExpanded] = useState(null)
  const [modal, setModal] = useState(null)
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = prospects.filter(p => {
    const q = query.toLowerCase()
    const matchQ = !q || (p.establishment || '').toLowerCase().includes(q) || (p.domain || '').toLowerCase().includes(q) || (p.city || '').toLowerCase().includes(q)
    const matchS = filterStatus === 'all' || p.status === filterStatus
    return matchQ && matchS
  })

  function saveProspect(form) {
    if (modal?.id) updateProspect(modal.id, form)
    else addProspect(form)
    setModal(null)
  }

  function handleDelete(id, e) {
    e.stopPropagation()
    if (!confirm('Supprimer ce prospect ?')) return
    deleteProspect(id)
    if (expanded === id) setExpanded(null)
  }

  function toggleRow(id) {
    setExpanded(prev => prev === id ? null : id)
  }

  const stats = {
    total: prospects.length,
    toCall: prospects.filter(p => p.status === 'to_call').length,
    rdv: prospects.filter(p => p.status === 'video_rdv').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        input, select, textarea { color-scheme: dark; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,.25); }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .row-hover { transition: background .15s; cursor: pointer; }
        .row-hover:hover { background: rgba(124,58,237,.08) !important; }
        .del-btn:hover { color: #f87171 !important; }
        @media(max-width:768px){
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .desktop-col { display: none !important; }
          .table-head { display: none !important; }
          .prospect-row { flex-direction: column; align-items: flex-start !important; gap: 8px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,.07)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'sticky', top: 0, background: 'rgba(10,10,10,.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🚀 Alpinia Prospect Pro
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>Enrichissement IA · Prospection B2B</p>
        </div>
        <button onClick={() => setModal({})}
          style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: 12, padding: '10px 20px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          + Ajouter un prospect
        </button>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total prospects', value: stats.total, color: '#a78bfa', icon: '👥' },
            { label: 'À appeler', value: stats.toCall, color: '#38bdf8', icon: '📞' },
            { label: 'RDV obtenus', value: stats.rdv, color: '#4ade80', icon: '✅' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: '6px 0 2px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: .4 }}>🔍</span>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un prospect..."
              style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '10px 14px 10px 36px', color: '#fff', fontSize: 14, outline: 'none' }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', minWidth: 140 }}>
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([v, s]) => <option key={v} value={v}>{s.l}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, overflow: 'hidden' }}>
          {/* Table header */}
          <div className="table-head" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1.2fr 80px', gap: 0, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.03)' }}>
            {['Nom / Établissement', 'Site web', 'Secteur', 'Ville', 'Statut', 'Actions'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.6px' }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,.3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>Aucun prospect</p>
              <p style={{ margin: '6px 0 0', fontSize: 13 }}>Ajoutez votre premier prospect</p>
              <button onClick={() => setModal({})}
                style={{ marginTop: 16, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: 'none', borderRadius: 10, padding: '9px 20px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                + Ajouter
              </button>
            </div>
          ) : filtered.map((p, i) => {
            const isExp = expanded === p.id
            return (
              <div key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                <div className="row-hover prospect-row"
                  onClick={() => toggleRow(p.id)}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1.2fr 80px', gap: 0, padding: '14px 20px', alignItems: 'center', background: isExp ? 'rgba(124,58,237,.07)' : 'transparent' }}>
                  {/* Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,rgba(124,58,237,.3),rgba(168,85,247,.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#a78bfa', flexShrink: 0 }}>
                      {(p.establishment || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.establishment}</div>
                      {p.contact && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>{p.contact}</div>}
                    </div>
                  </div>
                  {/* Website */}
                  <div className="desktop-col" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.website ? <a href={p.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#818cf8', textDecoration: 'none' }}>{p.website.replace(/https?:\/\//, '')}</a> : <span style={{ opacity: .3 }}>—</span>}
                  </div>
                  {/* Type */}
                  <div className="desktop-col" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.domain || <span style={{ opacity: .3 }}>—</span>}</div>
                  {/* City */}
                  <div className="desktop-col" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>{p.city || <span style={{ opacity: .3 }}>—</span>}</div>
                  {/* Status */}
                  <div onClick={e => e.stopPropagation()}>
                    <select value={p.status}
                      onChange={e => { updateProspect(p.id, { status: e.target.value }) }}
                      style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '5px 8px', color: '#fff', fontSize: 12, outline: 'none', width: '100%', cursor: 'pointer' }}>
                      {Object.entries(STATUS_LABELS).map(([v, s]) => <option key={v} value={v}>{s.l}</option>)}
                    </select>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setModal(p)} title="Modifier"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 15, padding: '4px 6px', borderRadius: 7, color: 'rgba(255,255,255,.5)' }}>✏️</button>
                    <button className="del-btn" onClick={e => handleDelete(p.id, e)} title="Supprimer"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 15, padding: '4px 6px', borderRadius: 7, color: 'rgba(255,255,255,.3)', transition: 'color .15s' }}>🗑️</button>
                  </div>
                </div>

                {/* Enrichment panel */}
                {isExp && (
                  <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255,255,255,.05)', background: 'rgba(124,58,237,.04)' }}>
                    <div style={{ paddingTop: 16 }}>
                      <EnrichmentButton
                        prospectId={p.id}
                        prospectName={p.establishment}
                        website={p.website || ''}
                        type={p.domain || ''}
                        city={p.city || ''}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,.2)', marginTop: 24 }}>
          {filtered.length} prospect{filtered.length !== 1 ? 's' : ''} · Alpinia Prospect Pro ✨
        </p>
      </main>

      {modal !== null && (
        <Modal
          prospect={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={saveProspect}
        />
      )}
    </div>
  )
}
