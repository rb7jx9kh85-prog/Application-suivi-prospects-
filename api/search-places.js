const https = require('https')

const OSM_CATEGORIES = {
  restaurant: ['amenity=restaurant', 'amenity=fast_food', 'amenity=cafe', 'amenity=bar', 'amenity=pub', 'amenity=food_court'],
  hotel: ['tourism=hotel', 'tourism=motel', 'tourism=guest_house', 'tourism=hostel', 'tourism=chalet'],
  commerce: ['shop=clothes', 'shop=shoes', 'shop=jewelry', 'shop=boutique', 'shop=gift', 'shop=florist'],
  beauty: ['shop=hairdresser', 'shop=beauty', 'shop=massage', 'shop=cosmetics', 'shop=nail_salon'],
  sante: ['amenity=clinic', 'amenity=dentist', 'amenity=pharmacy', 'healthcare=doctor', 'healthcare=physiotherapist'],
  fitness: ['leisure=fitness_centre', 'leisure=sports_centre', 'leisure=yoga', 'shop=sports'],
  immobilier: ['office=estate_agent'],
  auto: ['shop=car', 'shop=car_repair', 'shop=car_dealer'],
  it: ['office=it', 'shop=computer', 'office=consulting'],
  autre: ['shop=*', 'office=*', 'amenity=*'],
}

function overpassQuery(city, tags, radius, limit) {
  const filters = tags.map(t => {
    const [k, v] = t.split('=')
    return v === '*'
      ? `node["${k}"](area.a);way["${k}"](area.a);`
      : `node["${k}"="${v}"](area.a);way["${k}"="${v}"](area.a);`
  }).join('')

  return `[out:json][timeout:30];
area["name"~"${city}",i]["boundary"="administrative"]->.a;
(${filters});
out center ${limit * 3};`
}

function callOverpass(query) {
  return new Promise((resolve, reject) => {
    const data = 'data=' + encodeURIComponent(query)
    const req = https.request({
      hostname: 'overpass-api.de',
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'AlpiniaProspect/1.0',
      },
    }, (r) => {
      let out = ''
      r.on('data', c => { out += c })
      r.on('end', () => {
        try { resolve(JSON.parse(out)) }
        catch (e) { reject(new Error('Réponse Overpass illisible')) }
      })
    })
    req.setTimeout(28000, () => { req.destroy(); reject(new Error('Timeout Overpass (28s)')) })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

function parseElement(el) {
  const t = el.tags || {}
  const name = t.name || t['name:fr'] || t.brand || null
  if (!name) return null

  const lat = el.lat || el.center?.lat
  const lon = el.lon || el.center?.lon

  const address = [
    t['addr:housenumber'] && t['addr:street'] ? t['addr:housenumber'] + ' ' + t['addr:street'] : t['addr:street'] || null,
    t['addr:postcode'] || null,
    t['addr:city'] || null,
  ].filter(Boolean).join(', ')

  const domain = t.amenity || t.shop || t.tourism || t.leisure || t.office || t.healthcare || ''

  return {
    establishment: name,
    website: t.website || t['contact:website'] || '',
    phone: t.phone || t['contact:phone'] || t['contact:mobile'] || '',
    city: t['addr:city'] || '',
    domain: domain,
    notes: address || '',
    status: 'to_call',
    _lat: lat,
    _lon: lon,
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { city, category, limit = 30 } = req.body || {}
  if (!city) return res.status(400).json({ error: 'city requis' })

  const cap = Math.min(Math.max(parseInt(limit) || 30, 1), 100)
  const tags = OSM_CATEGORIES[category] || OSM_CATEGORIES.restaurant
  const query = overpassQuery(city.trim(), tags, 10000, cap)

  try {
    const data = await callOverpass(query)
    const elements = (data.elements || [])
      .map(parseElement)
      .filter(Boolean)
      .filter((p, i, arr) => arr.findIndex(x => x.establishment === p.establishment) === i) // dedupe
      .slice(0, cap)

    return res.status(200).json({ results: elements, total: elements.length })
  } catch (e) {
    return res.status(200).json({ error: e.message || 'Erreur Overpass' })
  }
}
