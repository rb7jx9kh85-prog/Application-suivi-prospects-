const https = require('https')

function ghRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        Authorization: 'Bearer ' + token,
        'User-Agent': 'alpinia-app/1.0',
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        try { resolve({ status: r.statusCode, body: JSON.parse(out) }) }
        catch (e) { resolve({ status: r.statusCode, body: out }) }
      })
    })
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.GITHUB_TOKEN
  if (!token) return res.status(200).json({ error: 'GITHUB_TOKEN absent' })

  try {
    // Test: lire le fichier data/prospects.json
    const r = await ghRequest('GET', '/repos/rb7jx9kh85-prog/Application-suivi-prospects-/contents/data/prospects.json', null, token)
    return res.status(200).json({
      github_read_status: r.status,
      sha: r.body?.sha || null,
      content_length: r.body?.content?.length || 0,
      error: r.body?.message || null,
    })
  } catch (e) {
    return res.status(200).json({ exception: e.message })
  }
}
