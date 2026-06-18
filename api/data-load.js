const { kv } = require('@vercel/kv')

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'token requis' })

  try {
    const prospects = await kv.get('prospects:' + token) || []
    const todos     = await kv.get('todos:'     + token) || []
    return res.status(200).json({ prospects, todos })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
