type AuthLogContext =
  | 'sign-in-email'
  | 'sign-up-email'
  | 'sign-in-google'
  | 'sign-up-google'
  | 'oauth-callback'
  | 'oauth-exchange-server'
  | 'session-init'
  | 'profile-load'

export function logAuthError(
  context: AuthLogContext,
  error: unknown,
  meta?: Record<string, unknown>,
): void {
  const message = error instanceof Error ? error.message : String(error)
  const details =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { raw: error }

  console.error(`[auth][${context}]`, message, { ...details, ...meta })
}

export function logAuthDebug(
  context: AuthLogContext,
  message: string,
  meta?: Record<string, unknown>,
): void {
  console.info(`[auth][${context}]`, message, meta ?? {})
}
