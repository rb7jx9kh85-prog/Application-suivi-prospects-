import React, { useState, useCallback } from 'react'
import { Zap, Plus, Trash2, Pencil, Search, X, ChevronDown, ChevronUp, Users, Phone, CheckCircle } from 'lucide-react'
import { useProspects } from './hooks/useProspects'
import EnrichmentButton from './components/EnrichmentButton'

/* ─── Design Tokens ─────────────────────────────────────────── */
const T = {
  bg:       '#0a0a0a',
  surface:  '#141414',
  surface2: '#1e1e1e',
  border:   '#272727',
  border2:  '#333',
  primary:  '#3b82f6',
  primaryH: '#2563eb',
  success:  '#10b981',
  danger:   '#ef4444',
  textPri:  '#f0f0f0',
  textSec:  '#9ca3af',
  textMut:  '#4b5563',
}

/* ─── Status config ─────────────────────────────────────────── */
const STATUS = {
  to_call:   { label: 'À appeler',  bg: 'rgba(59,130,246,.12)',  c: '#60a5fa' },
  called:    { label: 'Appelé',     bg: 'rgba(99,102,241,.12)',  c: '#818cf8' },
  voicemail: { label: 'Répondeur',  bg: 'rgba(234,179,8,.12)',   c: '#fbbf24' },
  refusal:   { label: 'Refus',      bg: 'rgba(239,68,68,.12)',   c: '#f87171' },
  video_rdv: { label: 'RDV ✅',     bg: 'rgba(16,185,129,.12)',  c: '#34d399' },
}

const EMPTY_FORM = { establishment: '', website: '', domain: '', city: '', contact: '', status: 'to_call', notes: '' }

/* ─── Skeleton Row ───────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[140, 110, 90, 80, 70].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div style={{ height: 14, width: w, borderRadius: 6, background: 'rgba(255,255,255,.05)', animation: 'pulse 1.6s ease-in-out infinite' }} />
        </td>
      ))}
      <td style={{ padding: '14px 16px' }}>
        <div style={{ height: 32, width: 90, borderRadius: 8, background: 'rgba(255,255,255,.05)', animation: 'pulse 1.6s ease-in-out infinite' }} />
      </td>
    </tr>
  )
}

/* ─── Status Badge ───────────────────────────────────────────── */
function Badge({ status }) {
  const s = STATUS[status] || STATUS.to_call
  return (
    <span style={{ background: s.bg, color: s.c, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, letterSpacing: '.3px', whiteSpace: 'nowrap', display: 'inline-block' }}>
      {s.label}
    </span>
  )
}

/* ─── Icon Button ────────────────────────────────────────────── */
function IconBtn({ icon: Icon, onClick, label, danger, size = 16 }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 34, borderRadius: 8, border: `1px solid ${hov ? (danger ? T.danger : T.border2) : T.border}`,
        background: hov ? (danger ? 'rgba(239,68,68,.1)' : T.surface2) : 'transparent',
        color: hov ? (danger ? T.danger : T.textPri) : T.textSec,
        cursor: 'pointer', transition: 'all .18s ease-out', flexShrink: 0,
      }}
    >
      <Icon size={size} />
    </button>
  )
}

