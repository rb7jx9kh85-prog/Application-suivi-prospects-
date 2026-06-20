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
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout OpenAI')) })
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

  const { prospectName, city, type } = req.body || {}
  if (!prospectName) return res.status(400).json({ error: 'prospectName requis.' })

  const loc = [type, city ? 'à ' + city : ''].filter(Boolean).join(' ')
  const prompt = 'Recherche sur le web si l\'établissement "' + prospectName + '"'
    + (loc ? ' (' + loc + ')' : '')
    + ' en Suisse possède un site web.\n'
    + 'Cherche sur Google, Pages Jaunes, LinkedIn, Google Maps, et toute autre source publique.\n'
    + 'Réponds UNIQUEMENT par un objet JSON valide :\n'
    + '{"has_website": true/false, "website_url": "URL si trouvée ou null", "confidence": "high/medium/low", '
    + '"sources_checked": ["liste des sources vérifiées"], "verdict": "phrase courte expliquant le résultat"}\n'
    + 'has_website doit être true si un site est trouvé, false si confirmé absent après recherche active. '
    + 'Ne mets jamais null pour has_website — tranche toujours.'

  try {
    const r = await openai(key, {
      model: 'gpt-4o-mini-search-preview',
      web_search_options: { user_location: { type: 'approximate', approximate: { country: 'CH' } } },
      messages: [{ role: 'user', content: prompt }],
    })

    if (r.error) return res.status(200).json({ error: r.error.message || 'Erreur OpenAI' })

    const text = (r.choices?.[0]?.message?.content) || ''
    const m = text.match(/\{[\s\S]*\}/)
    if (!m) return res.status(200).json({ error: 'Réponse IA non parseable.', raw: text.slice(0, 400) })

    return res.status(200).json({ result: JSON.parse(m[0]) })
  } catch (e) {
    return res.status(200).json({ error: e.message || 'Erreur serveur' })
  }
}
