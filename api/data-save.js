const https = require('https')

function kvSet(key, value) {
  return new Promise((resolve, reject) => {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) return reject(new Error('KV non configuré'))

    const body = JSON.stringify([['SET', key, JSON.stringify(value)]])
    const u = new URL(url)
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + (u.pathname.endsWith('/') ? '' : '/') + 'pipeline',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => { try { resolve(JSON.parse(out)) } catch(e) { reject(e) } })
    })
    req.on('error', reject)
    req.write(body)
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

  try {
    const ops = []
    if (Array.isArray(prospects)) ops.push(kvSet('prospects:' + token, prospects))
    if (Array.isArray(todos))     ops.push(kvSet('todos:'     + token, todos))
    if (ops.length) await Promise.all(ops)
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
