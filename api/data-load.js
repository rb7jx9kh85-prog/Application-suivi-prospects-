// Charge les données de l'utilisateur depuis Firestore.
// Structure : users/{userKey}/prospects, /todos, /notes (1 document par enregistrement).
//
// Auto-restauration : si c'est le tout premier chargement après la migration
// (aucun document Firestore pour ce compte, flag "migrated" absent) et que
// data/prospects.json (l'ancienne sauvegarde GitHub) contient ce compte, on
// réimporte automatiquement — aucune action de l'utilisateur requise. Le flag
// "migrated" garantit que ça ne se déclenche qu'une seule fois : si
// l'utilisateur vide sa liste plus tard volontairement, elle ne ressuscitera
// pas depuis l'ancienne sauvegarde.
const fs = require('fs')
const path = require('path')
const { getDb, emailFromToken, userKey, COLLECTIONS } = require('./_firebase')

const CHUNK = 400

// Retire les champs internes de synchro avant de renvoyer au client.
function clean(doc) {
  const d = doc.data() || {}
  delete d._m
  delete d._deleted
  return d
}

async function readCollection(userRef, name) {
  const snap = await userRef.collection(name).get()
  const out = []
  snap.forEach(doc => { out.push(clean(doc)) })
  return out
}

async function autoRestoreFromBackup(db, userRef, key, email) {
  const file = path.join(__dirname, '..', 'data', 'prospects.json')
  if (!fs.existsSync(file)) return null
  let dbJson
  try { dbJson = JSON.parse(fs.readFileSync(file, 'utf8') || '{}') } catch (e) { return null }
  const u = dbJson[key]
  if (!u) return null

  const now = Date.now()
  const restored = {}
  for (const name of COLLECTIONS) {
    const records = Array.isArray(u[name]) ? u[name] : []
    const col = userRef.collection(name)
    for (let i = 0; i < records.length; i += CHUNK) {
      const batch = db.batch()
      records.slice(i, i + CHUNK).forEach(rec => {
        const id = String(rec && rec.id != null ? rec.id : '').trim()
        if (!id) return
        batch.set(col.doc(id), Object.assign({}, rec, { _m: now }))
      })
      await batch.commit()
    }
    restored[name] = records.filter(r => r && r.id != null)
  }
  return restored
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
    const db = getDb()
    const key = userKey(email)
    const userRef = db.collection('users').doc(key)

    const metaSnap = await userRef.get()
    const meta = metaSnap.exists ? metaSnap.data() : {}

    let [prospects, todos, notes] = await Promise.all(
      COLLECTIONS.map(name => readCollection(userRef, name))
    )

    let lastSaved = meta.lastSaved || 0

    if (!prospects.length && !todos.length && !notes.length && !meta.migrated) {
      const restored = await autoRestoreFromBackup(db, userRef, key, email)
      if (restored) {
        prospects = restored.prospects
        todos = restored.todos
        notes = restored.notes
        lastSaved = Date.now()
      }
      console.log('[auto-restore]', key.slice(0, 10), restored
        ? { prospects: prospects.length, todos: todos.length, notes: notes.length }
        : 'no backup found for this account')
      await userRef.set({ migrated: true, lastSaved, email }, { merge: true })
    }

    return res.status(200).json({ prospects, todos, notes, lastSaved })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