/* ─── Input ──────────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, as: Tag = 'input', rows, type = 'text' }) {
  const [focus, setFocus] = useState(false)
  const props = { value, onChange, placeholder, onFocus: () => setFocus(true), onBlur: () => setFocus(false) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.textSec, letterSpacing: '.3px' }}>{label}</label>
      <Tag {...props} type={type} rows={rows}
        style={{
          background: T.surface2, border: `1px solid ${focus ? T.primary : T.border}`,
          borderRadius: 10, padding: '11px 13px', color: T.textPri, fontSize: 14, outline: 'none',
          resize: Tag === 'textarea' ? 'vertical' : undefined,
          boxShadow: focus ? '0 0 0 3px rgba(59,130,246,.15)' : 'none', transition: 'border .15s, box-shadow .15s',
        }}
      />
    </div>
  )
}

/* ─── Add / Edit Modal ───────────────────────────────────────── */
function Modal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div
      role="dialog" aria-modal="true" aria-label={initial?.id ? 'Modifier prospect' : 'Nouveau prospect'}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}
    >
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.textPri }}>
            {initial?.id ? '✏️ Modifier le prospect' : '➕ Nouveau prospect'}
          </h2>
          <button aria-label="Fermer" onClick={onClose} style={{ background: 'none', border: 'none', color: T.textSec, cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>

        <Field label="Nom / Établissement *" value={form.establishment} onChange={e => upd('establishment', e.target.value)} placeholder="Ex: Restaurant Le Gourmet" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Site web" value={form.website} onChange={e => upd('website', e.target.value)} placeholder="https://..." />
          <Field label="Secteur" value={form.domain} onChange={e => upd('domain', e.target.value)} placeholder="Ex: Restauration" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Ville" value={form.city} onChange={e => upd('city', e.target.value)} placeholder="Genève, Zurich..." />
          <Field label="Contact" value={form.contact} onChange={e => upd('contact', e.target.value)} placeholder="Décideur" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textSec, letterSpacing: '.3px' }}>Statut</label>
          <select value={form.status} onChange={e => upd('status', e.target.value)}
            style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 13px', color: T.textPri, fontSize: 14, outline: 'none', cursor: 'pointer' }}>
            {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
          </select>
        </div>
        <Field label="Notes" value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Infos utiles pour l'appel..." as="textarea" rows={3} />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button onClick={onClose} aria-label="Annuler"
            style={{ height: 44, padding: '0 20px', borderRadius: 10, border: `1px solid ${T.border}`, background: 'transparent', color: T.textSec, fontSize: 14, cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={() => { if (!form.establishment.trim()) return; onSave(form) }} aria-label="Enregistrer le prospect"
            style={{ height: 44, padding: '0 22px', borderRadius: 10, border: 'none', background: T.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Stat Card ──────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

/* ─── Main App ───────────────────────────────────────────────── */
export default function App() {
  const { prospects, loading, addProspect, updateProspect, deleteProspect } = useProspects()
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)   // null | {} (new) | prospect obj (edit)
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = prospects.filter(p => {
    const q = query.toLowerCase()
    const matchQ = !q || [p.establishment, p.domain, p.city, p.contact].some(f => (f || '').toLowerCase().includes(q))
    return matchQ && (filterStatus === 'all' || p.status === filterStatus)
  })

  const handleSave = useCallback((form) => {
    if (modal?.id) updateProspect(modal.id, form)
    else addProspect(form)
    setModal(null)
  }, [modal, updateProspect, addProspect])

  const handleDelete = useCallback((id, e) => {
    e.stopPropagation()
    if (!confirm('Supprimer ce prospect ?')) return
    deleteProspect(id)
    if (selected === id) setSelected(null)
  }, [deleteProspect, selected])

  const stats = {
    total: prospects.length,
    toCall: prospects.filter(p => p.status === 'to_call').length,
    rdv: prospects.filter(p => p.status === 'video_rdv').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.textPri, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; }
        body { background: ${T.bg}; }
        input, select, textarea, button { font-family: inherit; }
        input::placeholder, textarea::placeholder { color: ${T.textMut}; }
        select option { background: #1e1e1e; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        @keyframes pulse { 0%,100% { opacity:.4 } 50% { opacity:.8 } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }
        .tr-row { cursor: pointer; transition: background .15s ease-out; }
        .tr-row:hover td { background: rgba(255,255,255,.03); }
        .tr-row.active td { background: rgba(59,130,246,.06); }
        .tr-row td:first-child { border-left: 2px solid transparent; transition: border-color .15s; }
        .tr-row.active td:first-child { border-left-color: ${T.primary}; }
        @media (max-width: 768px) {
          .hide-tablet { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          table thead { display: none; }
          table tbody tr { display: flex; flex-direction: column; padding: 12px 16px; border-bottom: 1px solid ${T.border}; }
          table tbody tr td { padding: 2px 0; border: none !important; }
          table tbody tr td:first-child { border-left: none !important; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,10,.92)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${T.border}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.4px', background: 'linear-gradient(90deg,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
              🚀 Alpinia Prospect Pro
            </h1>
            <p style={{ fontSize: 11, color: T.textMut, fontWeight: 500, marginTop: 1 }}>Enrichissement IA · Prospection B2B</p>
          </div>
          <button
            aria-label="Ajouter un nouveau prospect"
            onClick={() => setModal({})}
            style={{ display: 'flex', alignItems: 'center', gap: 7, height: 44, padding: '0 18px', borderRadius: 10, border: 'none', background: T.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = T.primaryH}
            onMouseLeave={e => e.currentTarget.style.background = T.primary}
          >
            <Plus size={16} /> Ajouter prospect
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          <StatCard icon={Users}       label="Total prospects" value={stats.total}  color={T.primary} />
          <StatCard icon={Phone}       label="À appeler"       value={stats.toCall} color='#f59e0b' />
          <StatCard icon={CheckCircle} label="RDV obtenus"     value={stats.rdv}    color={T.success} />
        </div>

        {/* ── Toolbar ────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMut, pointerEvents: 'none' }} />
            <input
              aria-label="Rechercher un prospect"
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher..."
              style={{ width: '100%', height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '0 14px 0 36px', color: T.textPri, fontSize: 14, outline: 'none' }}
            />
          </div>
          <select
            aria-label="Filtrer par statut"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '0 14px', color: T.textPri, fontSize: 14, outline: 'none', minWidth: 150, cursor: 'pointer' }}
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
          </select>
        </div>

        {/* ── Table ──────────────────────────────────────────── */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {['Nom / Établissement', 'Site web', 'Secteur', 'Ville', 'Statut', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                    color: T.textMut, letterSpacing: '.6px', textTransform: 'uppercase',
                    background: 'rgba(255,255,255,.02)', whiteSpace: 'nowrap',
                    ...(i >= 1 && i <= 3 ? { display: 'table-cell' } : {}),
                  }} className={i >= 1 && i <= 3 ? 'hide-tablet' : ''}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                    <p style={{ fontWeight: 600, fontSize: 15, color: T.textSec, marginBottom: 6 }}>Aucun prospect</p>
                    <p style={{ fontSize: 13, color: T.textMut, marginBottom: 20 }}>Ajoutez votre premier prospect pour commencer</p>
                    <button onClick={() => setModal({})} aria-label="Ajouter un premier prospect"
                      style={{ height: 44, padding: '0 20px', borderRadius: 10, border: 'none', background: T.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      + Ajouter un prospect
                    </button>
                  </td>
                </tr>
              ) : filtered.map(p => {
                const isActive = selected === p.id
                return (
                  <React.Fragment key={p.id}>
                    <tr
                      className={`tr-row${isActive ? ' active' : ''}`}
                      onClick={() => setSelected(isActive ? null : p.id)}
                      aria-expanded={isActive}
                    >
                      {/* Name */}
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: `${T.primary}22`, border: `1px solid ${T.primary}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: T.primary, flexShrink: 0, fontFamily: "'Courier Prime', monospace" }}>
                            {(p.establishment || '?').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: T.textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.establishment}</div>
                            {p.contact && <div style={{ fontSize: 11, color: T.textMut, marginTop: 1 }}>{p.contact}</div>}
                          </div>
                        </div>
                      </td>
                      {/* Website */}
                      <td className="hide-tablet" style={{ padding: '13px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.textSec, maxWidth: 160 }}>
                        {p.website
                          ? <a href={p.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} aria-label={`Site de ${p.establishment}`}
                              style={{ color: '#60a5fa', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                              {p.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </a>
                          : <span style={{ color: T.textMut }}>—</span>}
                      </td>
                      {/* Type */}
                      <td className="hide-tablet" style={{ padding: '13px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.textSec }}>{p.domain || <span style={{ color: T.textMut }}>—</span>}</td>
                      {/* City */}
                      <td className="hide-tablet" style={{ padding: '13px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 13, color: T.textSec }}>{p.city || <span style={{ color: T.textMut }}>—</span>}</td>
                      {/* Status */}
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
                        <select
                          aria-label={`Statut de ${p.establishment}`}
                          value={p.status}
                          onChange={e => updateProspect(p.id, { status: e.target.value })}
                          style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 10px', color: T.textPri, fontSize: 12, outline: 'none', cursor: 'pointer', width: '100%' }}
                        >
                          {Object.entries(STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                        </select>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${T.border}` }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <IconBtn icon={Zap} label={`Enrichir ${p.establishment}`} onClick={() => setSelected(isActive ? null : p.id)} />
                          <IconBtn icon={Pencil} label={`Modifier ${p.establishment}`} onClick={() => setModal(p)} />
                          <IconBtn icon={Trash2} label={`Supprimer ${p.establishment}`} danger onClick={e => handleDelete(p.id, e)} />
                        </div>
                      </td>
                    </tr>

                    {/* Enrichment panel */}
                    {isActive && (
                      <tr>
                        <td colSpan={6} style={{ padding: 0, borderBottom: `1px solid ${T.border}`, background: 'rgba(59,130,246,.03)' }}>
                          <div style={{ padding: '20px 24px', animation: 'slideDown .25s ease-out' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                              <Zap size={14} color={T.success} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: T.success, letterSpacing: '.3px', textTransform: 'uppercase' }}>Enrichissement IA — {p.establishment}</span>
                            </div>
                            <EnrichmentButton
                              prospectId={p.id}
                              prospectName={p.establishment}
                              website={p.website || ''}
                              type={p.domain || ''}
                              city={p.city || ''}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 12, color: T.textMut, marginTop: 24 }}>
          {filtered.length} prospect{filtered.length !== 1 ? 's' : ''} · Alpinia Prospect Pro ✨
        </p>
      </main>

      {/* Modal */}
      {modal !== null && (
        <Modal
          initial={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
