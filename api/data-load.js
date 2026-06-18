const https = require('https')
const crypto = require('crypto')

const secret = () => process.env.APP_SECRET || 'alpinia-default-secret-change-me'

// Extrait l'email du token (clé stable, identique sur tous les appareils).
// Le token contient email|exp|signature — l'exp change à chaque login, donc on
// NE PEUT PAS utiliser le token comme clé. On utilise l'email.
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

function keyOf(email, name) {
  return name + ':' + email
}

function kvGet(key) {
  return new Promise((resolve, reject) => {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) return reject(new Error('KV non configuré (KV_REST_API_URL / KV_REST_API_TOKEN manquants)'))

    const u = new URL(url)
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname.replace(/\/$/, '') + '/get/' + encodeURIComponent(key),
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
    }, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        try {
          const json = JSON.parse(out)
          if (json && json.error) return reject(new Error(json.error))
          const raw = json && json.result !== undefined ? json.result : null
          resolve(raw !== null && typeof raw === 'string' ? JSON.parse(raw) : raw)
        } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'token requis' })

  const email = emailFromToken(token)
  if (!email) return res.status(401).json({ error: 'Token invalide' })

  try {
    const [prospects, todos] = await Promise.all([
      kvGet(keyOf(email, 'prospects')),
      kvGet(keyOf(email, 'todos')),
    ])
    return res.status(200).json({ prospects: prospects || [], todos: todos || [] })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
