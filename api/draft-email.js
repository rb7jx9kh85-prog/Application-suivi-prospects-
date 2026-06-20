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
  const { name, city, type, contact, website, description } = req.body || {}
  const prompt = `Rédige un email de prospection B2B en français suisse pour l'entreprise suivante :
- Nom : ${name || 'l\'entreprise'}
- Ville : ${city || 'Suisse'}
- Secteur : ${type || 'non précisé'}
- Contact : ${contact || 'non précisé'}
- Site web : ${website || 'non'}
- Description : ${description || ''}

Consignes :
- Objet accrocheur et personnalisé (max 60 caractères)
- Corps : 3 paragraphes courts et percutants
- Signature : "L'équipe Alpinia"
- Ton professionnel mais direct, sans formules creuses
- Adapté au marché suisse romand

Réponds UNIQUEMENT en JSON valide : {"subject":"...","body":"..."}`

  try {
    const r = await openai(key, {
      model: 'gpt-4o-mini',
      max_tokens: 500,
      messages: [
        { role: 'system', content: 'Tu es un expert en copywriting B2B pour le marché suisse romand. Réponds uniquement en JSON valide.' },
        { role: 'user', content: prompt }
      ]
    })
    if (r.error) return res.status(200).json({ error: r.error.message })
    const text = r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return res.status(200).json({ error: 'Réponse invalide' })
    const parsed = JSON.parse(jsonMatch[0])
    return res.status(200).json({ subject: parsed.subject || '', body: parsed.body || '' })
  } catch (e) {
    return res.status(200).json({ error: e.message })
  }
}
