const Anthropic = require('@anthropic-ai/sdk')

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) }

  const apiKey = process.env.CLAUDE_API
  if (!apiKey) {
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ error: 'CLAUDE_API non configurée dans les variables Netlify.' }) }
  }

  try {
    const { prospectName, website, type, city } = JSON.parse(event.body || '{}')
    if (!prospectName) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'prospectName requis.' }) }
    }

    const client = new Anthropic({ apiKey })

    const locationInfo = [type, city ? `à ${city}` : ''].filter(Boolean).join(' ')
    const websiteInfo = website ? ` Site web: ${website}.` : ''

    const prompt = `Recherche des informations sur l'établissement "${prospectName}"${locationInfo ? ` (${locationInfo})` : ''}.${websiteInfo}

Utilise des recherches web pour trouver des informations précises et à jour.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni explication :
{
  "full_address": "adresse complète avec code postal et ville",
  "phone": "numéro de téléphone direct",
  "email": "email de contact principal",
  "opening_hours": "horaires d'ouverture",
  "description": "brève description de l'établissement en 1-2 phrases",
  "google_rating": "note Google (ex: 4.3/5)",
  "employees_approx": "estimation du nombre d'employés",
  "key_decision_maker": "fonction du décidionnaire principal (patron/gérant/directeur)"
}

Si une information est introuvable, utilise null comme valeur.`

    const messages = [{ role: 'user', content: prompt }]

    let response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    })

    // Boucle agentique : Claude peut faire plusieurs recherches web
    while (response.stop_reason === 'tool_use') {
      const assistantContent = response.content
      messages.push({ role: 'assistant', content: assistantContent })

      const toolResults = assistantContent
        .filter(b => b.type === 'tool_use')
        .map(b => ({
          type: 'tool_result',
          tool_use_id: b.id,
          content: JSON.stringify(b.input || {}),
        }))

      messages.push({ role: 'user', content: toolResults })

      response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2048,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages,
      })
    }

    const finalText = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')

    // Extraire le JSON de la réponse
    const jsonMatch = finalText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ error: 'Réponse IA non parseable.', raw: finalText.slice(0, 500) }) }
    }

    const enrichedData = JSON.parse(jsonMatch[0])
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ enrichedData }) }

  } catch (err) {
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ error: err.message || 'Erreur serveur' }) }
  }
}
