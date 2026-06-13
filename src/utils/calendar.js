export function generateGoogleCalendarUrl(appointment) {
  const { title, establishment, date, time, duration = 60, description = '', location = '' } = appointment

  const startDate = new Date(`${date}T${time || '09:00'}`)
  const endDate = new Date(startDate.getTime() + duration * 60000)

  const pad = n => String(n).padStart(2, '0')
  const fmt = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || `RDV - ${establishment}`,
    dates: `${fmt(startDate)}/${fmt(endDate)}`,
    details: description || `Rendez-vous avec ${establishment}`,
    location: location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
