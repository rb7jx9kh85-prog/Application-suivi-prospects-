const WEB3FORMS_KEY = 'e0abe0da-54f1-4126-8e4e-d3abd21eba1a'
const TO_EMAIL = 'NoéVouillamoz3@gmail.com'

export async function sendAppointmentEmail(appointment) {
  const { establishment, date, time, title, description = '', location = '' } = appointment

  const startDate = new Date(`${date}T${time || '09:00'}`)
  const endDate = new Date(startDate.getTime() + 3600000)
  const pad = n => String(n).padStart(2, '0')
  const fmt = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title || `RDV - ${establishment}`)}&dates=${fmt(startDate)}/${fmt(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`

  const formattedDate = startDate.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const body = {
    access_key: WEB3FORMS_KEY,
    subject: `📅 Nouveau rendez-vous — ${establishment} · ${formattedDate}`,
    message: `Bonjour,\n\nVous avez un nouveau rendez-vous planifié :\n\n• Établissement : ${establishment}\n• Date : ${formattedDate}\n• Heure : ${time || 'Non précisée'}\n• Lieu : ${location || 'Non précisé'}\n• Notes : ${description || 'Aucune'}\n\n──────────────────────\n👉 Ajouter à Google Calendar :\n${calendarUrl}\n──────────────────────\n\nCordialement,\nApplication ProspectPro`,
    from_name: 'ProspectPro',
    replyto: TO_EMAIL,
  }

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.ok
}
