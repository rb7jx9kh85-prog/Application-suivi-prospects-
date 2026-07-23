const https = require('https')
const crypto = require('crypto')

const secret = () => process.env.APP_SECRET || 'alpinia-default-secret-change-me'

function validToken(token) {
  try {
    const decoded = Buffer.from(token || '', 'base64').toString('utf8')
    const lastPipe = decoded.lastIndexOf('|')
    if (lastPipe === -1) return false
    const sig = decoded.slice(lastPipe + 1)
    const payload = decoded.slice(0, lastPipe)
    const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
    if (sig !== expected) return false
    const exp = parseInt(payload.split('|').pop(), 10)
    return !isNaN(exp) && exp >= Date.now()
  } catch (e) { return false }
}

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
  if (!validToken((req.body || {}).token)) return res.status(401).json({ error: 'Session expirée. Connectez-vous à nouveau.' })

  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_API
  if (!key) return res.status(200).json({ error: 'OPENAI_API_KEY non configurée dans les variables Vercel.' })

  try {
    const { system, messages, mode } = req.body || {}
    // The model stays server-controlled.  A client cannot quietly switch the
    // agent to an unexpectedly expensive model by sending an arbitrary value.
    const defaultModel = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    const agentModel = process.env.CRM_AGENT_MODEL || 'gpt-5.6-sol'
    const model = mode === 'crm_agent' ? agentModel : defaultModel
    const r = await openai(key, {
      model,
      max_completion_tokens: 1200,
      messages: [
        { role: 'system', content: system || 'Tu es un assistant utile.' },
        ...(Array.isArray(messages) ? messages : []),
      ],
    })
    if (r.error) return res.status(200).json({ error: r.error.message || 'Erreur OpenAI' })
    const text = r.choices?.[0]?.message?.content || ''
    return res.status(200).json({ content: [{ text }] })
  } catch (e) {
    return res.status(200).json({ error: e.message || 'Erreur serveur' })
  }
}
