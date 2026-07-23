// Module partagé : initialise Firebase Admin (Firestore) et fournit les
// helpers d'authentification communs aux endpoints data-load / data-save.
//
// Variable d'environnement requise dans Vercel :
//   FIREBASE_SERVICE_ACCOUNT  = le contenu JSON complet de la clé de service
//   (Firebase Console → Paramètres du projet → Comptes de service → Générer
//   une nouvelle clé privée). Colle tout le JSON en une seule valeur.
//
// Fallback pratique en local : GOOGLE_APPLICATION_CREDENTIALS pointant vers
// le fichier .json (utilisé par le script de migration).

const admin = require('firebase-admin')
const crypto = require('crypto')

const secret = () => process.env.APP_SECRET || ''

let _db = null

function getDb() {
  if (_db) return _db

  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT
    if (raw && raw.trim()) {
      let creds
      try {
        creds = JSON.parse(raw)
      } catch (e) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT n\'est pas un JSON valide : ' + e.message)
      }
      // Les clés privées collées dans Vercel ont parfois des \n échappés.
      if (creds.private_key && creds.private_key.indexOf('\\n') !== -1) {
        creds.private_key = creds.private_key.replace(/\\n/g, '\n')
      }
      admin.initializeApp({ credential: admin.credential.cert(creds) })
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Utilisé par le script de migration en local.
      admin.initializeApp({ credential: admin.credential.applicationDefault() })
    } else {
      throw new Error('FIREBASE_SERVICE_ACCOUNT manquant dans Vercel → Settings → Environment Variables.')
    }
  }

  _db = admin.firestore()
  return _db
}

// Reconstruit l'email depuis le token applicatif (HMAC signé côté serveur).
function emailFromToken(token) {
  if (!secret()) return null
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

// Clé de compte stable = sha256(email), identique à l'ancien stockage GitHub.
function userKey(email) {
  return crypto.createHash('sha256').update(email).digest('hex')
}

// Chemins Firestore : users/{userKey}/{collection}/{recordId}
// Les pièces jointes ne contiennent que leurs métadonnées ; le fichier reste
// dans le Blob privé Vercel.
const COLLECTIONS = ['prospects', 'todos', 'notes', 'callSessions', 'attachments']

module.exports = { admin, getDb, emailFromToken, userKey, COLLECTIONS }
