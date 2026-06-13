import { useState } from 'react'
import { Plus, Phone, Search, Filter, Trash2, Edit3, CheckCircle, Clock, XCircle, PhoneOff, Calendar, Cloud } from 'lucide-react'
import ProNavBar from '../components/ProNavBar'
import DailySummary from '../components/DailySummary'
import CallModal from '../components/CallModal'
import GoogleDriveImport from '../components/GoogleDriveImport'
import EnhancedChatbot from '../components/EnhancedChatbot'
import { useData } from '../hooks/useData'

const STATUS = {
  completed: { label: 'Complété', icon: CheckCircle, bg: '#dcfce7', color: '#16a34a' },
  pending: { label: 'En attente', icon: Clock, bg: '#fef9c3', color: '#ca8a04' },
  no_answer: { label: 'Injoignable', icon: PhoneOff, bg: '#fee2e2', color: '#dc2626' },
  callback: { label: 'Rappel', icon: Phone, bg: '#dbeafe', color: '#2563eb' },
}

export default function Dashboard() {
  const { calls, appointments, addCall, updateCall, deleteCall } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCallModal, setShowCallModal] = useState(false)
  const [editingCall, setEditingCall] = useState(null)
  const [showDrive, setShowDrive] = useState(false)
  const [driveData, setDriveData] = useState(null)

  const filtered = calls.filter(c => {
    const q = search.toLowerCase()
    return (!search || c.establishment?.toLowerCase().includes(q) || c.contact?.toLowerCase().includes(q))
      && (statusFilter === 'all' || c.status === statusFilter)
  })

  const stats = [
    { label: 'Total appels', value: calls.length, icon: Phone, bg: '#e0f2fe', color: '#0284c7' },
    { label: 'Complétés', value: calls.filter(c => c.status === 'completed').length, icon: CheckCircle, bg: '#dcfce7', color: '#16a34a' },
    { label: 'En attente', value: calls.filter(c => c.status === 'pending').length, icon: Clock, bg: '#fef9c3', color: '#ca8a04' },
    { label: 'Injoignables', value: calls.filter(c => c.status === 'no_answer').length, icon: XCircle, bg: '#fee2e2', color: '#dc2626' },
  ]

  const handleSave = (form) => {
    if (editingCall) updateCall(editingCall.id, form)
    else addCall(form)
    setShowCallModal(false)
    setEditingCall(null)
  }

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <ProNavBar />
      <EnhancedChatbot />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#111827' }}>Tableau de bord</h1>
            <p style={{ margin: '3px 0 0', fontSize: '14px', color: '#9ca3af', textTransform: 'capitalize' }}>{today}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowDrive(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '12px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>
              <Cloud size={15} color="#2563eb" /> Drive
            </button>
            <button onClick={() => { setEditingCall(null); setShowCallModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'white', boxShadow: '0 3px 10px rgba(14,165,233,0.3)' }}>
              <Plus size={15} /> Nouvel appel
            </button>
          </div>
        </div>

        {/* Stats + Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr) 1.2fr', gap: '16px', marginBottom: '28px', alignItems: 'start' }}>
          {stats.map(({ label, value, icon: Icon, bg, color }) => (
            <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '18px', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ width: '40px', height: '40px', background: bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Icon size={20} color={color} />
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '26px', fontWeight: 800, color: '#111827' }}>{value}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{label}</p>
            </div>
          ))}
          <div style={{ gridRow: '1 / 3' }}>
            <DailySummary calls={calls} appointments={appointments} />
          </div>
        </div>

        {/* Drive import banner */}
        {driveData && (
          <div style={{ marginBottom: '20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#1d4ed8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}><Cloud size={14} /> Document Google Drive importé</p>
              <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', color: '#3b82f6' }}>{driveData.preview}...</p>
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#60a5fa' }}>{driveData.lines} lignes importées</p>
            </div>
            <button onClick={() => setDriveData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93c5fd', padding: '2px' }}><XCircle size={16} /></button>
          </div>
        )}

        {/* Call list */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un appel..."
                style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#0ea5e9'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} color="#9ca3af" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '9px 12px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer' }}>
                <option value="all">Tous les statuts</option>
                <option value="completed">Complétés</option>
                <option value="pending">En attente</option>
                <option value="no_answer">Injoignables</option>
                <option value="callback">Rappels</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Phone size={48} color="#e5e7eb" style={{ display: 'block', margin: '0 auto 12px' }} />
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#9ca3af' }}>Aucun appel trouvé</p>
              <p style={{ margin: '0 0 20px', color: '#d1d5db', fontSize: '13px' }}>Commencez par enregistrer votre premier appel</p>
              <button onClick={() => setShowCallModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                <Plus size={15} /> Créer un appel
              </button>
            </div>
          ) : (
            <div>
              {filtered.map(call => {
                const cfg = STATUS[call.status] || STATUS.pending
                const StatusIcon = cfg.icon
                return (
                  <div key={call.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 20px', borderBottom: '1px solid #fafafa', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <div style={{ width: '36px', height: '36px', background: '#f0f9ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={16} color="#0ea5e9" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{call.establishment}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                        {[call.contact, call.date && new Date(call.date + 'T12:00:00').toLocaleDateString('fr-FR'), call.time].filter(Boolean).join(' · ')}
                      </p>
                      {call.notes && <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{call.notes}</p>}
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '20px', background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                      <StatusIcon size={12} />{cfg.label}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button onClick={() => { setEditingCall(call); setShowCallModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '6px', borderRadius: '8px' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9ca3af' }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => deleteCall(call.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '6px', borderRadius: '8px' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9ca3af' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showCallModal && <CallModal call={editingCall} onSave={handleSave} onClose={() => { setShowCallModal(false); setEditingCall(null) }} />}
      {showDrive && <GoogleDriveImport onImport={data => { setDriveData(data); setShowDrive(false) }} onClose={() => setShowDrive(false)} />}
    </div>
  )
}
