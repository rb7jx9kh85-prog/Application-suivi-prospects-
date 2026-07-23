const crypto = require('crypto')
const { Readable } = require('stream')
const { get } = require('@vercel/blob')

const secret = () => process.env.APP_SECRET || 'alpinia-default-secret-change-me'

function validToken(token) {
  try {
    const decoded = Buffer.from(token || '', 'base64').toString('utf8')
    const lastPipe = decoded.lastIndexOf('|')
    if (lastPipe === -1) return false
    const payload = decoded.slice(0, lastPipe)
    const sig = decoded.slice(lastPipe + 1)
    if (crypto.createHmac('sha256', secret()).update(payload).digest('hex') !== sig) return false
    const exp = parseInt(payload.split('|').pop(), 10)
    return !isNaN(exp) && exp >= Date.now()
  } catch (e) { return false }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const body = req.body || {}
  if (!validToken(body.token)) return res.status(401).json({ error: 'Session expirée.' })
  if (!body.url || !String(body.url).includes('.blob.vercel-storage.com/')) return res.status(400).json({ error: 'Fichier invalide.' })

  try {
    const result = await get(String(body.url), { access: 'private', token: process.env.BLOB_READ_WRITE_TOKEN })
    if (!result || result.statusCode !== 200 || !result.stream) return res.status(404).json({ error: 'Fichier introuvable.' })
    res.setHeader('Content-Type', result.blob.contentType || 'application/octet-stream')
    if (result.blob.size) res.setHeader('Content-Length', String(result.blob.size))
    res.setHeader('Content-Disposition', 'attachment; filename="' + String(body.name || 'fichier').replace(/["\\\r\n]/g, '_') + '"')
    Readable.fromWeb(result.stream).pipe(res)
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Téléchargement impossible.' })
  }
}
