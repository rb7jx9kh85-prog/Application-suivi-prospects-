// Sauvegarde les données vers Firestore, 1 document par enregistrement.
//
// Deux modes :
//  1) DELTA (nouveau front) : { token, delta:true, changes:{ prospects:{upserts,deletes}, ... } }
//     → applique exactement les créations/modifs/suppressions. Zéro écrasement
//       du reste : un appareil n'envoie que ce QU'IL a réellement changé.
//  2) LEGACY (ancien front encore en cache) : { token, prospects:[...], ... }
//     → upsert « si absent » uniquement : un cache périmé peut seulement AJOUTER
//       des enregistrements manquants, jamais écraser ni supprimer. C'est ce qui
//       neutralise le bug « le téléphone réécrit tout avec sa vieille version ».
const { getDb, emailFromToken, userKey, COLLECTIONS } = require('./_firebase')

const CHUNK = 400 // limite Firestore : 500 opérations par batch

function docId(rec) {
  return String(rec && rec.id != null ? rec.id : '').trim()
}

async function commitOps(db, ops) {
  for (let i = 0; i < ops.length; i += CHUNK) {
    const batch = db.batch()
    ops.slice(i, i + CHUNK).forEach(op => {
      if (op.type === 'set') batch.set(op.ref, op.data)
      else if (op.type === 'delete') batch.delete(op.ref)
    })
    await batch.commit()
  }
}

// Mode DELTA : applique upserts + deletes tels quels.
async function applyDelta(db, userRef, changes) {
  const ops = []
  const now = Date.now()
  for (const name of COLLECTIONS) {
    const c = changes[name] || {}
    const col = userRef.collection(name)
    ;(Array.isArray(c.upserts) ? c.upserts : []).forEach(rec => {
      const id = docId(rec)
      if (!id) return
      ops.push({ type: 'set', ref: col.doc(id), data: Object.assign({}, rec, { _m: now }) })
    })
    ;(Array.isArray(c.deletes) ? c.deletes : []).forEach(id => {
      id = String(id || '').trim()
      if (!id) return
      ops.push({ type: 'delete', ref: col.doc(id) })
    })
  }
  await commitOps(db, ops)
}

// Mode LEGACY : upsert « si absent » — ne touche jamais aux docs existants.
async function applyLegacy(db, userRef, arrays) {
  const ops = []
  const now = Date.now()
  for (const name of COLLECTIONS) {
    const incoming = Array.isArray(arrays[name]) ? arrays[name] : []
    if (!incoming.length) continue
    const col = userRef.collection(name)
    const existing = new Set()
    const snap = await col.get()
    snap.forEach(d => existing.add(d.id))
    incoming.forEach(rec => {
      const id = docId(rec)
      if (!id || existing.has(id)) return
      ops.push({ type: 'set', ref: col.doc(id), data: Object.assign({}, rec, { _m: now }) })
    })
  }
  await commitOps(db, ops)
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const body = req.body || {}
  const appToken = body.token
  if (!appToken) return res.status(400).json({ error: 'token requis' })

  const email = emailFromToken(appToken)
  if (!email) return res.status(401).json({ error: 'Token invalide' })

  try {
    const db = getDb()
    const userRef = db.collection('users').doc(userKey(email))
    const lastSaved = body.lastSaved || Date.now()

    if (body.delta) {
      await applyDelta(db, userRef, body.changes || {})
    } else {
      await applyLegacy(db, userRef, body)
    }

    await userRef.set({ lastSaved, email }, { merge: true })
    return res.status(200).json({ ok: true, lastSaved })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
