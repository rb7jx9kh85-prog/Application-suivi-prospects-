const https = require('https')
const HEAD = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (s, b) => ({ statusCode: s, headers: HEAD, body: JSON.stringify(b) })
function openai(key, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload)
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let out = ''
      res.on('data', (c) => out += c)
      res.on('end', () => { try { resolve(JSON.parse(out)) } catch { reject(new Error('Réponse OpenAI illisible')) } })
    })
    req.on('error', reject); req.write(data); req.end()
  })
}
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' })
  const key = process.env.OPENAI_API_KEY
  if (!key) return json(200, { error: "OPENAI_API_KEY non configurée dans les variables Netlify." })
  try {
    const { prospectName, website, type, city } = JSON.parse(event.body || '{}')
    if (!prospectName) return json(400, { error: 'prospectName requis.' })
    const loc = [type, city ? `à ${city}` : ''].filter(Boolean).join(' ')
    const prompt = `Recherche sur le web des informations à jour sur l'établissement "${prospectName}"${loc ? ` (${loc})` : ''}${website ? `, site web ${website}` : ''}, en Suisse.\nRéponds UNIQUEMENT par un objet JSON valide, sans markdown, sans texte autour :\n{"full_address":"adresse complète CP+ville","phone":"téléphone direct","email":"email de contact","opening_hours":"horaires","description":"1-2 phrases","google_rating":"note Google ex 4.3/5","employees_approx":"estimation employés","key_decision_maker":"fonction du décideur (patron/gérant/directeur)"}\nMets null pour toute info introuvable.`
    const r = await openai(key, {
      model: 'gpt-4o-mini-search-preview',
      web_search_options: { user_location: { type: 'approximate', approximate: { country: 'CH' } } },
      messages: [{ role: 'user', content: prompt }],
    })
    if (r.error) return json(200, { error: r.error.message || 'Erreur OpenAI' })
    const text = r.choices?.[0]?.message?.content || ''
    const m = text.match(/\{[\s\S]*\}/)
    if (!m) return json(200, { error: 'Réponse IA non parseable.', raw: text.slice(0, 400) })
    return json(200, { enrichedData: JSON.parse(m[0]) })
  } catch (e) {
    return json(200, { error: e.message || 'Erreur serveur' })
  }
}
