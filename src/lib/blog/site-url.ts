const DEFAULT_SITE_URL = 'https://finance-crm.buildsaas.dev'

export function getSiteUrl(): string {
  const fromEnv =
    import.meta.env.VITE_SITE_URL ??
    (typeof process !== 'undefined'
      ? (process.env.VITE_SITE_URL ?? process.env.APP_URL)
      : undefined)

  return (fromEnv ?? DEFAULT_SITE_URL).replace(/\/$/, '')
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${normalized}`
}
