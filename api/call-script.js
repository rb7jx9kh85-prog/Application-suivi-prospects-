const https = require('https')

function openai(key, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload)
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (r) => {
      let out = ''
      r.on('data', (c) => { out += c })
      r.on('end', () => {
        try { resolve(JSON.parse(out)) } catch (e) { reject(new Error('Réponse OpenAI illisible')) }
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_API
  if (!key) return res.status(200).json({ error: 'OPENAI_API_KEY non configurée.' })

  // ===== MODE COLDCRAFT — Générateur de script intelligent (Module 1) =====
  if (req.body && req.body.mode === 'coldcraft') {
    const { nom, secteur, taille, caractere, objectif, canal } = req.body
    if (!nom) return res.status(400).json({ error: 'Nom de l\'établissement requis.' })

    const tutoie = caractere === 'Amical'
    const system = 'Tu es l\'assistant de cold call de Noé, fondateur d\'Alpinia Web Craft '
      + '(agence web pour PME et indépendants en Valais, Suisse).\n'
      + 'Génère TOUJOURS deux versions du script : COURTE (~35s, pour un décroché rapide) et LONGUE (~1m30, si le prospect accroche).\n'
      + 'Règles non négociables :\n'
      + '- Toujours mentionner que la maquette de site est GRATUITE et sans engagement\n'
      + '- Toujours demander 15 minutes en visio (ou selon le canal indiqué)\n'
      + '- Adapter le vocabulaire au secteur fourni\n'
      + '- Ton : ' + (tutoie ? 'tutoiement (patron amical)' : 'vouvoiement (patron sérieux/inconnu/direct)') + '\n'
      + '- Dis ton nom et celui de l\'entreprise dans les 3 premières secondes\n'
      + '- Pose des questions ouvertes, jamais fermées\n'
      + '- Termine toujours par une question concrète ("quand cette semaine ?", pas "ça vous va ?")\n'
      + '- Jamais de script générique type téléopérateur — naturel, humain, confiant\n'
      + 'Réponds UNIQUEMENT en JSON strict, sans markdown : '
      + '{"court":"script court complet prêt à lire","long":"script long complet prêt à lire",'
      + '"objections_probables":["objection 1 + ta réponse","objection 2 + ta réponse","objection 3 + ta réponse"],'
      + '"relance":"une phrase de relance si silence ou hésitation"}'

    const userMsg = 'Génère le script pour ce prospect :\n'
      + '- Établissement : ' + nom + '\n'
      + '- Secteur : ' + (secteur || 'non précisé') + '\n'
      + '- Taille : ' + (taille || 'non précisée') + '\n'
      + '- Caractère du patron : ' + (caractere || 'Inconnu') + '\n'
      + '- Objectif de l\'appel : ' + (objectif || 'RDV visio') + '\n'
      + '- Canal de présentation : ' + (canal || 'Visio') + '\n'
      + 'Les 3 objections_probables doivent être SPÉCIFIQUES à ce secteur et cette taille d\'entreprise.'

    try {
      const r = await openai(key, {
        model: 'gpt-4o-mini',
        max_tokens: 1400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMsg },
        ],
      })
      if (r.error) return res.status(200).json({ error: r.error.message })
      const text = (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) || ''
      let data
      try { data = JSON.parse(text) } catch (e) {
        const m = text.match(/\{[\s\S]*\}/)
        if (!m) return res.status(200).json({ error: 'Réponse IA non parseable.' })
        data = JSON.parse(m[0])
      }
      return res.status(200).json({ result: data })
    } catch (e) {
      return res.status(200).json({ error: e.message })
    }
  }

  // ===== MODE CLASSIQUE — script libre depuis une fiche prospect =====
  const { name, city, type, contact, website, description, notes } = req.body || {}
  const prompt = `Génère un script de cold call en français suisse pour prospecter l'entreprise suivante :
- Nom : ${name || 'l\'entreprise'}
- Ville : ${city || 'Suisse'}
- Secteur : ${type || 'non précisé'}
- Contact : ${contact || 'non précisé'}
- Site web : ${website || 'non'}
- Description : ${description || ''}
- Notes : ${notes || ''}

Structure obligatoire en 3 parties clairement séparées :

🎯 ACCROCHE (2 phrases max)
Débute par une phrase d'accroche personnalisée qui capte l'attention.

💼 PITCH (3 phrases max)
Présente notre offre de manière concise et orientée bénéfices.

❓ QUESTIONS DE QUALIFICATION (3 questions)
Des questions ouvertes pour qualifier le prospect.

Ton : professionnel mais chaleureux, naturel, adapté au marché suisse romand. Pas de formules creuses.`

  try {
    const r = await openai(key, {
      model: 'gpt-4o-mini',
      max_tokens: 600,
      messages: [
        { role: 'system', content: 'Tu es un expert en cold calling B2B en Suisse romande. Tu génères des scripts efficaces et naturels.' },
        { role: 'user', content: prompt }
      ]
    })
    if (r.error) return res.status(200).json({ error: r.error.message })
    const text = r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content || ''
    return res.status(200).json({ script: text })
  } catch (e) {
    return res.status(200).json({ error: e.message })
  }
}
