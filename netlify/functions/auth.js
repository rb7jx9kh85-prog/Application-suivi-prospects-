const { getStore } = require('@netlify/blobs')
const crypto = require('crypto')
const HEAD = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (s, b) => ({ statusCode: s, headers: HEAD, body: JSON.stringify(b) })
const users = () => getStore({ name: 'users', consistency: 'strong' })
const sessions = () => getStore({ name: 'sessions', consistency: 'strong' })
const emailKey = (e) => String(e || '').trim().toLowerCase()
const hash = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex')
const newToken = () => crypto.randomBytes(32).toString('hex')
const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' })
  let body = {}
  try { body = JSON.parse(event.body || '{}') } catch { return json(400, { error: 'JSON invalide.' }) }
  const { action } = body
  if (action === 'register') {
    const name = String(body.name || '').trim()
    const key = emailKey(body.email)
    const pw = String(body.password || '')
    if (!name || !key || pw.length < 6) return json(400, { error: 'Tous les champs requis (mot de passe min. 6 caractères).' })
    if (await users().get(key, { type: 'json' })) return json(409, { error: 'Cet email est déjà utilisé.' })
    const salt = crypto.randomBytes(16).toString('hex')
    const id = crypto.randomUUID()
    await users().setJSON(key, { id, name, email: key, salt, hash: hash(pw, salt), at: Date.now() })
    const token = newToken()
    await sessions().setJSON(token, { userId: id, email: key, exp: Date.now() + THIRTY_DAYS })
    return json(200, { token, user: { id, name, email: key } })
  }
  if (action === 'login') {
    const key = emailKey(body.email)
    const u = await users().get(key, { type: 'json' })
    if (!u || u.hash !== hash(String(body.password || ''), u.salt)) {
      return json(401, { error: 'Email ou mot de passe incorrect.' })
    }
    const token = newToken()
    await sessions().setJSON(token, { userId: u.id, email: key, exp: Date.now() + THIRTY_DAYS })
    return json(200, { token, user: { id: u.id, name: u.name, email: key } })
  }
  if (action === 'me') {
    const s = body.token && await sessions().get(body.token, { type: 'json' })
    if (!s || s.exp < Date.now()) return json(401, { error: 'Session expirée.' })
    const u = await users().get(s.email, { type: 'json' })
    if (!u) return json(401, { error: 'Compte introuvable.' })
    return json(200, { user: { id: u.id, name: u.name, email: u.email } })
  }
  if (action === 'logout') {
    if (body.token) await sessions().delete(body.token)
    return json(200, { ok: true })
  }
  return json(400, { error: 'Action inconnue.' })
}
