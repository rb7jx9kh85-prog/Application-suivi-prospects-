// Backend IA — supporte OpenAI (prioritaire) ou Anthropic en secours.
// Configure UNE de ces variables d'environnement sur Netlify :
//   OPENAI_API_KEY=sk-...        (recommandé)
//   ANTHROPIC_API_KEY=sk-ant-... (alternative)

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) }

  const openaiKey = process.env.OPENAI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!openaiKey && !anthropicKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Aucune clé configurée. Ajoutez OPENAI_API_KEY (ou ANTHROPIC_API_KEY) dans les variables d\'environnement Netlify.' }) }
  }

  try {
    const { system, messages } = JSON.parse(event.body)

    let text = ''

    if (openaiKey) {
      // ── OpenAI ──
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1500,
          messages: [
            { role: 'system', content: system },
            ...messages,
          ],
        }),
      })
      const data = await res.json()
      if (data.error) return { statusCode: 200, headers, body: JSON.stringify({ error: data.error.message }) }
      text = data.choices?.[0]?.message?.content || ''
    } else {
      // ── Anthropic (secours) ──
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          system,
          messages,
        }),
      })
      const data = await res.json()
      if (data.error) return { statusCode: 200, headers, body: JSON.stringify({ error: data.error.message }) }
      text = data.content?.[0]?.text || ''
    }

    // Format normalisé attendu par le frontend : { content: [{ text }] }
    return { statusCode: 200, headers, body: JSON.stringify({ content: [{ text }] }) }
  } catch (err) {
    return { statusCode: 200, headers, body: JSON.stringify({ error: err.message }) }
  }
}
