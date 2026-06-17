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

  const key = process.env.OPENAI_API_KEY
  if (!key) return res.status(200).json({ error: 'OPENAI_API_KEY non configurée dans les variables Vercel.' })

  try {
    const { system, messages, model } = req.body || {}
    const r = await openai(key, {
      model: model || 'gpt-4o-mini',
      max_tokens: 1200,
      messages: [
        { role: 'system', content: system || 'Tu es un assistant utile.' },
        ...(Array.isArray(messages) ? messages : []),
      ],
    })
    if (r.error) return res.status(200).json({ error: r.error.message || 'Erreur OpenAI' })
    const text = (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) ? r.choices[0].message.content : ''
    return res.status(200).json({ content: [{ text }] })
  } catch (e) {
    return res.status(200).json({ error: e.message || 'Erreur serveur' })
  }
}
