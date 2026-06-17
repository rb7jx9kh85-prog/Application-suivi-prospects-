export async function askAI(system, userMsg) {
  const r = await fetch('/.netlify/functions/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages: [{ role: 'user', content: userMsg }] }),
  })
  if (!r.ok) throw new Error('Erreur API (' + r.status + ')')
  const d = await r.json()
  if (d.error) throw new Error(d.error)
  return d.content?.[0]?.text || ''
}
