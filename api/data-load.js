const https = require('https')

function kvRequest(method, key, value) {
  return new Promise((resolve, reject) => {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) return reject(new Error('KV non configuré (KV_REST_API_URL / KV_REST_API_TOKEN manquants)'))

    const body = method === 'SET'
      ? JSON.stringify(['SET', key, JSON.stringify(value)])
      : JSON.stringify(['GET', key])

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
      r.on('end', () => {
        try {
          const json = JSON.parse(out)
          const result = Array.isArray(json) ? json[0] : json
          if (result && result.error) return reject(new Error(result.error))
          const raw = result && result.result !== undefined ? result.result : null
          resolve(raw !== null && typeof raw === 'string' ? JSON.parse(raw) : raw)
        } catch (e) { reject(e) }
      })
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

  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'token requis' })

  try {
    const [prospects, todos] = await Promise.all([
      kvRequest('GET', 'prospects:' + token),
      kvRequest('GET', 'todos:' + token),
    ])
    return res.status(200).json({ prospects: prospects || [], todos: todos || [] })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
