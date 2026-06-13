const KEY_STORAGE = 'anthropic_api_key'

export function getAnthropicKey() {
  return localStorage.getItem(KEY_STORAGE) || import.meta.env.VITE_ANTHROPIC_API_KEY || ''
}

export function setAnthropicKey(key) {
  localStorage.setItem(KEY_STORAGE, key)
}

export function hasAnthropicKey() {
  return !!getAnthropicKey()
}

export async function askClaude(messages, systemPrompt = '') {
  const apiKey = getAnthropicKey()
  if (!apiKey) throw new Error('NO_KEY')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || 'API error')
  }

  const data = await res.json()
  return data.content[0].text
}
