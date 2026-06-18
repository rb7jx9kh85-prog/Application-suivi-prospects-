const https = require('https')
const crypto = require('crypto')

const secret = () => process.env.APP_SECRET || 'alpinia-default-secret-change-me'

function emailFromToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const lastPipe = decoded.lastIndexOf('|')
    if (lastPipe === -1) return null
    const sig = decoded.slice(lastPipe + 1)
    const payload = decoded.slice(0, lastPipe)
    const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
    if (sig !== expected) return null
    const parts = payload.split('|')
    return (parts[0] || '').toLowerCase().trim()
  } catch (e) { return null }
}

function kvSet(key, value) {
  return new Promise((resolve, reject) => {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) return reject(new Error('KV non configuré'))

    const data = JSON.stringify(value)
    const u = new URL(url)
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname.replace(/\/$/, '') + '/set/' + encodeURIComponent(key),
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        try {
          const json = JSON.parse(out)
          if (json && json.error) return reject(new Error(json.error))
          resolve(json)
        } catch (e) { reject(e) }
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

  const { token, prospects, todos } = req.body || {}
  if (!token) return res.status(400).json({ error: 'token requis' })

  const email = emailFromToken(token)
  if (!email) return res.status(401).json({ error: 'Token invalide' })

  try {
    const ops = []
    if (Array.isArray(prospects)) ops.push(kvSet('prospects:' + email, prospects))
    if (Array.isArray(todos))     ops.push(kvSet('todos:'     + email, todos))
    if (ops.length) await Promise.all(ops)
    return res.status(200).json({ ok: true, saved: ops.length })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
