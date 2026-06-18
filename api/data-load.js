const https = require('https')
const crypto = require('crypto')

const OWNER = 'rb7jx9kh85-prog'
const REPO = 'Application-suivi-prospects-'
const FILE = 'data/prospects.json'

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

function fetchRaw() {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${FILE}?t=${Date.now()}`
    https.get(url, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        if (r.statusCode === 404) return resolve({})
        try { resolve(JSON.parse(out)) } catch (e) { resolve({}) }
      })
    }).on('error', reject)
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
    const db = await fetchRaw()
    const key = crypto.createHash('sha256').update(email).digest('hex')
    const userData = db[key] || {}
    return res.status(200).json({
      prospects: userData.prospects || [],
      todos: userData.todos || [],
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
