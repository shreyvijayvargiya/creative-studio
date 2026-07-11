function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing ${name} environment variable.`)
  }
  return value
}

export function getStripeSecretKey(): string {
  return requireEnv('STRIPE_SECRET_KEY')
}

export function getStripeWebhookSecret(): string {
  return requireEnv('STRIPE_WEBHOOK_SECRET')
}

export function getAppUrl(): string {
  return (process.env.APP_URL ?? process.env.VITE_APP_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  )
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim())
}
