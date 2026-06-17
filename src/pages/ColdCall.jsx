import React, { useState } from 'react'
import Nav from '../components/Nav'
import Chatbot from '../components/Chatbot'
import EnrichmentButton from '../components/EnrichmentButton'
import { mk } from '../lib/db'
import { initials } from '../lib/storage'
import { toast } from '../components/Toast'

const PS = {
  to_call: { l: 'À appeler', bg: 'rgba(14,165,233,.15)', c: '#38bdf8' },
  called: { l: 'Appelé', bg: 'rgba(59,130,246,.15)', c: '#60a5fa' },
  voicemail: { l: 'Répondeur', bg: 'rgba(234,179,8,.15)', c: '#facc15' },
  refusal: { l: 'Refus', bg: 'rgba(239,68,68,.15)', c: '#f87171' },
  video_rdv: { l: 'RDV ✅', bg: 'rgba(34,197,94,.15)', c: '#4ade80' },
}
const EMPTY = { establishment: '', domain: '', contact: '', status: 'to_call', notes: '', website: '', city: '' }

export default function ColdCall() {
  const Pros = mk('pros')
  const [pros, setPros] = useState(() => Pros.all())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [expanded, setExpanded] = useState(null)

  const refresh = () => setPros(Pros.all())
  const tc = pros.filter(p => p.status === 'to_call').length

  const filtered = pros.filter(p =>
    (!query || (p.establishment || '').toLowerCase().includes(query.toLowerCase()) || (p.domain || '').toLowerCase().includes(query.toLowerCase())) &&
    (filter === 'all' || p.status === filter)
  )

  function openNew() { setForm(EMPTY); setModal({}) }
  function openEdit(p) { setForm({ establishment: p.establishment || '', domain: p.domain || '', contact: p.contact || '', status: p.status || 'to_call', notes: p.notes || '', website: p.website || '', city: p.city || '' }); setModal({ id: p.id }) }
  function close() { setModal(null) }

  function save() {
    if (!form.establishment.trim()) { toast('Établissement requis.', 'err'); return }
    if (modal?.id) { Pros.upd(modal.id, form); toast('Prospect mis à jour !') }
    else { Pros.add(form); toast('Prospect ajouté !') }
    close(); refresh()
  }

  function del(id) {
    if (!confirm('Supprimer ce prospect ?')) return
    Pros.del(id); toast('Prospect supprimé.'); refresh()
  }

  function updStatus(id, status) {
    Pros.upd(id, { status }); refresh()
  }

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <Nav />
      <div className="page">
        <div className="ph">
          <div><h1 className="pt">Session Cold Call</h1><p className="ps">{tc} à appeler · {pros.length - tc} traités</p></div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ Ajouter un prospect</button>
        </div>

        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="search-bar">
            <div className="sw"><span className="sw-ic">🔍</span><input className="si" placeholder="Rechercher..." value={query} onChange={e => setQuery(e.target.value)} /></div>
            <select className="sfl" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">Tous les statuts</option>
              {Object.entries(PS).map(([v, s]) => <option key={v} value={v}>{s.l}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-ic">📋</div>
              <div className="empty-t">Aucun prospect</div>
              <div className="empty-s">Ajoutez votre premier prospect</div>
              <button className="btn btn-primary btn-sm" onClick={openNew}>+ Ajouter</button>
            </div>
          ) : filtered.map(p => {
            const s = PS[p.status] || PS.to_call
            const isExp = expanded === p.id
            return (
              <div key={p.id}>
                <div className="list-row" style={{ flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(168,85,247,0.18))', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--pi)', flexShrink: 0 }}>{initials(p.establishment || '?')}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{p.establishment}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text2)' }}>{[p.domain, p.contact, p.city].filter(Boolean).join(' · ')}</p>
                    {p.notes && <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notes}</p>}
                  </div>
                  <select className="sfl" style={{ fontSize: 12, padding: '5px 9px' }} value={p.status} onChange={e => updStatus(p.id, e.target.value)}>
                    {Object.entries(PS).map(([v, ss]) => <option key={v} value={v}>{ss.l}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <button className="ibt" onClick={() => setExpanded(isExp ? null : p.id)} title="Enrichir" style={{ color: '#60a5fa' }}>⚡</button>
                    <button className="ibt" onClick={() => openEdit(p)}>✏️</button>
                    <button className="ibt del" onClick={() => del(p.id)}>🗑️</button>
                  </div>
                </div>
                {isExp && (
                  <div style={{ padding: '0 20px 16px 20px' }}>
                    <EnrichmentButton
                      prospectId={p.id}
                      prospectName={p.establishment}
                      website={p.website || ''}
                      type={p.domain || ''}
                      city={p.city || ''}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Chatbot />

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <h3>{modal.id ? 'Modifier le prospect' : 'Nouveau prospect'}</h3>
            <div className="fg"><label className="fl">Établissement *</label><input className="fi" placeholder="Nom de l'entreprise" value={form.establishment} onChange={e => upd('establishment', e.target.value)} /></div>
            <div className="g2">
              <div className="fg"><label className="fl">Secteur</label><input className="fi" placeholder="Ex: Restauration, IT..." value={form.domain} onChange={e => upd('domain', e.target.value)} /></div>
              <div className="fg"><label className="fl">Contact</label><input className="fi" placeholder="Décideur" value={form.contact} onChange={e => upd('contact', e.target.value)} /></div>
            </div>
            <div className="g2">
              <div className="fg"><label className="fl">Site web</label><input className="fi" placeholder="https://..." value={form.website} onChange={e => upd('website', e.target.value)} /></div>
              <div className="fg"><label className="fl">Ville</label><input className="fi" placeholder="Paris, Lyon..." value={form.city} onChange={e => upd('city', e.target.value)} /></div>
            </div>
            <div className="fg"><label className="fl">Statut</label>
              <select className="fi" value={form.status} onChange={e => upd('status', e.target.value)}>
                {Object.entries(PS).map(([v, s]) => <option key={v} value={v}>{s.l}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Notes</label><textarea className="fi" rows={3} placeholder="Infos utiles pour l'appel..." value={form.notes} onChange={e => upd('notes', e.target.value)} /></div>
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
