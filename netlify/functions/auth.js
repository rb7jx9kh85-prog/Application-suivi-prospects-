const crypto = require('crypto')

const HEAD = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (s, b) => ({ statusCode: s, headers: HEAD, body: JSON.stringify(b) })

const secret = () => process.env.APP_SECRET || 'alpinia-default-secret-change-me'
const appEmail = () => (process.env.APP_EMAIL || '').toLowerCase().trim()
const appPassword = () => process.env.APP_PASSWORD || ''
const appName = () => process.env.APP_NAME || 'Alpinia Pro'

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30

function makeToken(email) {
  const exp = Date.now() + THIRTY_DAYS
  const payload = email + '|' + exp
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
  return Buffer.from(payload + '|' + sig).toString('base64url')
}

function verifyToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const lastPipe = decoded.lastIndexOf('|')
    const sig = decoded.slice(lastPipe + 1)
    const payload = decoded.slice(0, lastPipe)
    const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
    if (sig !== expected) return null
    const parts = payload.split('|')
    const exp = parseInt(parts[parts.length - 1])
    if (exp < Date.now()) return null
    return { email: parts[0] }
  } catch { return null }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' })

  let body = {}
  try { body = JSON.parse(event.body || '{}') } catch { return json(400, { error: 'JSON invalide.' }) }

  const { action } = body

  if (action === 'login') {
    const email = (body.email || '').trim().toLowerCase()
    const pw = String(body.password || '')
    if (!appEmail()) return json(500, { error: 'APP_EMAIL non configuré dans les variables Netlify.' })
    if (!appPassword()) return json(500, { error: 'APP_PASSWORD non configuré dans les variables Netlify.' })
    if (email !== appEmail() || pw !== appPassword()) {
      return json(401, { error: 'Email ou mot de passe incorrect.' })
    }
    const token = makeToken(email)
    return json(200, { token, user: { email, name: appName() } })
  }

  if (action === 'me') {
    const u = body.token && verifyToken(body.token)
    if (!u) return json(401, { error: 'Session expirée.' })
    return json(200, { user: { email: u.email, name: appName() } })
  }

  if (action === 'logout') {
    return json(200, { ok: true })
  }

  return json(400, { error: 'Action inconnue.' })
}
