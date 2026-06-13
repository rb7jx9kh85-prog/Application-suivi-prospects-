import { useState } from 'react'
import { X, Calendar, ExternalLink, Mail, Loader } from 'lucide-react'
import { generateGoogleCalendarUrl } from '../utils/calendar'
import { sendAppointmentEmail } from '../utils/email'

const inputStyle = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 14px',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box'
}
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }

export default function AppointmentModal({ appointment, onSave, onClose }) {
  const [form, setForm] = useState({
    establishment: appointment?.establishment || '',
    contact: appointment?.contact || '',
    date: appointment?.date || '',
    time: appointment?.time || '',
    duration: appointment?.duration || 60,
    location: appointment?.location || '',
    description: appointment?.description || '',
    status: appointment?.status || 'scheduled',
  })
  const [sending, setSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    onSave(form)
    try {
      const sent = await sendAppointmentEmail({ ...form, title: `RDV - ${form.establishment}` })
      setEmailSent(sent)
      if (sent) setTimeout(onClose, 1500)
      else onClose()
    } catch {
      onClose()
    }
    setSending(false)
  }

  const calendarUrl = form.date && form.establishment
    ? generateGoogleCalendarUrl({ ...form, title: `RDV - ${form.establishment}` })
    : null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6', borderRadius: '20px 20px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#dbeafe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} color="#2563eb" />
            </div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>{appointment ? 'Modifier le RDV' : 'Nouveau rendez-vous'}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Établissement *</label>
            <input required style={inputStyle} value={form.establishment} onChange={e => set('establishment', e.target.value)} placeholder="Nom de l'établissement" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
          <div>
            <label style={labelStyle}>Contact</label>
            <input style={inputStyle} value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Nom du responsable" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Date *</label>
              <input required type="date" style={inputStyle} value={form.date} onChange={e => set('date', e.target.value)} onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={labelStyle}>Heure</label>
              <input type="time" style={inputStyle} value={form.time} onChange={e => set('time', e.target.value)} onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={labelStyle}>Durée (min)</label>
              <input type="number" min={15} step={15} style={inputStyle} value={form.duration} onChange={e => set('duration', parseInt(e.target.value))} onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <div>
              <label style={labelStyle}>Statut</label>
              <select style={{ ...inputStyle, background: 'white' }} value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="scheduled">Planifié</option>
                <option value="confirmed">Confirmé</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Lieu</label>
            <input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Adresse ou lieu" onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Détails du rendez-vous..." onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          {emailSent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 500 }}>
              <Mail size={16} /> Email envoyé à NoéVouillamoz3@gmail.com
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>Annuler</button>
            <button type="submit" disabled={sending} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: sending ? 0.7 : 1 }}>
              {sending ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Envoi...</> : (appointment ? 'Modifier' : 'Créer & Notifier')}
            </button>
          </div>

          {calendarUrl && (
            <a href={calendarUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 500, color: '#2563eb', textDecoration: 'none' }}>
              <ExternalLink size={15} /> Prévisualiser dans Google Calendar
            </a>
          )}
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
