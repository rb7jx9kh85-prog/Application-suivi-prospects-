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
  // timeout interne court : on veut une réponse rapide, pas un scan profond.
  return `[out:json][timeout:25];
area["name"~"^${city}$",i]["boundary"="administrative"]["admin_level"~"^(8|7|6)$"]->.a;
(
  ${buildFilters(defs)}
);
out center tags ${limit * 4};`
}

const ENDPOINTS = [
  'overpass-api.de',
  'overpass.kumi.systems',
  'maps.mail.ru', // miroir Overpass
]

function callOverpass(host, query) {
  return new Promise((resolve, reject) => {
    const data = 'data=' + encodeURIComponent(query)
    const req = https.request({
      hostname: host,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'AlpiniaProspect/1.0 (prospection B2B)',
      },
    }, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        if (r.statusCode !== 200) return reject(new Error('HTTP ' + r.statusCode))
        try { resolve(JSON.parse(out)) }
        catch (e) { reject(new Error('Réponse illisible')) }
      })
    })
    req.setTimeout(26000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

// Essaie chaque serveur jusqu'à ce qu'un réponde.
async function callWithFallback(query) {
  let lastErr = null
  for (const host of ENDPOINTS) {
    try {
      return await callOverpass(host, query)
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('Tous les serveurs Overpass sont indisponibles')
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
