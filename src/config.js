// Safely initialize environment variables
export const ENV = {
  ANTHROPIC_KEY: (import.meta.env?.VITE_ANTHROPIC_API_KEY || '').trim() || '',
}

export function getDefaultKey(provider) {
  if (provider === 'anthropic') {
    return ENV.ANTHROPIC_KEY
  }
  return ''
}
