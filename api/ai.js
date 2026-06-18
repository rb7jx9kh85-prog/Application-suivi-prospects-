const https = require('https')

function gemini(key, system, messages) {
  return new Promise((resolve, reject) => {
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const payload = JSON.stringify({
      system_instruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: { maxOutputTokens: 1200 },
    })

    const model = 'gemini-2.0-flash'
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${key}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        try { resolve(JSON.parse(out)) } catch (e) { reject(new Error('Réponse Gemini illisible')) }
      })
    })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(200).json({ error: 'GEMINI_API_KEY non configurée dans les variables Vercel.' })

  try {
    const { system, messages } = req.body || {}
    const r = await gemini(key, system || 'Tu es un assistant utile.', Array.isArray(messages) ? messages : [])
    if (r.error) return res.status(200).json({ error: r.error.message || 'Erreur Gemini' })
    const text = r.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return res.status(200).json({ content: [{ text }] })
  } catch (e) {
    return res.status(200).json({ error: e.message || 'Erreur serveur' })
  }
}
