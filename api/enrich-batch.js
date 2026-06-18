const https = require('https')

// Safety cap per HTTP call only — the client sends small chunks, so this is
// never user-facing. There is NO limit on the total number of prospects.
const MAX_PER_CALL = 25

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
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout OpenAI')) })
    req.write(payload)
    req.end()
  })
}

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
  if (prospects.length > MAX_PER_CALL)
    return res.status(400).json({ error: 'Trop de prospects par requête (max ' + MAX_PER_CALL + ' par lot).' })

  const wantedFields = Array.isArray(fields) && fields.length
    ? fields
    : ['email', 'phone', 'website', 'address', 'industry', 'employees', 'decision_maker', 'description']

  const system = 'Tu es un assistant de prospection B2B en Suisse romande. '
    + 'Pour chaque établissement, retourne UNIQUEMENT un objet JSON avec les champs demandés. '
    + 'Si une info est inconnue, mets null. Ne génère JAMAIS de fausses données. '
    + 'Champs possibles : email, phone, website, address, industry, '
    + 'employees (nombre approximatif), decision_maker (prénom nom probable), description (1 phrase max).'

  // Process the whole chunk in parallel — fast and well within the time limit.
  const tasks = prospects.map((p) => {
    const userMsg = 'Établissement: ' + (p.name || p.establishment || '?')
      + ', Ville: ' + (p.city || '?')
      + ', Secteur: ' + (p.type || p.domain || '?')
      + ', Site: ' + (p.web || p.website || 'inconnu')
      + '. Retourne JSON avec uniquement ces champs: ' + wantedFields.join(', ') + '.'

    return openaiCall(key, [
      { role: 'system', content: system },
      { role: 'user', content: userMsg },
    ]).then((r) => {
      if (r.error) return { id: p.id, enriched: null, error: r.error.message || 'Erreur OpenAI' }
      const text = r.choices?.[0]?.message?.content || ''
      const raw = stripJSON(text)
      if (!raw) return { id: p.id, enriched: null, error: 'Format JSON invalide' }
      try { return { id: p.id, enriched: JSON.parse(raw), error: null } }
      catch (e) { return { id: p.id, enriched: null, error: 'JSON illisible' } }
    }).catch((e) => ({ id: p.id, enriched: null, error: e.message || 'Erreur' }))
  })

  const results = await Promise.all(tasks)
  return res.status(200).json({ results })
}

