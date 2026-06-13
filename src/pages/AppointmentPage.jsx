import { useState } from 'react'
import { Plus, Search, Calendar, ExternalLink, Trash2, Edit3, Clock, MapPin, User, CheckCircle, Cloud } from 'lucide-react'
import ProNavBar from '../components/ProNavBar'
import AppointmentModal from '../components/AppointmentModal'
import GoogleDriveImport from '../components/GoogleDriveImport'
import EnhancedChatbot from '../components/EnhancedChatbot'
import { useData } from '../hooks/useData'
import { generateGoogleCalendarUrl } from '../utils/calendar'

const STATUS_CFG = {
  scheduled: { label: 'Planifié', bg: '#dbeafe', color: '#2563eb', bar: '#3b82f6' },
  confirmed: { label: 'Confirmé', bg: '#dcfce7', color: '#16a34a', bar: '#22c55e' },
  completed: { label: 'Terminé', bg: '#f3f4f6', color: '#6b7280', bar: '#9ca3af' },
  cancelled: { label: 'Annulé', bg: '#fee2e2', color: '#dc2626', bar: '#f87171' },
}

function ApptCard({ appt, onEdit, onDelete }) {
  const cfg = STATUS_CFG[appt.status] || STATUS_CFG.scheduled
  const calUrl = generateGoogleCalendarUrl({ ...appt, title: `RDV - ${appt.establishment}` })
  const isPast = new Date(appt.date + 'T23:59:59') < new Date()

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', opacity: isPast ? 0.75 : 1, transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}>
      <div style={{ height: '4px', background: cfg.bar }} />
      <div style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.establishment}</h3>
            {appt.contact && <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={11} />{appt.contact}</p>}
          </div>
          <span style={{ flexShrink: 0, marginLeft: '8px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' }}>
            <Calendar size={13} color="#0ea5e9" />
            <span>{new Date(appt.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          {appt.time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' }}>
              <Clock size={13} color="#3b82f6" />
              <span>{appt.time}{appt.duration ? ` · ${appt.duration} min` : ''}</span>
            </div>
          )}
          {appt.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' }}>
              <MapPin size={13} color="#f43f5e" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.location}</span>
            </div>
          )}
        </div>

        {appt.description && <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#9ca3af', overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{appt.description}</p>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '12px', borderTop: '1px solid #f9fafb' }}>
          <a href={calUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2563eb', background: '#eff6ff', padding: '5px 10px', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 }}>
            <ExternalLink size={12} /> Google Cal
          </a>
          <div style={{ flex: 1 }} />
          <button onClick={() => onEdit(appt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '5px', borderRadius: '7px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9ca3af' }}>
            <Edit3 size={14} />
          </button>
          <button onClick={() => onDelete(appt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '5px', borderRadius: '7px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9ca3af' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AppointmentPage() {
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useData()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showDrive, setShowDrive] = useState(false)

  const filtered = appointments.filter(a =>
    !search || a.establishment?.toLowerCase().includes(search.toLowerCase()) || a.contact?.toLowerCase().includes(search.toLowerCase())
  )

  const upcoming = filtered.filter(a => new Date(a.date + 'T23:59:59') >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date))
  const past = filtered.filter(a => new Date(a.date + 'T23:59:59') < new Date()).sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleSave = (form) => {
    if (editing) updateAppointment(editing.id, form)
    else addAppointment(form)
    setShowModal(false)
    setEditing(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #09001a 0%, #0d0020 50%, #080010 100%)' }}>
      <ProNavBar />
      <EnhancedChatbot />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', paddingTop: '96px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Rendez-vous</h1>
            <p style={{ margin: '3px 0 0', fontSize: '14px', color: '#9ca3af' }}>{appointments.length} rendez-vous au total</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowDrive(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '12px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
              <Cloud size={15} color="#2563eb" /> Drive
            </button>
            <button onClick={() => { setEditing(null); setShowModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'white', boxShadow: '0 3px 10px rgba(59,130,246,0.3)' }}>
              <Plus size={15} /> Nouveau RDV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Total', value: appointments.length, color: '#6b7280', bg: '#f3f4f6' },
            { label: 'À venir', value: upcoming.length, color: '#0284c7', bg: '#e0f2fe' },
            { label: 'Confirmés', value: appointments.filter(a => a.status === 'confirmed').length, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Terminés', value: appointments.filter(a => a.status === 'completed').length, color: '#7c3aed', bg: '#ede9fe' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: 'white', borderRadius: '14px', padding: '16px', textAlign: 'center', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 800, color }}>{value}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un rendez-vous..."
            style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '11px', paddingBottom: '11px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', fontSize: '14px', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {upcoming.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#0ea5e9" /> À venir ({upcoming.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '16px' }}>
              {upcoming.map(a => <ApptCard key={a.id} appt={a} onEdit={a => { setEditing(a); setShowModal(true) }} onDelete={deleteAppointment} />)}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="#9ca3af" /> Passés ({past.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '16px' }}>
              {past.map(a => <ApptCard key={a.id} appt={a} onEdit={a => { setEditing(a); setShowModal(true) }} onDelete={deleteAppointment} />)}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <Calendar size={56} color="#e5e7eb" style={{ display: 'block', margin: '0 auto 14px' }} />
            <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#9ca3af', fontSize: '18px' }}>Aucun rendez-vous</p>
            <p style={{ margin: '0 0 24px', color: '#d1d5db', fontSize: '14px' }}>Créez votre premier rendez-vous pour commencer</p>
            <button onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 22px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
              <Plus size={16} /> Créer un rendez-vous
            </button>
          </div>
        )}
      </main>

      {showModal && <AppointmentModal appointment={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null) }} />}
      {showDrive && <GoogleDriveImport onImport={() => setShowDrive(false)} onClose={() => setShowDrive(false)} />}

    </div>
  )
}
