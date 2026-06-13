// Backend IA — OpenAI uniquement.
// Sur Netlify : Site configuration → Environment variables →
//   OPENAI_API_KEY = sk-...
// Utilise le module natif "https" (aucune dépendance, compatible toutes versions Node).

const https = require('https')

function callOpenAI(apiKey, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error('Réponse OpenAI illisible')) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { statusCode: 200, headers, body: JSON.stringify({ error: 'OPENAI_API_KEY non configurée dans les variables d\'environnement Netlify.' }) }
  }

  try {
    const { system, messages } = JSON.parse(event.body || '{}')

    const data = await callOpenAI(apiKey, {
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: system || 'Tu es un assistant utile.' },
        ...(Array.isArray(messages) ? messages : []),
      ],
    })

    if (data.error) {
      return { statusCode: 200, headers, body: JSON.stringify({ error: data.error.message || 'Erreur OpenAI' }) }
    }

    const text = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : ''

    return { statusCode: 200, headers, body: JSON.stringify({ content: [{ text }] }) }
  } catch (err) {
    return { statusCode: 200, headers, body: JSON.stringify({ error: err.message || 'Erreur serveur' }) }
  }
}
