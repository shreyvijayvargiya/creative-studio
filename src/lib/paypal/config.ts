export type PayPalEnvironment = 'sandbox' | 'production'

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing ${name} environment variable.`)
  }
  return value
}

export function getPayPalClientId(): string {
  return requireEnv('PAYPAL_CLIENT_ID')
}

export function getPayPalClientSecret(): string {
  return requireEnv('PAYPAL_CLIENT_SECRET')
}

export function getPayPalWebhookId(): string | null {
  return process.env.PAYPAL_WEBHOOK_ID?.trim() ?? null
}

export function getPayPalEnvironment(): PayPalEnvironment {
  const value = process.env.PAYPAL_ENVIRONMENT?.trim().toLowerCase()
  if (value === 'production' || value === 'live') {
    return 'production'
  }
  return 'sandbox'
}

export function getPayPalApiBaseUrl(): string {
  return getPayPalEnvironment() === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim(),
  )
}
