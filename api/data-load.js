const https = require('https')
const crypto = require('crypto')

const OWNER = 'rb7jx9kh85-prog'
const REPO = 'Application-suivi-prospects-'
const FILE = 'data/prospects.json'

const secret = () => process.env.APP_SECRET || 'alpinia-default-secret-change-me'

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

function fetchFromGithubAPI() {
  return new Promise((resolve, reject) => {
    const token = process.env.GITHUB_TOKEN
    const headers = {
      'User-Agent': 'alpinia-app/1.0',
      Accept: 'application/vnd.github.v3+json',
    }
    if (token) headers.Authorization = 'Bearer ' + token

    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/${FILE}`,
      method: 'GET',
      headers,
    }, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        try {
          const json = JSON.parse(out)
          if (r.statusCode === 404) return resolve({})
          if (r.statusCode !== 200) return reject(new Error('GitHub ' + r.statusCode + ': ' + (json.message || out)))
          const content = Buffer.from(json.content, 'base64').toString('utf8')
          resolve(JSON.parse(content || '{}'))
        } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
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

  const email = emailFromToken(token)
  if (!email) return res.status(401).json({ error: 'Token invalide' })

  try {
    const db = await fetchFromGithubAPI()
    const key = crypto.createHash('sha256').update(email).digest('hex')
    const userData = db[key] || {}
    return res.status(200).json({
      prospects: userData.prospects || [],
      todos: userData.todos || [],
      notes: userData.notes || [],
      lastSaved: userData.lastSaved || 0,
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
