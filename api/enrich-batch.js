const https = require('https')

const MAX_PER_CALL = 25
const BATCH_SIZE = 10 // prospects par appel API → réduit le nb d'appels

function openaiCall(key, messages) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages,
    })
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        try { resolve(JSON.parse(out)) }
        catch (e) { reject(new Error('Réponse OpenAI illisible')) }
      })
    })
    req.on('error', reject)
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.write(payload)
    req.end()
  })
}

async function enrichBatch(key, batch) {
  const system = 'Assistant B2B Suisse romande. Pour chaque établissement fourni, retourne un objet JSON avec la clé "results" contenant un tableau ordonné. Chaque élément du tableau contient : phone (standard), phone_source, email, address, decision_maker (Prénom Nom — fonction), decision_maker_phone, decision_maker_phone_source, linkedin, description (1 phrase). null si inconnu. Ne jamais inventer.'

  const userMsg = 'Enrichis ces ' + batch.length + ' établissements dans l\'ordre, retourne {"results":[...]}:\n'
    + batch.map((p, i) => (i + 1) + '. ' + (p.name || p.establishment || '?') + ' | ' + (p.city || '?') + ' | ' + (p.type || p.domain || '?') + (p.web || p.website ? ' | ' + (p.web || p.website) : '')).join('\n')

  const r = await openaiCall(key, [
    { role: 'system', content: system },
    { role: 'user', content: userMsg },
  ])

  if (r.error) throw new Error(r.error.message || 'Erreur OpenAI')
  const text = r.choices?.[0]?.message?.content || ''
  const parsed = JSON.parse(text)
  const arr = parsed.results || []
  return batch.map((p, i) => ({ id: p.id, enriched: arr[i] || null, error: arr[i] ? null : 'Non trouvé' }))
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
  if (!Array.isArray(prospects) || !prospects.length)
    return res.status(400).json({ error: 'prospects[] requis.' })
  if (prospects.length > MAX_PER_CALL)
    return res.status(400).json({ error: 'Max ' + MAX_PER_CALL + ' prospects par requête.' })

  try {
    // Découper en lots de BATCH_SIZE et traiter en séquence pour éviter les rate limits
    const results = []
    for (let i = 0; i < prospects.length; i += BATCH_SIZE) {
      const batch = prospects.slice(i, i + BATCH_SIZE)
      const batchResults = await enrichBatch(key, batch)
      results.push(...batchResults)
    }
    return res.status(200).json({ results })
  } catch (e) {
    return res.status(200).json({ error: e.message || 'Erreur serveur' })
  }
}
