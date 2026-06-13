import { useState } from 'react'
import { Plus, Trash2, Edit3, Phone, Building2, Video, Clock, XCircle, Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import Chatbot from '../components/Chatbot'
import PlacePreview from '../components/PlacePreview'
import { useColdCall } from '../hooks/useColdCall'

const STATUS = {
  to_call: { label: 'À appeler', bg: '#e0f2fe', color: '#0284c7', icon: Phone },
  called: { label: 'Appelé', bg: '#dbeafe', color: '#2563eb', icon: Phone },
  voicemail: { label: 'Répondeur', bg: '#fef3c7', color: '#d97706', icon: Clock },
  refusal: { label: 'Refus', bg: '#fee2e2', color: '#dc2626', icon: XCircle },
  video_rdv: { label: 'RDV visio ✅', bg: '#dcfce7', color: '#16a34a', icon: Video },
}

export default function ColdCallPage() {
  const { prospects, addProspect, updateProspect, deleteProspect } = useColdCall()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [previewProspect, setPreviewProspect] = useState(null)
  const [form, setForm] = useState({ establishment: '', domain: '', contact: '', notes: '', status: 'to_call' })

  const filtered = prospects.filter(p =>
    !search || p.establishment?.toLowerCase().includes(search.toLowerCase()) || p.domain?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = () => {
    if (!form.establishment.trim()) return
    if (editing) {
      updateProspect(editing.id, form)
      setEditing(null)
    } else {
      addProspect(form)
    }
    setForm({ establishment: '', domain: '', contact: '', notes: '', status: 'to_call' })
    setShowForm(false)
  }

  const toCall = filtered.filter(p => p.status === 'to_call')
  const called = filtered.filter(p => p.status !== 'to_call')

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#111827' }}>Session Cold Call</h1>
            <p style={{ margin: '3px 0 0', fontSize: '14px', color: '#9ca3af' }}>{toCall.length} à appeler • {called.length} complétés</p>
          </div>
          <button onClick={() => { setEditing(null); setForm({ establishment: '', domain: '', contact: '', notes: '', status: 'to_call' }); setShowForm(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'white', boxShadow: '0 3px 10px rgba(14,165,233,0.3)' }}>
            <Plus size={15} /> Ajouter un prospect
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Établissement *</label>
                <input style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  value={form.establishment} onChange={e => setForm({ ...form, establishment: e.target.value })} placeholder="ex: Hôtel Ibis" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Domaine</label>
                <input style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} placeholder="ex: Hôtellerie" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Contact</label>
                <input style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Nom du contact" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Statut</label>
                <select style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer', boxSizing: 'border-box' }}
                  value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase' }}>Notes</label>
              <textarea style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box' }}
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes, objectifs, points clés..." />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} style={{ flex: 1, padding: '9px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                {editing ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button onClick={() => { setShowForm(false); setEditing(null) }} style={{ flex: 1, padding: '9px', background: '#e5e7eb', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {toCall.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>À appeler ({toCall.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {toCall.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '2px solid #e0f2fe', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>{p.establishment}</h3>
                      {p.domain && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>{p.domain}</p>}
                    </div>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '10px', fontWeight: 600, whiteSpace: 'nowrap' }}>À appeler</span>
                  </div>
                  {p.contact && <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280' }}><strong>Contact :</strong> {p.contact}</p>}
                  {p.notes && <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>{p.notes}</p>}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select style={{ flex: 1, padding: '6px', fontSize: '11px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: 'white' }}
                      value={p.status} onChange={e => updateProspect(p.id, { status: e.target.value })}>
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button onClick={() => setPreviewProspect(p)} title="Aperçu Google Places" style={{ padding: '6px 10px', background: '#eff6ff', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#2563eb' }}>
                      <Search size={13} />
                    </button>
                    <button onClick={() => { setEditing(p); setForm(p); setShowForm(true) }} style={{ padding: '6px 10px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#9ca3af' }}>
                      <Edit3 size={13} />
                    </button>
                    <button onClick={() => deleteProspect(p.id)} style={{ padding: '6px 10px', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#dc2626' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {called.length > 0 && (
          <div>
            <h2 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Complétés ({called.length})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {called.map(p => {
                const cfg = STATUS[p.status]
                return (
                  <div key={p.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: `2px solid ${cfg.bg}`, opacity: 0.8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>{p.establishment}</h3>
                        {p.domain && <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>{p.domain}</p>}
                      </div>
                      <span style={{ fontSize: '11px', background: cfg.bg, color: cfg.color, padding: '3px 8px', borderRadius: '10px', fontWeight: 600 }}>{cfg.label}</span>
                    </div>
                    {p.notes && <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#9ca3af' }}>{p.notes}</p>}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => deleteProspect(p.id)} style={{ flex: 1, padding: '6px', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#dc2626', fontSize: '12px', fontWeight: 500 }}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Building2 size={48} color="#e5e7eb" style={{ display: 'block', margin: '0 auto 12px' }} />
            <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#9ca3af' }}>Aucun prospect</p>
            <p style={{ margin: 0, color: '#d1d5db', fontSize: '13px' }}>Ajoutez votre premier prospect pour commencer</p>
          </div>
        )}
      </main>
      {previewProspect && (
        <PlacePreview
          establishment={previewProspect.establishment}
          domain={previewProspect.domain}
          onClose={() => setPreviewProspect(null)}
        />
      )}
      <Chatbot />
    </div>
  )
}
