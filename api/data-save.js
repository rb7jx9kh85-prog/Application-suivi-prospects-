const https = require('https')
const crypto = require('crypto')

const OWNER = 'rb7jx9kh85-prog'
const REPO = 'Application-suivi-prospects-'
const FILE = 'data/prospects.json'

const secret = () => process.env.APP_SECRET || 'alpinia-default-secret-change-me'
const ghToken = () => process.env.GITHUB_TOKEN

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

async function readDb(token) {
  const r = await ghRequest('GET', `/repos/${OWNER}/${REPO}/contents/${FILE}`, null, token)
  if (r.status === 404) return { data: {}, sha: null }
  if (r.status !== 200) throw new Error('GitHub read error ' + r.status)
  const content = Buffer.from(r.body.content, 'base64').toString('utf8')
  return { data: JSON.parse(content || '{}'), sha: r.body.sha }
}

async function writeDb(db, sha, token) {
  const content = Buffer.from(JSON.stringify(db, null, 2)).toString('base64')
  const body = { message: 'sync prospects', content, ...(sha ? { sha } : {}) }
  const r = await ghRequest('PUT', `/repos/${OWNER}/${REPO}/contents/${FILE}`, body, token)
  if (r.status !== 200 && r.status !== 201) throw new Error('GitHub write error ' + r.status + ': ' + JSON.stringify(r.body))
  return r.body
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const token = ghToken()
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN manquant dans Vercel' })

  const { token: appToken, prospects, todos, notes } = req.body || {}
  if (!appToken) return res.status(400).json({ error: 'token requis' })

  const email = emailFromToken(appToken)
  if (!email) return res.status(401).json({ error: 'Token invalide' })

  try {
    const key = crypto.createHash('sha256').update(email).digest('hex')
    const { data: db, sha } = await readDb(token)
    if (!db[key]) db[key] = {}
    if (Array.isArray(prospects)) db[key].prospects = prospects
    if (Array.isArray(todos)) db[key].todos = todos
    if (Array.isArray(notes)) db[key].notes = notes
    await writeDb(db, sha, token)
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
