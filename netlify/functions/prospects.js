const { getStore } = require('@netlify/blobs')
const HEAD = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (s, b) => ({ statusCode: s, headers: HEAD, body: JSON.stringify(b) })
const sessions = () => getStore({ name: 'sessions', consistency: 'strong' })
const data = () => getStore('prospects')
async function userIdFrom(token) {
  const s = token && await sessions().get(token, { type: 'json' })
  if (!s || s.exp < Date.now()) return null
  return s.userId
}
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' })
  let body = {}
  try { body = JSON.parse(event.body || '{}') } catch { return json(400, { error: 'JSON invalide.' }) }
  const userId = await userIdFrom(body.token)
  if (!userId) return json(401, { error: 'Non authentifié.' })
  const key = `u_${userId}`
  if (body.action === 'list') {
    const list = await data().get(key, { type: 'json' })
    return json(200, { prospects: Array.isArray(list) ? list : [] })
  }
  if (body.action === 'save') {
    await data().setJSON(key, Array.isArray(body.prospects) ? body.prospects : [])
    return json(200, { ok: true })
  }
  return json(400, { error: 'Action inconnue.' })
}
