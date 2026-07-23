const crypto = require('crypto')
const { put } = require('@vercel/blob')

const MAX_FILE_SIZE = 2 * 1024 * 1024
const secret = () => process.env.APP_SECRET || 'alpinia-default-secret-change-me'

function userFromToken(token) {
  try {
    const decoded = Buffer.from(token || '', 'base64').toString('utf8')
    const lastPipe = decoded.lastIndexOf('|')
    if (lastPipe === -1) return null
    const sig = decoded.slice(lastPipe + 1)
    const payload = decoded.slice(0, lastPipe)
    const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
    if (sig !== expected) return null
    const parts = payload.split('|')
    const exp = parseInt(parts[parts.length - 1], 10)
    if (isNaN(exp) || exp < Date.now()) return null
    return (parts[0] || '').toLowerCase().trim() || null
  } catch (e) { return null }
}

function safeName(name) {
  return String(name || 'fichier').replace(/[^a-zA-Z0-9._ -]/g, '_').replace(/\s+/g, '-').slice(-120) || 'fichier'
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const body = req.body || {}
  const email = userFromToken(body.token)
  if (!email) return res.status(401).json({ error: 'Session expirée. Connectez-vous à nouveau.' })
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).json({ error: 'Stockage fichiers non configuré. Ajoutez BLOB_READ_WRITE_TOKEN dans Vercel.' })

  const bytes = Buffer.from(String(body.content || ''), 'base64')
  if (!bytes.length) return res.status(400).json({ error: 'Fichier vide ou illisible.' })
  if (bytes.length > MAX_FILE_SIZE) return res.status(413).json({ error: 'Le fichier dépasse la limite de 2 Mo.' })

  try {
    const owner = crypto.createHash('sha256').update(email).digest('hex').slice(0, 24)
    const id = crypto.randomBytes(10).toString('hex')
    const blob = await put(`alpinia-crm/${owner}/${id}-${safeName(body.name)}`, bytes, {
      access: 'private',
      contentType: String(body.mime || 'application/octet-stream').slice(0, 120),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    })
    return res.status(200).json({
      attachment: {
        id,
        name: safeName(body.name),
        mime: String(body.mime || 'application/octet-stream'),
        size: bytes.length,
        url: blob.url,
        pathname: blob.pathname,
        at: Date.now(),
      },
    })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Échec de l\'envoi du fichier.' })
  }
}
