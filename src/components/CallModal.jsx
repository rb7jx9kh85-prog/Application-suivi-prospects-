import { useState } from 'react'
import { X, Phone } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Complété', bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
  { value: 'pending', label: 'En attente', bg: '#fef9c3', color: '#ca8a04', border: '#fde047' },
  { value: 'no_answer', label: 'Injoignable', bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
  { value: 'callback', label: 'Rappel prévu', bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
]

const inputStyle = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 14px',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box'
}

const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }

export default function CallModal({ call, onSave, onClose }) {
  const [form, setForm] = useState({
    establishment: call?.establishment || '',
    contact: call?.contact || '',
    phone: call?.phone || '',
    date: call?.date || new Date().toISOString().split('T')[0],
    time: call?.time || '',
    status: call?.status || 'pending',
    notes: call?.notes || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#e0f2fe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={16} color="#0284c7" />
            </div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>{call ? "Modifier l'appel" : 'Nouvel appel'}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}><X size={20} /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave(form) }} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Établissement *</label>
            <input required style={inputStyle} value={form.establishment} onChange={e => set('establishment', e.target.value)} placeholder="Nom de l'établissement" onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Contact</label>
              <input style={inputStyle} value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Nom du contact" onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+41 xx xxx xx xx" onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={labelStyle}>Date *</label>
              <input required type="date" style={inputStyle} value={form.date} onChange={e => set('date', e.target.value)} onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={labelStyle}>Heure</label>
              <input type="time" style={inputStyle} value={form.time} onChange={e => set('time', e.target.value)} onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Statut</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => set('status', opt.value)} style={{
                  padding: '9px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  border: `2px solid ${form.status === opt.value ? opt.border : '#e5e7eb'}`,
                  background: form.status === opt.value ? opt.bg : 'white',
                  color: form.status === opt.value ? opt.color : '#6b7280',
                }}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notes sur l'appel..." onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>Annuler</button>
            <button type="submit" style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: 'white' }}>
              {call ? 'Modifier' : "Créer l'appel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
