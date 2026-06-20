const https = require('https')

// ============================================================================
//  Recherche d'établissements — données OpenStreetMap
//  • Si GEOAPIFY_KEY est défini → Geoapify (fiable, clé gratuite 3000 req/j)
//  • Sinon → Overpass public (gratuit mais souvent lent/surchargé)
// ============================================================================

// ---- Mapping catégories Geoapify (https://apidocs.geoapify.com/docs/places/) ----
const GEOAPIFY_CATS = {
  restaurant: 'catering.restaurant,catering.cafe,catering.fast_food,catering.bar,catering.pub',
  hotel: 'accommodation.hotel,accommodation.motel,accommodation.hostel,accommodation.guest_house',
  commerce: 'commercial.clothing,commercial.shoes,commercial.jewelry,commercial.gift_and_souvenir,commercial.florist,commercial.bakery,commercial.furniture_and_interior,commercial.books',
  beauty: 'service.beauty,service.beauty.hairdresser,service.beauty.spa',
  sante: 'healthcare.pharmacy,healthcare.dentist,healthcare.clinic_or_praxis,healthcare.veterinary',
  fitness: 'sport.fitness,sport.sports_centre,leisure.spa',
  immobilier: 'service.estate_agent,office',
  auto: 'commercial.vehicle,service.vehicle',
  it: 'commercial.electronics,office',
  autre: 'commercial,service,office,catering',
}

// ---- Mapping catégories Overpass (fallback) ----
const OSM_CATEGORIES = {
  restaurant: [{ k: 'amenity', v: ['restaurant', 'fast_food', 'cafe', 'bar', 'pub', 'food_court', 'ice_cream'] }],
  hotel:      [{ k: 'tourism', v: ['hotel', 'motel', 'guest_house', 'hostel', 'chalet', 'apartment'] }],
  commerce:   [{ k: 'shop', v: ['clothes', 'shoes', 'jewelry', 'boutique', 'gift', 'florist', 'bakery', 'butcher', 'furniture', 'books', 'toys'] }],
  beauty:     [{ k: 'shop', v: ['hairdresser', 'beauty', 'massage', 'cosmetics', 'nail_salon', 'perfumery'] }],
  sante:      [{ k: 'amenity', v: ['clinic', 'dentist', 'pharmacy', 'doctors', 'veterinary'] }, { k: 'healthcare', v: ['doctor', 'physiotherapist', 'dentist', 'clinic'] }],
  fitness:    [{ k: 'leisure', v: ['fitness_centre', 'sports_centre', 'sports_hall'] }, { k: 'shop', v: ['sports'] }],
  immobilier: [{ k: 'office', v: ['estate_agent'] }],
  auto:       [{ k: 'shop', v: ['car', 'car_repair', 'car_dealer', 'car_parts', 'tyres'] }],
  it:         [{ k: 'office', v: ['it', 'consulting', 'company'] }, { k: 'shop', v: ['computer', 'electronics'] }],
  autre:      [{ k: 'shop' }, { k: 'office' }, { k: 'craft' }],
}

// ---------- helper HTTP GET JSON ----------
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
    req.setTimeout(timeoutMs || 9000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.on('error', reject)
    req.end()
  })
}

// ================= GEOAPIFY =================
async function searchGeoapify(key, city, category, cap) {
  // 1) Géocoder la ville → lon/lat
  const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city + ', Suisse')}&type=city&limit=1&lang=fr&apiKey=${key}`
  const geo = await getJSON(geoUrl, 8000)
  const feat = geo.features && geo.features[0]
  if (!feat) throw new Error('Ville introuvable')
  const [lon, lat] = feat.geometry.coordinates

  // 2) Chercher les établissements dans un rayon de 12 km
  const cats = GEOAPIFY_CATS[category] || GEOAPIFY_CATS.restaurant
  const placesUrl = `https://api.geoapify.com/v2/places?categories=${cats}&filter=circle:${lon},${lat},12000&bias=proximity:${lon},${lat}&limit=${cap}&lang=fr&apiKey=${key}`
  const data = await getJSON(placesUrl, 9000)

  return (data.features || []).map(f => {
    const p = f.properties || {}
    const addr = [p.housenumber && p.street ? p.housenumber + ' ' + p.street : p.street, p.postcode, p.city].filter(Boolean).join(', ')
    return {
      establishment: p.name || (p.datasource && p.datasource.raw && (p.datasource.raw.name || p.datasource.raw['name:fr'] || p.datasource.raw.brand || p.datasource.raw.operator)) || '',
      website: p.website || '',
      phone: p.phone || (p.datasource && p.datasource.raw && (p.datasource.raw.phone || p.datasource.raw['contact:phone'])) || '',
      email: p.email || '',
      city: p.city || '',
      domain: (p.categories || []).find(c => c.indexOf('.') > -1) || (p.categories || [])[0] || '',
      notes: addr || '',
      status: 'to_call',
    }
  }).filter(x => x.establishment)
}

