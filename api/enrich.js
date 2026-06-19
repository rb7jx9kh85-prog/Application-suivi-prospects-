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
  if (!key) return res.status(200).json({ error: 'OPENAI_API_KEY (ou OPENAI_API) non configurée dans les variables Vercel.' })

  try {
    const { prospectName, website, type, city } = req.body || {}
    if (!prospectName) return res.status(400).json({ error: 'prospectName requis.' })

    const loc = [type, city ? 'à ' + city : ''].filter(Boolean).join(' ')
    const prompt = 'Recherche sur le web des informations à jour sur l\'établissement "' + prospectName + '"'
      + (loc ? ' (' + loc + ')' : '')
      + (website ? ', site web ' + website : '')
      + ', en Suisse.\n'
      + 'Cherche EN PRIORITÉ, notamment sur LinkedIn et sur le site officiel, le ou la dirigeant·e '
      + '(patron, gérant, directeur, fondateur) : son nom complet, sa fonction, son profil LinkedIn, '
      + 'et son numéro de téléphone professionnel/direct s\'il est rendu public.\n'
      + 'Réponds UNIQUEMENT par un objet JSON valide, sans markdown, sans texte autour :\n'
      + '{"full_address":"adresse complète CP+ville","phone":"téléphone standard de l\'établissement",'
      + '"phone_source":"source du téléphone (Site officiel, Google Maps, Pages Jaunes, etc)",'
      + '"email":"email de contact","opening_hours":"horaires","description":"1-2 phrases",'
      + '"google_rating":"note Google ex 4.3/5","employees_approx":"estimation employés",'
      + '"key_decision_maker":"Prénom Nom — fonction du décideur (patron/gérant/directeur)",'
      + '"decision_maker_phone":"numéro direct/professionnel du décideur si trouvé publiquement",'
      + '"decision_maker_phone_source":"source du numéro du décideur (LinkedIn, site officiel, etc)",'
      + '"linkedin":"URL du profil LinkedIn du décideur, ou à défaut la page LinkedIn de l\'entreprise"}\n'
      + 'IMPORTANT: Pour CHAQUE numéro de téléphone trouvé, fournis TOUJOURS la source (phone_source et decision_maker_phone_source).\n'
      + 'Mets null pour toute info introuvable. N\'invente JAMAIS un numéro ni un profil : uniquement des données réelles et publiques.'

    const r = await openai(key, {
      model: 'gpt-4o-mini-search-preview',
      web_search_options: { user_location: { type: 'approximate', approximate: { country: 'CH' } } },
      max_completion_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    if (r.error) return res.status(200).json({ error: r.error.message || 'Erreur OpenAI' })

    const text = (r.choices && r.choices[0] && r.choices[0].message && r.choices[0].message.content) ? r.choices[0].message.content : ''
    const m = text.match(/\{[\s\S]*\}/)
    if (!m) return res.status(200).json({ error: 'Réponse IA non parseable.', raw: text.slice(0, 400) })

    return res.status(200).json({ enrichedData: JSON.parse(m[0]) })
  } catch (e) {
    return res.status(200).json({ error: e.message || 'Erreur serveur' })
  }
}
