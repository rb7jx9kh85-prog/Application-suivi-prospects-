const https = require('https')

function getJSON(urlStr, timeoutMs) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr)
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: { 'User-Agent': 'AlpiniaProspect/1.0', 'Accept': 'application/json' },
    }, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        if (r.statusCode !== 200) return reject(new Error('HTTP ' + r.statusCode))
        try { resolve(JSON.parse(out)) } catch (e) { reject(new Error('Réponse illisible')) }
      })
    })
    req.setTimeout(timeoutMs || 8000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.on('error', reject)
    req.end()
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { address, city } = req.body || {}
  if (!address && !city) return res.status(400).json({ error: 'Adresse requise' })

  const geoKey = process.env.GEOAPIFY_KEY || process.env.GEOAPIFY_API_KEY
  if (!geoKey) return res.status(400).json({ error: 'GEOAPIFY_KEY non configurée' })

  const query = [address, city, 'Suisse'].filter(Boolean).join(', ')

  try {
    // Geocode the address — if it's a POI Geoapify returns a name directly
    const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&limit=5&lang=fr&apiKey=${geoKey}`
    const geo = await getJSON(geoUrl, 8000)
    const features = geo.features || []

    // Look for a result that has a name (POI or building)
    for (const f of features) {
      const p = f.properties || {}
      const raw = (p.datasource && p.datasource.raw) || {}
      const name = p.name || raw.name || raw['name:fr'] || raw.brand || raw.operator
      if (name) return res.status(200).json({ name })
    }

    // Fallback: try nearby places around the geocoded point
    if (features.length > 0) {
      const [lon, lat] = features[0].geometry.coordinates
      const placesUrl = `https://api.geoapify.com/v2/places?categories=commercial,catering,service,office,accommodation,healthcare,sport,leisure&filter=circle:${lon},${lat},80&limit=5&lang=fr&apiKey=${geoKey}`
      const nearby = await getJSON(placesUrl, 8000)
      for (const f of (nearby.features || [])) {
        const p = f.properties || {}
        const raw = (p.datasource && p.datasource.raw) || {}
        const name = p.name || raw.name || raw['name:fr'] || raw.brand || raw.operator
        if (name) return res.status(200).json({ name })
      }
    }

    return res.status(200).json({ name: null, hint: 'Nom introuvable pour cette adresse' })
  } catch (e) {
    return res.status(200).json({ error: e.message })
  }
}
