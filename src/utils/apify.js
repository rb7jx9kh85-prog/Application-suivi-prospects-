const ACTOR_ID = 'compass~crawler-google-places'

// Token stored in localStorage (set via Settings page)
function getApifyToken() {
  return localStorage.getItem('apify_token') || ''
}

export function setApifyToken(token) {
  localStorage.setItem('apify_token', token)
}

export function hasApifyToken() {
  return !!localStorage.getItem('apify_token')
}

export async function searchGooglePlace(query) {
  const token = getApifyToken()
  if (!token) throw new Error('NO_APIFY_KEY')

  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchStringsArray: [query],
          maxCrawledPlaces: 1,
          language: 'fr',
          maxImages: 1,
        }),
      }
    )
    if (!runRes.ok) throw new Error('Failed to start run')
    const run = await runRes.json()
    const runId = run.data.id

    // Poll until finished (max 30s)
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000))
      const statusRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`
      )
      const statusData = await statusRes.json()
      if (statusData.data.status === 'SUCCEEDED') break
      if (statusData.data.status === 'FAILED') throw new Error('Run failed')
    }

    const dataRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${token}&limit=1`
    )
    const items = await dataRes.json()
    if (!items.length) return null

    const p = items[0]
    return {
      name: p.title || query,
      address: p.address || '',
      rating: p.totalScore || null,
      reviewCount: p.reviewsCount || 0,
      category: p.categories?.[0] || '',
      phone: p.phone || '',
      website: p.website || '',
      hours: p.openingHours || [],
      description: p.description || '',
      imageUrl: p.imageUrl || p.images?.[0]?.imageUrl || null,
      googleUrl: p.url || '',
    }
  } catch (e) {
    console.error('Apify error:', e)
    throw e
  }
}
