export const AUTOSEND_SMTP = {
  host: 'smtp.autosend.com',
  port: 587,
  user: 'autosend',
} as const

export const EMAIL_FROM = {
  email: 'hello@buildsaas.dev',
  name: 'BuildSAAS',
} as const

export function getAutosendSmtpKey(): string | null {
  return process.env.AUTOSEND_SMTP_KEY?.trim() || null
}

export function getAutosendApiKey(): string | null {
  return process.env.AUTOSEND_API_KEY?.trim() || null
}

export function isAutosendSmtpConfigured(): boolean {
  return Boolean(getAutosendSmtpKey())
}

export function getEmailAppUrl(): string {
  return (process.env.APP_URL ?? process.env.VITE_APP_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  )
}
