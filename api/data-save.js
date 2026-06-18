const { kv } = require('@vercel/kv')

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { token, prospects, todos } = req.body || {}
  if (!token) return res.status(400).json({ error: 'token requis' })

  try {
    if (Array.isArray(prospects)) await kv.set('prospects:' + token, prospects)
    if (Array.isArray(todos))     await kv.set('todos:'     + token, todos)
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
