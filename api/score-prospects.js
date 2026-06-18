const https = require('https')

function openai(key, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload)
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (r) => {
      let out = ''
      r.on('data', (c) => { out += c })
      r.on('end', () => {
        try { resolve(JSON.parse(out)) } catch (e) { reject(new Error('Réponse OpenAI illisible')) }
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_API
  if (!key) return res.status(200).json({ error: 'OPENAI_API_KEY non configurée.' })
  const { prospects } = req.body || {}
  if (!prospects || !prospects.length) return res.status(200).json({ scores: [] })
  const list = prospects.slice(0, 20)
  const prompt = `Tu es un expert en prospection B2B suisse. Pour chaque prospect ci-dessous, attribue un score de priorité de 1 à 10 et une courte raison (max 15 mots).

Critères : statut d'avancement, présence web, dernière interaction, secteur porteur.

Prospects :
${list.map((p, i) => `${i+1}. ${p.name} | Secteur: ${p.type||'?'} | Statut: ${p.status||'?'} | Site: ${p.website||'non'} | Employés: ${p.employees||'?'} | Dernier contact: ${p.lastContact ? new Date(p.lastContact).toLocaleDateString('fr-CH') : 'jamais'} | Notes: ${(p.notes||'').slice(0,50)}`).join('\n')}

Réponds UNIQUEMENT en JSON valide, tableau : [{"id":"...","score":7,"reason":"..."},...]
Les ids doivent correspondre exactement aux ids fournis.`

  try {
    const ids = list.map(p => p.id)
    const r = await openai(key, {
      model: 'gpt-4o-mini',
      max_tokens: 800,
      messages: [
        { role: 'system', content: 'Tu es un assistant de prospection B2B. Réponds uniquement en JSON valide.' },
        { role: 'user', content: prompt }
      ]
    })
    if (r.error) return res.status(200).json({ error: r.error.message })
    const text = r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content || '[]'
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return res.status(200).json({ error: 'Réponse invalide', scores: [] })
    const parsed = JSON.parse(jsonMatch[0])
    const scores = parsed.map((item, i) => ({ id: item.id || ids[i], score: Math.min(10, Math.max(1, parseInt(item.score)||5)), reason: item.reason || '' }))
    return res.status(200).json({ scores })
  } catch (e) {
    return res.status(200).json({ error: e.message, scores: [] })
  }
}
