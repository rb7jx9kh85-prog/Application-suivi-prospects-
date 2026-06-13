import { Phone, Calendar, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function DailySummary({ calls, appointments }) {
  const today = new Date().toISOString().split('T')[0]
  const todayCalls = calls.filter(c => c.date?.startsWith(today))
  const todayAppts = appointments.filter(a => a.date === today)
  const upcomingAppts = appointments.filter(a => a.date > today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3)

  const completed = todayCalls.filter(c => c.status === 'completed').length
  const noAnswer = todayCalls.filter(c => c.status === 'no_answer').length

  const todayLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ background: 'linear-gradient(135deg, #f0f9ff, #eff6ff)', borderRadius: '16px', padding: '20px', border: '1px solid #bae6fd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>Résumé du jour</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>{todayLabel}</p>
        </div>
        <div style={{ width: '36px', height: '36px', background: '#e0f2fe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={18} color="#0284c7" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Phone size={14} color="#0ea5e9" />
            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Appels</span>
          </div>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{todayCalls.length}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '2px' }}><CheckCircle size={11} />{completed}</span>
            <span style={{ fontSize: '11px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '2px' }}><XCircle size={11} />{noAnswer}</span>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Calendar size={14} color="#3b82f6" />
            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>RDV</span>
          </div>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{todayAppts.length}</p>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>{upcomingAppts.length} à venir</p>
        </div>
      </div>

      {todayAppts.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RDV aujourd'hui</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {todayAppts.map(appt => (
              <div key={appt.id} style={{ background: 'white', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <Clock size={14} color="#38bdf8" />
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{appt.establishment}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{appt.time || 'Heure non définie'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingAppts.length > 0 && (
        <div>
          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prochains</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {upcomingAppts.map(appt => (
              <div key={appt.id} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={13} color="#60a5fa" />
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#374151' }}>{appt.establishment}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                    {new Date(appt.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} {appt.time ? '· ' + appt.time : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
