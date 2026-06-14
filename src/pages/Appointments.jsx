import React, { useState } from 'react'
import Nav from '../components/Nav'
import Chatbot from '../components/Chatbot'
import { mk } from '../lib/db'
import { toast } from '../components/Toast'

const AS = {
  scheduled: { l: 'Planifié', bg: 'rgba(59,130,246,.15)', c: '#60a5fa', bar: '#3b82f6' },
  confirmed: { l: 'Confirmé', bg: 'rgba(34,197,94,.15)', c: '#4ade80', bar: '#22c55e' },
  completed: { l: 'Terminé', bg: 'rgba(107,114,128,.15)', c: '#9ca3af', bar: '#6b7280' },
  cancelled: { l: 'Annulé', bg: 'rgba(239,68,68,.15)', c: '#f87171', bar: '#ef4444' },
}
const EMPTY = { establishment: '', contact: '', date: new Date().toISOString().split('T')[0], time: '', duration: '60', status: 'scheduled', location: '', notes: '' }

export default function Appointments() {
  const Appts = mk('appts')
  const [appts, setAppts] = useState(() => Appts.all())
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const refresh = () => setAppts(Appts.all())
  const now = new Date()
  const up = appts.filter(a => new Date(a.date + 'T23:59:59') >= now).sort((a, b) => a.date > b.date ? 1 : -1)
  const past = appts.filter(a => new Date(a.date + 'T23:59:59') < now).sort((a, b) => a.date < b.date ? 1 : -1)

  function openNew() { setForm({ ...EMPTY, date: new Date().toISOString().split('T')[0] }); setModal({}) }
  function openEdit(a) { setForm({ establishment: a.establishment || '', contact: a.contact || '', date: a.date || '', time: a.time || '', duration: a.duration || '60', status: a.status || 'scheduled', location: a.location || '', notes: a.notes || '' }); setModal({ id: a.id }) }
  function close() { setModal(null) }

  function save() {
    if (!form.establishment.trim() || !form.date) { toast('Établissement et date requis.', 'err'); return }
    if (modal?.id) { Appts.upd(modal.id, form); toast('RDV mis à jour !') }
    else { Appts.add(form); toast('RDV enregistré !') }
    close(); refresh()
  }

  function del(id) {
    if (!confirm('Supprimer ce rendez-vous ?')) return
    Appts.del(id); toast('RDV supprimé.'); refresh()
  }

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const renderCard = (a, dim = false) => {
    const s = AS[a.status] || AS.scheduled
    const d = new Date(a.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    return (
      <div key={a.id} className="appt-card" style={dim ? { opacity: 0.6 } : {}}>
        <div className="appt-bar" style={{ background: s.bar }} />
        <div className="appt-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{a.establishment}</p>
              {a.contact && <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text2)' }}>👤 {a.contact}</p>}
            </div>
            <span className="badge" style={{ background: s.bg, color: s.c, flexShrink: 0, marginLeft: 10 }}>{s.l}</span>
          </div>
          <p style={{ margin: '0 0 3px', fontSize: 13, color: 'var(--text2)' }}>📅 {d}</p>
          {a.time && <p style={{ margin: '0 0 3px', fontSize: 13, color: 'var(--text2)' }}>⏰ {a.time}{a.duration ? ` · ${a.duration} min` : ''}</p>}
          {a.location && <p style={{ margin: '0 0 3px', fontSize: 13, color: 'var(--text2)' }}>📍 {a.location}</p>}
          {a.notes && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{a.notes}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>✏️ Modifier</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>🗑️</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Nav />
      <div className="page">
        <div className="ph">
          <div><h1 className="pt">Rendez-vous</h1><p className="ps">{appts.length} rendez-vous au total</p></div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nouveau RDV</button>
        </div>
        {up.length > 0 && <><p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>À venir ({up.length})</p>{up.map(a => renderCard(a))}{past.length > 0 && <div className="div" />}</>}
        {past.length > 0 && <><p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Passés ({past.length})</p>{past.map(a => renderCard(a, true))}</>}
        {appts.length === 0 && (
          <div className="empty">
            <div className="empty-ic">📅</div>
            <div className="empty-t">Aucun rendez-vous</div>
            <div className="empty-s">Planifiez votre premier RDV</div>
            <button className="btn btn-primary btn-sm" onClick={openNew}>+ Créer un RDV</button>
          </div>
        )}
      </div>

      <Chatbot />

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <h3>{modal.id ? 'Modifier le RDV' : 'Nouveau rendez-vous'}</h3>
            <div className="g2">
              <div className="fg"><label className="fl">Établissement *</label><input className="fi" placeholder="Entreprise" value={form.establishment} onChange={e => upd('establishment', e.target.value)} /></div>
              <div className="fg"><label className="fl">Contact</label><input className="fi" placeholder="Nom du contact" value={form.contact} onChange={e => upd('contact', e.target.value)} /></div>
            </div>
            <div className="g2">
              <div className="fg"><label className="fl">Date *</label><input className="fi" type="date" value={form.date} onChange={e => upd('date', e.target.value)} /></div>
              <div className="fg"><label className="fl">Heure</label><input className="fi" type="time" value={form.time} onChange={e => upd('time', e.target.value)} /></div>
            </div>
            <div className="g2">
              <div className="fg"><label className="fl">Durée (min)</label><input className="fi" type="number" placeholder="60" value={form.duration} onChange={e => upd('duration', e.target.value)} /></div>
              <div className="fg"><label className="fl">Statut</label>
                <select className="fi" value={form.status} onChange={e => upd('status', e.target.value)}>
                  {Object.entries(AS).map(([v, s]) => <option key={v} value={v}>{s.l}</option>)}
                </select>
              </div>
            </div>
            <div className="fg"><label className="fl">Lieu</label><input className="fi" placeholder="Adresse ou visio" value={form.location} onChange={e => upd('location', e.target.value)} /></div>
            <div className="fg"><label className="fl">Notes</label><textarea className="fi" rows={2} placeholder="Notes..." value={form.notes} onChange={e => upd('notes', e.target.value)} /></div>
            <div className="modal-foot">
              <button className="btn btn-ghost btn-sm" onClick={close}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={save}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
