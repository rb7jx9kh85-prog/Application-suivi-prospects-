const https = require('https')

const MAX_BATCH = 20
const DELAY_MS = 800
const TIMEOUT_MS = 25000

function openaiCall(key, messages) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      messages,
      response_format: { type: 'json_object' },
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
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout OpenAI')) })
    req.write(payload)
    req.end()
  })
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

function stripJSON(text) {
  const m = text.match(/\{[\s\S]*\}/)
  return m ? m[0] : null
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_API
  if (!key) return res.status(200).json({ error: 'OPENAI_API_KEY non configurée.' })

  const { prospects, fields } = req.body || {}
  if (!Array.isArray(prospects) || !prospects.length)
    return res.status(400).json({ error: 'prospects[] requis.' })
  if (prospects.length > MAX_BATCH)
    return res.status(400).json({ error: 'Maximum ' + MAX_BATCH + ' prospects par batch.' })

  const wantedFields = Array.isArray(fields) && fields.length
    ? fields
    : ['email', 'phone', 'website', 'address', 'industry', 'employees', 'decision_maker', 'description']

  const system = 'Tu es un assistant de prospection B2B en Suisse romande. '
    + 'Pour chaque établissement, retourne UNIQUEMENT un objet JSON avec les champs demandés. '
    + 'Si une info est inconnue, mets null. Ne génère JAMAIS de fausses données. '
    + 'Champs possibles : email, phone, website, address, industry, '
    + 'employees (nombre approximatif), decision_maker (prénom nom probable), description (1 phrase max).'

  const results = []
  const start = Date.now()

  for (let i = 0; i < prospects.length; i++) {
    if (Date.now() - start > TIMEOUT_MS) {
      for (let j = i; j < prospects.length; j++) {
        results.push({ id: prospects[j].id, enriched: null, error: 'Timeout global atteint' })
      }
      break
    }

    const p = prospects[i]
    const userMsg = 'Établissement: ' + (p.name || p.establishment || '?')
      + ', Ville: ' + (p.city || '?')
      + ', Secteur: ' + (p.type || p.domain || '?')
      + ', Site: ' + (p.web || p.website || 'inconnu')
      + '. Retourne JSON avec uniquement ces champs: ' + wantedFields.join(', ') + '.'

    try {
      const r = await openaiCall(key, [
        { role: 'system', content: system },
        { role: 'user', content: userMsg },
      ])
      if (r.error) { results.push({ id: p.id, enriched: null, error: r.error.message || 'Erreur OpenAI' }); continue }
      const text = r.choices?.[0]?.message?.content || ''
      const raw = stripJSON(text)
      if (!raw) { results.push({ id: p.id, enriched: null, error: 'Format JSON invalide' }); continue }
      results.push({ id: p.id, enriched: JSON.parse(raw), error: null })
    } catch (e) {
      results.push({ id: p.id, enriched: null, error: e.message || 'Erreur' })
    }

    if (i < prospects.length - 1) await delay(DELAY_MS)
  }

  return res.status(200).json({ results })
}