// ================= OVERPASS (fallback) =================
function buildFilters(defs) {
  return defs.map(d => {
    if (!d.v || !d.v.length) return `nwr["${d.k}"](area.a);`
    return `nwr["${d.k}"~"^(${d.v.join('|')})$"](area.a);`
  }).join('\n  ')
}
function overpassQuery(city, defs, limit) {
  return `[out:json][timeout:8];
area["name"~"^${city}$",i]["boundary"="administrative"]["admin_level"~"^(8|7|6)$"]->.a;
(
  ${buildFilters(defs)}
);
out center ${limit * 4};`
}
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
]
function postFollow(urlStr, data, hops) {
  return new Promise((resolve, reject) => {
    if (hops > 3) return reject(new Error('Trop de redirections'))
    const u = new URL(urlStr)
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'AlpiniaProspect/1.0', 'Accept': 'application/json',
      },
    }, (r) => {
      if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location) {
        r.resume()
        return resolve(postFollow(new URL(r.headers.location, urlStr).toString(), data, hops + 1))
      }
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        if (r.statusCode !== 200) return reject(new Error('HTTP ' + r.statusCode))
        try { resolve(JSON.parse(out)) } catch (e) { reject(new Error('Réponse illisible')) }
      })
    })
    req.setTimeout(9000, () => { req.destroy(); reject(new Error('Timeout')) })
    req.on('error', reject)
    req.write(data); req.end()
  })
}
function overpassFallback(query) {
  const attempts = OVERPASS_ENDPOINTS.map(url => postFollow(url, 'data=' + encodeURIComponent(query), 0))
  return new Promise((resolve, reject) => {
    let pending = attempts.length, lastErr = null
    attempts.forEach(p => p.then(resolve).catch(e => { lastErr = e; if (--pending === 0) reject(lastErr) }))
  })
}
function parseOverpass(el) {
  const t = el.tags || {}
  const name = t.name || t['name:fr'] || t.brand
  if (!name) return null
  const addr = [t['addr:housenumber'] && t['addr:street'] ? t['addr:housenumber'] + ' ' + t['addr:street'] : t['addr:street'], t['addr:postcode'], t['addr:city']].filter(Boolean).join(', ')
  return {
    establishment: name,
    website: t.website || t['contact:website'] || '',
    phone: t.phone || t['contact:phone'] || t['contact:mobile'] || '',
    email: t.email || t['contact:email'] || '',
    city: t['addr:city'] || '',
    domain: t.amenity || t.shop || t.tourism || t.leisure || t.office || t.healthcare || t.craft || '',
    notes: addr || '', status: 'to_call',
  }
}

// ================= HANDLER =================
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { city, category, limit = 30 } = req.body || {}
  if (!city) return res.status(400).json({ error: 'Indique une ville.' })

  const cap = Math.min(Math.max(parseInt(limit) || 30, 1), 100)
  const cleanCity = city.trim().replace(/["\\]/g, '')
  const geoKey = process.env.GEOAPIFY_KEY || process.env.GEOAPIFY_API_KEY

  try {
    let elements
    if (geoKey) {
      elements = await searchGeoapify(geoKey, cleanCity, category, cap)
    } else {
      const defs = OSM_CATEGORIES[category] || OSM_CATEGORIES.restaurant
      const data = await overpassFallback(overpassQuery(cleanCity, defs, cap))
      elements = (data.elements || []).map(parseOverpass).filter(Boolean)
    }

    // dédoublonnage
    const seen = new Set()
    elements = elements.filter(p => {
      const k = p.establishment.toLowerCase().trim()
      if (seen.has(k)) return false
      seen.add(k); return true
    })
    // tri : téléphone/site d'abord (mais on garde TOUT)
    elements.sort((a, b) => ((b.phone ? 2 : 0) + (b.website ? 1 : 0)) - ((a.phone ? 2 : 0) + (a.website ? 1 : 0)))
    elements = elements.slice(0, cap)

    if (!elements.length) {
      return res.status(200).json({ results: [], total: 0, hint: 'Aucun résultat. Vérifie l\'orthographe de la ville ou essaie un autre secteur.' })
    }
    return res.status(200).json({ results: elements, total: elements.length, source: geoKey ? 'geoapify' : 'overpass' })
  } catch (e) {
    return res.status(200).json({ error: 'Recherche indisponible (' + (e.message || 'erreur') + '). Réessaie dans quelques secondes.' })
  }
}
