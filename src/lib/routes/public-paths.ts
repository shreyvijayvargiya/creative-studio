/** Public marketing routes — no app sidebar shell */
export const PUBLIC_PATHS = [
  '/',
  '/features',
  '/pricing',
  '/how-it-works',
  '/about',
] as const

/** App routes that must work without an existing session */
export const AUTH_EXEMPT_PATHS = [
  '/auth/callback',
  '/auth/drive-callback',
] as const

export type PublicPath = (typeof PUBLIC_PATHS)[number]

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)),
  )
}

/** PIN-shared PDF links — app shell, no account required */
export function isAuthExemptRoute(pathname: string): boolean {
  if (AUTH_EXEMPT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return true
  }

  return pathname.startsWith('/pdf/view/')
}

export function requiresAuth(pathname: string): boolean {
  return !isPublicRoute(pathname) && !isAuthExemptRoute(pathname)
}
