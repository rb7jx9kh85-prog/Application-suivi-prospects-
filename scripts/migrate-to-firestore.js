// Migration one-shot : copie data/prospects.json (ancien stockage GitHub) vers
// Firestore, 1 document par enregistrement.
//
// Lancement (voir FIREBASE-SETUP.md) :
//   export GOOGLE_APPLICATION_CREDENTIALS="/chemin/vers/serviceAccountKey.json"
//   npm run migrate
//
// OU en collant le JSON dans la variable :
//   export FIREBASE_SERVICE_ACCOUNT="$(cat serviceAccountKey.json)"
//   npm run migrate
//
// Idempotent : relançable sans créer de doublons (écrase par id).
const fs = require('fs')
const path = require('path')
const { getDb, COLLECTIONS } = require('../api/_firebase')

const CHUNK = 400

async function main() {
  const file = path.join(__dirname, '..', 'data', 'prospects.json')
  if (!fs.existsSync(file)) {
    console.error('❌ Fichier introuvable :', file)
    process.exit(1)
  }
  const dbJson = JSON.parse(fs.readFileSync(file, 'utf8') || '{}')
  const db = getDb()

  const userKeys = Object.keys(dbJson)
  if (!userKeys.length) {
    console.log('Aucun compte à migrer.')
    return
  }

  let totalDocs = 0
  const now = Date.now()

  for (const key of userKeys) {
    const u = dbJson[key] || {}
    const userRef = db.collection('users').doc(key)
    await userRef.set({ lastSaved: u.lastSaved || now }, { merge: true })
    console.log('\n👤 Compte', key.slice(0, 12) + '…')

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
      totalDocs += written
      console.log('   ' + name + ' : ' + written + ' document(s)')
    }
  }

  console.log('\n✅ Migration terminée — ' + totalDocs + ' document(s) écrits dans Firestore.')
}

main().catch(e => {
  console.error('\n❌ Échec de la migration :', e.message)
  process.exit(1)
})
