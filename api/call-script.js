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
  const { name, city, type, contact, website, description, notes } = req.body || {}
  const prompt = `Génère un script de cold call en français suisse pour prospecter l'entreprise suivante :
- Nom : ${name || 'l\'entreprise'}
- Ville : ${city || 'Suisse'}
- Secteur : ${type || 'non précisé'}
- Contact : ${contact || 'non précisé'}
- Site web : ${website || 'non'}
- Description : ${description || ''}
- Notes : ${notes || ''}

Structure obligatoire en 3 parties clairement séparées :

🎯 ACCROCHE (2 phrases max)
Débute par une phrase d'accroche personnalisée qui capte l'attention.

💼 PITCH (3 phrases max)
Présente notre offre de manière concise et orientée bénéfices.

❓ QUESTIONS DE QUALIFICATION (3 questions)
Des questions ouvertes pour qualifier le prospect.

Ton : professionnel mais chaleureux, naturel, adapté au marché suisse romand. Pas de formules creuses.`

  try {
    const r = await openai(key, {
      model: 'gpt-4o-mini',
      max_tokens: 600,
      messages: [
        { role: 'system', content: 'Tu es un expert en cold calling B2B en Suisse romande. Tu génères des scripts efficaces et naturels.' },
        { role: 'user', content: prompt }
      ]
    })
    if (r.error) return res.status(200).json({ error: r.error.message })
    const text = r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content || ''
    return res.status(200).json({ script: text })
  } catch (e) {
    return res.status(200).json({ error: e.message })
  }
}
