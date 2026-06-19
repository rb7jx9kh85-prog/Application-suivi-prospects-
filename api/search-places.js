const https = require('https')

// Chaque catégorie = liste de filtres { key, values }. On groupe les valeurs en
// une seule regex par clé → 1 statement Overpass au lieu de N (bien plus rapide).
// AUCUN wildcard "key=*" : ça scannerait tout OSM et fait timeout.
const OSM_CATEGORIES = {
  restaurant: [{ k: 'amenity', v: ['restaurant', 'fast_food', 'cafe', 'bar', 'pub', 'food_court', 'ice_cream', 'biergarten'] }],
  hotel:      [{ k: 'tourism', v: ['hotel', 'motel', 'guest_house', 'hostel', 'chalet', 'apartment'] }],
  commerce:   [{ k: 'shop', v: ['clothes', 'shoes', 'jewelry', 'boutique', 'gift', 'florist', 'bakery', 'butcher', 'furniture', 'books', 'toys', 'watches', 'bag', 'fashion_accessories'] }],
  beauty:     [{ k: 'shop', v: ['hairdresser', 'beauty', 'massage', 'cosmetics', 'nail_salon', 'perfumery', 'tattoo'] }],
  sante:      [{ k: 'amenity', v: ['clinic', 'dentist', 'pharmacy', 'doctors', 'veterinary'] }, { k: 'healthcare', v: ['doctor', 'physiotherapist', 'psychotherapist', 'dentist', 'clinic'] }],
  fitness:    [{ k: 'leisure', v: ['fitness_centre', 'sports_centre', 'sports_hall', 'dance'] }, { k: 'shop', v: ['sports'] }],
  immobilier: [{ k: 'office', v: ['estate_agent'] }],
  auto:       [{ k: 'shop', v: ['car', 'car_repair', 'car_dealer', 'car_parts', 'tyres', 'motorcycle'] }],
  it:         [{ k: 'office', v: ['it', 'consulting', 'company', 'advertising_agency', 'marketing'] }, { k: 'shop', v: ['computer', 'electronics', 'mobile_phone'] }],
  // "Tous secteurs" : uniquement des commerces/bureaux/artisans réels (jamais amenity=* qui inclut bancs/poubelles)
  autre:      [{ k: 'shop' }, { k: 'office' }, { k: 'craft' }],
}

function buildFilters(defs) {
  return defs.map(d => {
    if (!d.v || !d.v.length) {
      // clé seule (ex: shop) → tous les commerces, borné mais OK
      return `nwr["${d.k}"](area.a);`
    }
    const re = '^(' + d.v.join('|') + ')$'
    return `nwr["${d.k}"~"${re}"](area.a);`
  }).join('\n  ')
}

function overpassQuery(city, defs, limit) {
  // Area exacte (anchored, insensible à la casse) → indexé, très rapide.
  // timeout interne court (8s) : Vercel Hobby coupe la fonction à 10s, on doit
  // rester bien en-dessous.
  return `[out:json][timeout:8];
area["name"~"^${city}$",i]["boundary"="administrative"]["admin_level"~"^(8|7|6)$"]->.a;
(
  ${buildFilters(defs)}
);
out center ${limit * 4};`
}

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter', // miroir FR, rapide pour la Suisse
]

// POST vers une URL, en suivant les redirections 301/302 (jusqu'à 3 sauts).
function postFollow(urlStr, data, hops) {
  return new Promise((resolve, reject) => {
    if (hops > 3) return reject(new Error('Trop de redirections'))
    const u = new URL(urlStr)
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'AlpiniaProspect/1.0 (prospection B2B)',
        'Accept': 'application/json',
      },
    }, (r) => {
      // Redirection → on rejoue le POST vers la nouvelle URL
      if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location) {
        r.resume() // vide le flux
        const next = new URL(r.headers.location, urlStr).toString()
        return resolve(postFollow(next, data, hops + 1))
      }
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        if (r.statusCode !== 200) return reject(new Error('HTTP ' + r.statusCode))
        try { resolve(JSON.parse(out)) }
        catch (e) { reject(new Error('Réponse illisible')) }
      })
    })
    req.setTimeout(9000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

function callOverpass(url, query) {
  return postFollow(url, 'data=' + encodeURIComponent(query), 0)
}

// Interroge les 3 serveurs EN PARALLÈLE : le premier qui renvoie un résultat
// valide gagne. Vercel coupe à 10s → on ne peut pas les essayer en série.
function callWithFallback(query) {
  const attempts = ENDPOINTS.map(url => callOverpass(url, query))
  return new Promise((resolve, reject) => {
    let pending = attempts.length
    let lastErr = null
    attempts.forEach(p => {
      p.then(data => resolve(data)).catch(e => {
        lastErr = e
        if (--pending === 0) reject(lastErr || new Error('Serveurs indisponibles'))
      })
    })
  })
}

function parseElement(el) {
  const t = el.tags || {}
  const name = t.name || t['name:fr'] || t.brand || null
  if (!name) return null

  const address = [
    t['addr:housenumber'] && t['addr:street'] ? t['addr:housenumber'] + ' ' + t['addr:street'] : (t['addr:street'] || null),
    t['addr:postcode'] || null,
    t['addr:city'] || null,
  ].filter(Boolean).join(', ')

  const domain = t.amenity || t.shop || t.tourism || t.leisure || t.office || t.healthcare || t.craft || ''

  return {
    establishment: name,
    website: t.website || t['contact:website'] || t.url || '',
    phone: t.phone || t['contact:phone'] || t['contact:mobile'] || '',
    email: t.email || t['contact:email'] || '',
    city: t['addr:city'] || '',
    domain: domain,
    notes: address || '',
    status: 'to_call',
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { city, category, limit = 30 } = req.body || {}
  if (!city) return res.status(400).json({ error: 'Indique une ville.' })

  const cap = Math.min(Math.max(parseInt(limit) || 30, 1), 100)
  const defs = OSM_CATEGORIES[category] || OSM_CATEGORIES.restaurant
  const cleanCity = city.trim().replace(/["\\]/g, '')
  const query = overpassQuery(cleanCity, defs, cap)

  try {
    const data = await callWithFallback(query)
    let elements = (data.elements || [])
      .map(parseElement)
      .filter(Boolean)
    // dédoublonnage par nom
    const seen = new Set()
    elements = elements.filter(p => {
      const key = p.establishment.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    // tri : ceux avec téléphone/site d'abord (plus exploitables), mais on garde TOUT
    elements.sort((a, b) => {
      const sa = (a.phone ? 2 : 0) + (a.website ? 1 : 0)
      const sb = (b.phone ? 2 : 0) + (b.website ? 1 : 0)
      return sb - sa
    })
    elements = elements.slice(0, cap)

    if (!elements.length) {
      return res.status(200).json({ results: [], total: 0, hint: 'Aucun résultat. Vérifie l\'orthographe de la ville (ex: "Sion", "Genève") ou essaie un autre secteur.' })
    }
    return res.status(200).json({ results: elements, total: elements.length })
  } catch (e) {
    return res.status(200).json({ error: 'Recherche indisponible (' + (e.message || 'erreur') + '). Réessaie dans quelques secondes.' })
  }
}
