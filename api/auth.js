const crypto = require('crypto')

const secret = () => process.env.APP_SECRET || ''
const appEmail = () => (process.env.APP_EMAIL || process.env.APP_MAIL || '').toLowerCase().trim()
const appPassword = () => process.env.APP_PASSWORD || ''
const appName = () => process.env.APP_NAME || 'Alpinia Pro'
const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30

function makeToken(email) {
  const exp = Date.now() + THIRTY_DAYS
  const payload = email + '|' + exp
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
  return Buffer.from(payload + '|' + sig).toString('base64')
}

function verifyToken(token) {
  if (!secret()) return null
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const lastPipe = decoded.lastIndexOf('|')
    if (lastPipe === -1) return null
    const sig = decoded.slice(lastPipe + 1)
    const payload = decoded.slice(0, lastPipe)
    const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
    if (sig !== expected) return null
    const parts = payload.split('|')
    const exp = parseInt(parts[parts.length - 1], 10)
    if (isNaN(exp) || exp < Date.now()) return null
    return { email: parts[0] }
  } catch (e) { return null }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const body = req.body || {}
  const action = body.action || ''

  if (action === 'login') {
    const email = (body.email || '').trim().toLowerCase()
    const pw = String(body.password || '')
    if (!appEmail()) return res.status(500).json({ error: 'Variable APP_EMAIL non configurée dans Vercel → Settings → Environment Variables.' })
    if (!appPassword()) return res.status(500).json({ error: 'Variable APP_PASSWORD non configurée dans Vercel → Settings → Environment Variables.' })
    if (!secret()) return res.status(500).json({ error: 'Variable APP_SECRET non configurée dans Vercel → Settings → Environment Variables.' })
    if (email !== appEmail() || pw !== appPassword()) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' })
    const token = makeToken(email)
    return res.status(200).json({ token, user: { email, name: appName() } })
  }

  if (action === 'me') {
    const u = body.token ? verifyToken(body.token) : null
    if (!u) return res.status(401).json({ error: 'Session expirée.' })
    return res.status(200).json({ user: { email: u.email, name: appName() } })
  }

  if (action === 'logout') return res.status(200).json({ ok: true })

  return res.status(400).json({ error: 'Action inconnue : ' + action })
}
