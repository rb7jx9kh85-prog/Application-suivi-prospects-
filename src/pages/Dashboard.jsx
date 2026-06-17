import React, { useState } from 'react'
import Nav from '../components/Nav'
import Chatbot from '../components/Chatbot'
import { mk } from '../lib/db'
import { initials } from '../lib/storage'
import { toast } from '../components/Toast'

const CS = {
  completed: { l: 'Complété', bg: 'rgba(34,197,94,.15)', c: '#4ade80' },
  pending: { l: 'En attente', bg: 'rgba(234,179,8,.15)', c: '#facc15' },
  no_answer: { l: 'Injoignable', bg: 'rgba(239,68,68,.15)', c: '#f87171' },
  callback: { l: 'Rappel', bg: 'rgba(59,130,246,.15)', c: '#60a5fa' },
}

const EMPTY = { establishment: '', contact: '', date: new Date().toISOString().split('T')[0], time: '', status: 'pending', notes: '' }

export default function Dashboard() {
  const Calls = mk('calls')
  const [calls, setCalls] = useState(() => Calls.all())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null) // null | { id?, fields }
  const [form, setForm] = useState(EMPTY)

  const refresh = () => setCalls(Calls.all())
  const total = calls.length
  const done = calls.filter(c => c.status === 'completed').length
  const pct = total ? Math.round(done / total * 100) : 0
  const day = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const filtered = calls.filter(c =>
    (!query || (c.establishment || '').toLowerCase().includes(query.toLowerCase()) || (c.contact || '').toLowerCase().includes(query.toLowerCase())) &&
    (filter === 'all' || c.status === filter)
  )

  function openNew() { setForm({ ...EMPTY, date: new Date().toISOString().split('T')[0] }); setModal({}) }
  function openEdit(c) { setForm({ establishment: c.establishment || '', contact: c.contact || '', date: c.date || '', time: c.time || '', status: c.status || 'pending', notes: c.notes || '' }); setModal({ id: c.id }) }
  function closeModal() { setModal(null) }

  function save() {
    if (!form.establishment.trim()) { toast('Établissement requis.', 'err'); return }
    if (modal?.id) { Calls.upd(modal.id, form); toast('Appel mis à jour !') }
    else { Calls.add(form); toast('Appel enregistré !') }
    closeModal(); refresh()
  }

  function del(id) {
    if (!confirm('Supprimer cet appel ?')) return
    Calls.del(id); toast('Appel supprimé.'); refresh()
  }

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <Nav />
      <div className="page">
        <div className="ph">
          <div><h1 className="pt">Tableau de bord</h1><p className="ps" style={{ textTransform: 'capitalize' }}>{day}</p></div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nouvel appel</button>
        </div>

        <div className="stat-grid">
          {[
            { ic: '📞', l: 'Total appels', v: total, bg: 'rgba(168,85,247,.14)' },
            { ic: '✅', l: 'Complétés', v: done, bg: 'rgba(34,197,94,.14)' },
            { ic: '⏳', l: 'En attente', v: calls.filter(c => c.status === 'pending').length, bg: 'rgba(234,179,8,.14)' },
            { ic: '❌', l: 'Injoignables', v: calls.filter(c => c.status === 'no_answer').length, bg: 'rgba(239,68,68,.14)' },
          ].map(s => (
            <div key={s.l} className="stat-card">
              <div className="stat-ico" style={{ background: s.bg }}>{s.ic}</div>
              <div className="stat-val">{s.v}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {total > 0 && (
          <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Taux de conversion</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--pi)' }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--grad)', borderRadius: 6, transition: 'width .6s ease' }} />
            </div>
          </div>
        )}

        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="search-bar">
            <div className="sw"><span className="sw-ic">🔍</span><input className="si" placeholder="Rechercher..." value={query} onChange={e => setQuery(e.target.value)} /></div>
            <select className="sfl" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">Tous les statuts</option>
              {Object.entries(CS).map(([v, s]) => <option key={v} value={v}>{s.l}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-ic">📞</div>
              <div className="empty-t">Aucun appel</div>
              <div className="empty-s">Enregistrez votre premier appel</div>
              <button className="btn btn-primary btn-sm" onClick={openNew}>+ Créer un appel</button>
            </div>
          ) : filtered.map(c => {
            const s = CS[c.status] || CS.pending
            const meta = [c.contact, c.date && new Date(c.date + 'T12:00:00').toLocaleDateString('fr-FR'), c.time].filter(Boolean).join(' · ')
            return (
              <div key={c.id} className="list-row">
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.2))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--pi)', flexShrink: 0 }}>{initials(c.establishment || '?')}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.establishment || '—'}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text2)' }}>{meta}</p>
                  {c.notes && <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.notes}</p>}
                </div>
                <span className="badge" style={{ background: s.bg, color: s.c, flexShrink: 0 }}>{s.l}</span>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  <button className="ibt" onClick={() => openEdit(c)}>✏️</button>
                  <button className="ibt del" onClick={() => del(c.id)}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Chatbot />

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <h3>{modal.id ? 'Modifier l\'appel' : 'Nouvel appel'}</h3>
            <div className="g2">
              <div className="fg"><label className="fl">Établissement *</label><input className="fi" placeholder="Entreprise" value={form.establishment} onChange={e => upd('establishment', e.target.value)} /></div>
              <div className="fg"><label className="fl">Contact</label><input className="fi" placeholder="Nom du contact" value={form.contact} onChange={e => upd('contact', e.target.value)} /></div>
            </div>
            <div className="g2">
              <div className="fg"><label className="fl">Date</label><input className="fi" type="date" value={form.date} onChange={e => upd('date', e.target.value)} /></div>
              <div className="fg"><label className="fl">Heure</label><input className="fi" type="time" value={form.time} onChange={e => upd('time', e.target.value)} /></div>
            </div>
            <div className="fg"><label className="fl">Statut</label>
              <select className="fi" value={form.status} onChange={e => upd('status', e.target.value)}>
                {Object.entries(CS).map(([v, s]) => <option key={v} value={v}>{s.l}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Notes</label><textarea className="fi" rows={3} placeholder="Notes..." value={form.notes} onChange={e => upd('notes', e.target.value)} /></div>
            <div className="modal-foot">
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={save}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
