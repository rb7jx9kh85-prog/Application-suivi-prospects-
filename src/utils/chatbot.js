export function parseAppointmentFromText(text) {
  const lower = text.toLowerCase()
  let date = null
  let time = null
  let establishment = ''

  // Date parsing
  const today = new Date()
  if (/aujourd'?hui/i.test(lower)) {
    date = today.toISOString().split('T')[0]
  } else if (/demain/i.test(lower)) {
    const t = new Date(today)
    t.setDate(t.getDate() + 1)
    date = t.toISOString().split('T')[0]
  } else {
    const months = { janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5, juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11 }
    const verboseDate = text.match(/(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)(?:\s+(\d{4}))?/i)
    const numDate = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/)
    if (verboseDate) {
      const month = months[verboseDate[2].toLowerCase()]
      const year = verboseDate[3] ? parseInt(verboseDate[3]) : today.getFullYear()
      date = new Date(year, month, parseInt(verboseDate[1])).toISOString().split('T')[0]
    } else if (numDate) {
      const y = numDate[3] ? (numDate[3].length === 2 ? '20' + numDate[3] : numDate[3]) : today.getFullYear()
      date = `${y}-${String(numDate[2]).padStart(2, '0')}-${String(numDate[1]).padStart(2, '0')}`
    }
  }

  // Time parsing
  const timeMatch = text.match(/(\d{1,2})[h:](\d{2})?(?:\s*(?:heures?)?)/i)
  if (timeMatch) {
    time = `${String(timeMatch[1]).padStart(2, '0')}:${timeMatch[2] || '00'}`
  }

  // Establishment parsing
  const patterns = [
    /(?:avec|chez)\s+([A-ZÀ-Ü][^\s,\.]+(?:\s+[A-Za-zÀ-ÿ]+)*)/,
    /(?:rdv|rendez.vous)\s+(?:avec\s+)?([A-ZÀ-Ü][^\s,\.]+(?:\s+[A-Za-zÀ-ÿ]+)*)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) { establishment = m[1].trim(); break }
  }

  return { date, time, establishment }
}

export function generateBotResponse(userMessage, appointments, calls) {
  const lower = userMessage.toLowerCase()

  if (/^(bonjour|salut|hello|coucou|bonsoir|hi)/i.test(lower)) {
    return {
      type: 'greeting',
      message: `Bonjour ! Je suis votre assistant ProspectPro 👋\n\nJe peux vous aider à :\n• Créer un rendez-vous\n• Voir votre résumé du jour\n• Lister vos RDV à venir\n• Consulter vos statistiques\n\nQue puis-je faire pour vous ?`
    }
  }

  if (/résumé|bilan|journée|aujourd'?hui/i.test(lower) && !/rdv|rendez.vous/i.test(lower)) {
    const today = new Date().toISOString().split('T')[0]
    const todayAppts = appointments.filter(a => a.date === today)
    const todayCalls = calls.filter(c => c.date?.startsWith(today))
    const completed = todayCalls.filter(c => c.status === 'completed').length
    return {
      type: 'summary',
      message: `📊 **Résumé du ${new Date().toLocaleDateString('fr-FR')}**\n\n📞 Appels : ${todayCalls.length} (${completed} complétés)\n📅 Rendez-vous : ${todayAppts.length}\n\n${todayAppts.length > 0 ? '**RDV du jour :**\n' + todayAppts.map(a => `• ${a.time || '—'} — ${a.establishment}`).join('\n') : 'Aucun rendez-vous aujourd\'hui.'}`
    }
  }

  if (/stat|combien|total|performance/i.test(lower)) {
    const upcoming = appointments.filter(a => new Date(a.date) >= new Date()).length
    return {
      type: 'stats',
      message: `📈 **Statistiques globales**\n\n📞 Total appels : ${calls.length}\n✅ Appels complétés : ${calls.filter(c => c.status === 'completed').length}\n📅 Total rendez-vous : ${appointments.length}\n🔜 RDV à venir : ${upcoming}`
    }
  }

  if (/liste|voir|afficher|mes rdv|mes rendez/i.test(lower)) {
    const upcoming = appointments
      .filter(a => new Date(a.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
    if (!upcoming.length) return { type: 'info', message: "Vous n'avez aucun rendez-vous à venir." }
    return {
      type: 'list',
      message: `📅 **Vos prochains rendez-vous :**\n\n${upcoming.map(a => `• ${new Date(a.date).toLocaleDateString('fr-FR')} ${a.time ? 'à ' + a.time : ''} — **${a.establishment}**`).join('\n')}`
    }
  }

  if (/rdv|rendez.vous|prendre|créer|ajouter|fixer|planifier|réunion/i.test(lower)) {
    const parsed = parseAppointmentFromText(userMessage)
    if (parsed.date || parsed.establishment || parsed.time) {
      return {
        type: 'create_appointment',
        message: `Parfait ! Voici le rendez-vous détecté :\n\n📍 Établissement : **${parsed.establishment || 'À préciser'}**\n📅 Date : **${parsed.date ? new Date(parsed.date + 'T12:00:00').toLocaleDateString('fr-FR') : 'À préciser'}**\n🕐 Heure : **${parsed.time || 'À préciser'}**\n\nConfirmez-vous la création de ce rendez-vous ? (email + Google Calendar)`,
        appointmentData: parsed
      }
    }
    return {
      type: 'info',
      message: `Pour créer un rendez-vous, dites-moi par exemple :\n\n*"RDV avec Hôtel du Lac le 20 juin à 14h"*\n*"Rendez-vous chez McDonald's demain à 10h"*`
    }
  }

  if (/aide|help|\?$/i.test(lower)) {
    return {
      type: 'help',
      message: `**Comment puis-je vous aider ?**\n\n• *"Bonjour"* → accueil\n• *"RDV avec [nom] le [date] à [heure]"* → créer un RDV\n• *"Résumé du jour"* → bilan quotidien\n• *"Mes statistiques"* → vue d'ensemble\n• *"Liste mes rendez-vous"* → RDV à venir`
    }
  }

  return {
    type: 'default',
    message: `Je n'ai pas compris. Essayez :\n• *"RDV avec [établissement] le [date]"*\n• *"Résumé du jour"*\n• *"Mes statistiques"*\n\nOu tapez *"aide"* pour voir toutes les commandes.`
  }
}
