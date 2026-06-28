type GoogleDriveLogContext =
  | 'connect-start'
  | 'connect-callback'
  | 'connect-complete'
  | 'status'
  | 'disconnect'

function normalizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const extra = error as Error & {
      data?: unknown
      cause?: unknown
    }

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      data: extra.data,
      cause: extra.cause,
    }
  }

  if (typeof error === 'object' && error !== null) {
    return { ...(error as Record<string, unknown>) }
  }

  return { raw: error }
}

export function logGoogleDriveError(
  context: GoogleDriveLogContext,
  error: unknown,
  meta?: Record<string, unknown>,
): void {
  console.error(`[google-drive][${context}]`, normalizeError(error), meta ?? {})
}

export function logGoogleDriveDebug(
  context: GoogleDriveLogContext,
  message: string,
  meta?: Record<string, unknown>,
): void {
  console.info(`[google-drive][${context}]`, message, meta ?? {})
}
