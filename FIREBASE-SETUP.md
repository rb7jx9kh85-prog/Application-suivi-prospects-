# Migration vers Firebase Firestore — guide pas à pas

Ton app stockait les prospects dans un fichier du dépôt GitHub (`data/prospects.json`),
et la synchro « remplaçait tout le tableau » → quand un appareil avait un vieux cache,
il réécrasait les données. C'est fini : les données vivent maintenant dans **Firestore**,
avec **1 document par prospect** et une synchro **par delta** (chaque appareil n'envoie
que ce qu'il a réellement modifié). Plus d'écrasement possible.

Projet Firebase utilisé : **app-prospection-alpinia**.

---

## Ce que TU dois faire (≈ 10 min)

### 1. Activer Firestore
1. Va sur https://console.firebase.google.com → projet **app-prospection-alpinia**.
2. Menu de gauche → **Firestore Database** → **Créer une base de données**.
3. Choisis **Production mode** (les règles n'ont pas d'importance : le serveur y accède
   avec une clé d'admin qui les contourne). Choisis la région `eur3` (Europe).

### 2. Générer la clé de service (le « mot de passe » du serveur)
1. Console Firebase → ⚙️ **Paramètres du projet** → onglet **Comptes de service**.
2. Bouton **Générer une nouvelle clé privée** → un fichier `.json` se télécharge.
   ⚠️ **Fichier secret** — ne le mets JAMAIS dans le dépôt GitHub.

### 3. Déclarer la clé dans Vercel
1. Ouvre le fichier `.json` téléchargé, copie **tout son contenu**.
2. Vercel → ton projet → **Settings** → **Environment Variables**.
3. Nouvelle variable :
   - **Name** : `FIREBASE_SERVICE_ACCOUNT`
   - **Value** : colle tout le JSON (en un seul bloc).
   - Environnements : coche **Production**, **Preview** et **Development**.
4. Enregistre.

> Les variables déjà en place (`APP_EMAIL`, `APP_PASSWORD`, `APP_SECRET`) ne changent
> pas : ton login reste identique. `GITHUB_TOKEN` n'est plus utilisé pour les données
> (tu peux le garder, ça ne gêne pas).

### 4. Importer tes données actuelles dans Firestore (une seule fois)
Depuis ton ordinateur, dans le dossier du projet :

```bash
# 1) mets la même clé de service en local
export GOOGLE_APPLICATION_CREDENTIALS="/chemin/vers/le-fichier-telecharge.json"

# 2) installe les dépendances et lance l'import
npm install
npm run migrate
```

Tu dois voir :

```
👤 Compte 155ab99e5261…
   prospects : 197 document(s)
   todos : 14 document(s)
   notes : 3 document(s)
✅ Migration terminée — 214 document(s) écrits dans Firestore.
```

> Le script est **rejouable** sans risque (il écrase par `id`, pas de doublons).
> Ton ancien `data/prospects.json` reste dans le dépôt comme **sauvegarde**.

### 5. Déployer
Pousse la branche / merge, laisse Vercel redéployer. À la **première ouverture** de
l'app sur chaque appareil, un reset automatique repart proprement des données Firestore
(fini les caches périmés). Par sécurité, fais **un rafraîchissement forcé** une fois par
appareil (iPhone : ferme l'onglet et rouvre ; ou Réglages Safari → Effacer historique).

---

## Comment ça marche maintenant (résumé technique)

- **Stockage** : `users/{clé}/prospects/{id}`, `.../todos/{id}`, `.../notes/{id}`
  (clé = `sha256(email)`, identique à avant).
- **Écriture** (`api/data-save.js`) : reçoit un **delta** `{ upserts, deletes }` et
  applique exactement ces changements. Un ancien front encore en cache (mode « legacy »)
  ne peut qu'**ajouter** des enregistrements manquants — jamais écraser ni supprimer.
- **Lecture** (`api/data-load.js`) : renvoie tous les documents de l'utilisateur.
- **Front** (`public/index.html`) : garde un « baseline » de l'état serveur et ne pousse
  que la différence. Au démarrage, il pousse ses changements locaux puis récupère l'état
  serveur consolidé (fusion multi-appareils par `id`).

## En cas d'erreur
- « FIREBASE_SERVICE_ACCOUNT manquant » → variable non définie dans Vercel (étape 3).
- « n'est pas un JSON valide » → le collage du JSON est incomplet, recolle tout le fichier.
- Rien ne se charge → vérifie que Firestore est bien activé (étape 1) et redéploie.
