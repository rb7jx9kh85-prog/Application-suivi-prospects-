// Restauration en un clic : réimporte data/prospects.json (l'ancien stockage
// GitHub) vers Firestore pour le compte authentifié par le token. Déclenchée
// depuis un bouton dans l'app — aucun terminal requis côté utilisateur.
// Sûr à rejouer plusieurs fois (écrase par id, jamais de doublons).
const fs = require('fs')
const path = require('path')
const { getDb, emailFromToken, userKey, COLLECTIONS } = require('./_firebase')

const CHUNK = 400

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
    const file = path.join(__dirname, '..', 'data', 'prospects.json')
    if (!fs.existsSync(file)) {
      return res.status(500).json({ error: 'Sauvegarde introuvable sur le serveur (data/prospects.json manquant).' })
    }
    const dbJson = JSON.parse(fs.readFileSync(file, 'utf8') || '{}')
    const key = userKey(email)
    const u = dbJson[key]
    if (!u) return res.status(404).json({ error: 'Aucune sauvegarde trouvée pour ce compte.' })

    const db = getDb()
    const userRef = db.collection('users').doc(key)
    const now = Date.now()
    await userRef.set({ lastSaved: u.lastSaved || now, email }, { merge: true })

    const counts = {}
    for (const name of COLLECTIONS) {
      const records = Array.isArray(u[name]) ? u[name] : []
      const col = userRef.collection(name)
      let written = 0
      for (let i = 0; i < records.length; i += CHUNK) {
        const batch = db.batch()
        records.slice(i, i + CHUNK).forEach(rec => {
          const id = String(rec && rec.id != null ? rec.id : '').trim()
          if (!id) return
          batch.set(col.doc(id), Object.assign({}, rec, { _m: now }))
          written++
        })
        await batch.commit()
      }
      counts[name] = written
    }

    return res.status(200).json({ ok: true, counts })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
