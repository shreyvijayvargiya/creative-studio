import type { User } from '@supabase/supabase-js'

import { logAuthDebug, logAuthError } from '#/lib/auth/log-auth-error'
import { getSupabaseServerClient } from '#/lib/supabase/server'

export type OAuthExchangeResult =
  | { ok: true; user: User | null }
  | { ok: false; error: string }

export async function exchangeOAuthCodeOnServer(
  code: string,
): Promise<OAuthExchangeResult> {
  const supabase = getSupabaseServerClient()

  const { data: existingSession } = await supabase.auth.getSession()

  if (existingSession.session) {
    logAuthDebug('oauth-exchange-server', 'Session already exists, skipping exchange')
    return { ok: true, user: existingSession.session.user }
  }

  logAuthDebug('oauth-exchange-server', 'Exchanging OAuth code', {
    codePrefix: `${code.slice(0, 8)}...`,
  })

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    logAuthError('oauth-exchange-server', error, {
      codePrefix: `${code.slice(0, 8)}...`,
      message: error.message,
      status: error.status,
      name: error.name,
    })
    return { ok: false, error: error.message }
  }

  // Allow deferred auth cookie writes to flush before the response completes.
  await new Promise((resolve) => setTimeout(resolve, 0))

  return { ok: true, user: data.session?.user ?? null }
}
