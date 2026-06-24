import { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'

import { useAuth } from '#/components/auth/auth-provider'
import { logAuthDebug, logAuthError } from '#/lib/auth/log-auth-error'
import { exchangeOAuthCode } from '#/lib/server/exchange-oauth-code'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const { syncSessionAfterOAuth } = useAuth()
  const exchangeOAuthCodeFn = useServerFn(exchangeOAuthCode)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) {
      return
    }

    hasStarted.current = true

    const completeSignIn = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorDescription = params.get('error_description')

      if (errorDescription) {
        logAuthError('oauth-callback', errorDescription, {
          search: window.location.search,
        })
        toast.error(errorDescription)
        await navigate({ to: '/', replace: true })
        return
      }

      if (!code) {
        logAuthError('oauth-callback', 'No authorization code received', {
          search: window.location.search,
        })
        toast.error('No authorization code received.')
        await navigate({ to: '/', replace: true })
        return
      }

      logAuthDebug('oauth-callback', 'Exchanging OAuth code', {
        codePrefix: `${code.slice(0, 8)}...`,
        origin: window.location.origin,
      })

      const result = await exchangeOAuthCodeFn({ data: { code } })

      if (!result.ok) {
        logAuthError('oauth-callback', result.error, {
          codePrefix: `${code.slice(0, 8)}...`,
          result,
        })
        toast.error(result.error)
        await navigate({ to: '/', replace: true })
        return
      }

      logAuthDebug('oauth-callback', 'OAuth exchange succeeded')

      await syncSessionAfterOAuth(result.user)

      window.history.replaceState({}, document.title, window.location.pathname)
      toast.success('Signed in successfully')
      await navigate({ to: '/settings', replace: true })
    }

    void completeSignIn()
  }, [exchangeOAuthCodeFn, navigate, syncSessionAfterOAuth])

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  )
}
