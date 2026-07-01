// Charge les données de l'utilisateur depuis Firestore.
// Structure : users/{userKey}/prospects, /todos, /notes (1 document par enregistrement).
const { getDb, emailFromToken, userKey, COLLECTIONS } = require('./_firebase')

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
    const userRef = db.collection('users').doc(userKey(email))

    const [prospects, todos, notes] = await Promise.all(
      COLLECTIONS.map(name => readCollection(userRef, name))
    )

    const metaSnap = await userRef.get()
    const lastSaved = (metaSnap.exists && metaSnap.data().lastSaved) || 0

    return res.status(200).json({ prospects, todos, notes, lastSaved })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
