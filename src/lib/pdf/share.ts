/** Signed URL lifetime returned by Supabase Storage (seconds). */
export const PDF_SIGNED_URL_TTL_SECONDS = 300

/** Refresh the signed URL this many seconds before it expires. */
export const PDF_SIGNED_URL_REFRESH_BUFFER_SECONDS = 30

export function buildPdfSharePath(storagePath: string): string {
  return `/pdf/view/${encodeURIComponent(storagePath)}`
}

export function buildPdfShareUrl(
  storagePath: string,
  origin?: string,
): string {
  const baseOrigin =
    origin ?? (typeof window !== 'undefined' ? window.location.origin : '')

  return `${baseOrigin}${buildPdfSharePath(storagePath)}`
}

/**
 * Accepts a raw filename, path segment, or full share URL.
 */
export function parseShareFilename(input: string): string | null {
  const trimmed = input.trim()

  if (!trimmed) {
    return null
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed)
      const match = url.pathname.match(/\/pdf\/view\/(.+)$/)

      if (!match?.[1]) {
        return null
      }

      return decodeURIComponent(match[1])
    } catch {
      return null
    }
  }

  if (trimmed.startsWith('/pdf/view/')) {
    return decodeURIComponent(trimmed.replace(/^\/pdf\/view\//, ''))
  }

  return trimmed
}

export function getSignedUrlExpiryDate(
  ttlSeconds: number = PDF_SIGNED_URL_TTL_SECONDS,
): Date {
  return new Date(Date.now() + ttlSeconds * 1000)
}

export function formatPin(pin: string): string {
  return pin.padStart(4, '0').slice(0, 4)
}
