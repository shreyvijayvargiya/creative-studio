import type { PayPalEnvironment } from '#/lib/paypal/config'

export function getPublicPayPalClientId(): string | undefined {
  const value = import.meta.env.VITE_PAYPAL_CLIENT_ID?.trim()
  return value || undefined
}

export function getPublicPayPalEnvironment(): PayPalEnvironment {
  const value = import.meta.env.VITE_PAYPAL_ENVIRONMENT?.trim().toLowerCase()
  if (value === 'production' || value === 'live') {
    return 'production'
  }
  return 'sandbox'
}

export function isPayPalClientConfigured(): boolean {
  return Boolean(getPublicPayPalClientId())
}
