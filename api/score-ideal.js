const https = require('https')

// ============================================================================
//  Analyse "profil prospect idéal" — recherche web réelle par établissement
//  Complète ce que Geoapify/OpenStreetMap ne peuvent pas fournir : ancienneté
//  du site, nombre d'avis Google, qualité des photos, activité Instagram,
//  bouche-à-oreille…
// ============================================================================

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
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout OpenAI')) })
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

  const { name, city, type, website, phone, facebook, instagram } = req.body || {}
  if (!name) return res.status(400).json({ error: 'name requis.' })

  const loc = [type, city ? 'à ' + city : ''].filter(Boolean).join(' ')
  const known = [
    website ? 'Site connu : ' + website : null,
    facebook ? 'Facebook connu : ' + facebook : null,
    instagram ? 'Instagram connu : ' + instagram : null,
    phone ? 'Téléphone : ' + phone : null,
  ].filter(Boolean).join('\n')

  const prompt = 'Tu prospectes en Suisse pour une agence de sites web / marketing digital. '
    + 'Analyse l\'établissement "' + name + '"' + (loc ? ' (' + loc + ')' : '') + '.\n'
    + (known ? known + '\n' : '')
    + 'Cherche activement sur Google, Google Maps, Facebook, Instagram, local.ch et Pages Jaunes pour évaluer ces critères de "prospect idéal" :\n'
    + '1. N\'a pas de site web, ou un site très ancien / visiblement daté (design 2015-2020, non responsive, non mis à jour)\n'
    + '2. Présent uniquement sur Facebook (pas de vrai site officiel)\n'
    + '3. Présent sur Google Maps mais sans site web renseigné\n'
    + '4. Beaucoup d\'avis Google (idéalement 50+)\n'
    + '5. Bonne note Google avec des photos de qualité, belle image d\'entreprise\n'
    + '6. Actif sur Instagram et publie régulièrement (pas juste un compte inactif)\n'
    + '7. Réputation qui semble reposer sur le bouche-à-oreille plutôt que sur le marketing digital\n\n'
    + 'Réponds UNIQUEMENT par un objet JSON valide, sans texte ni markdown autour :\n'
    + '{"has_website":true/false,"website_year_estimate":"année ou null","website_outdated":true/false,'
    + '"facebook_only":true/false,"facebook_url":"URL ou null","instagram_active":true/false,'
    + '"instagram_url":"URL ou null","posts_regularly":true/false,"google_review_count":nombre ou null,'
    + '"google_rating":note sur 5 ou null,"quality_photos":true/false,"word_of_mouth":true/false,'
    + '"score":0 à 100,"is_ideal_match":true/false,"reason":"raison courte, max 20 mots"}\n'
    + 'has_website et is_ideal_match ne doivent jamais être null — tranche toujours à partir des informations publiques trouvées. '
    + 'N\'invente aucune donnée : mets null si une info précise est introuvable.'

  try {
    const r = await openai(key, {
      model: 'gpt-4o-mini-search-preview',
      web_search_options: { user_location: { type: 'approximate', approximate: { country: 'CH' } } },
      max_completion_tokens: 550,
      messages: [{ role: 'user', content: prompt }],
    })

    if (r.error) return res.status(200).json({ error: r.error.message || 'Erreur OpenAI' })

    const text = (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) ? r.choices[0].message.content : ''
    const m = text.match(/\{[\s\S]*\}/)
    if (!m) return res.status(200).json({ error: 'Réponse IA non parseable.', raw: text.slice(0, 400) })

    const parsed = JSON.parse(m[0])
    parsed.score = Math.min(100, Math.max(0, parseInt(parsed.score, 10) || 0))
    return res.status(200).json({ result: parsed })
  } catch (e) {
    return res.status(200).json({ error: e.message || 'Erreur serveur' })
  }
}
