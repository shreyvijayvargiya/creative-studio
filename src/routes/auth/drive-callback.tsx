import { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'

import { completeGoogleDriveConnect } from '#/lib/server/google-drive-complete-connect'
import {
  logGoogleDriveDebug,
  logGoogleDriveError,
} from '#/lib/google-drive/log-google-drive-error'

export const Route = createFileRoute('/auth/drive-callback')({
  component: DriveCallbackPage,
})

function DriveCallbackPage() {
  const navigate = useNavigate()
  const completeConnectFn = useServerFn(completeGoogleDriveConnect)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) {
      return
    }

    hasStarted.current = true

    const completeConnection = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      const error = params.get('error')
      const errorDescription = params.get('error_description')

      logGoogleDriveDebug('connect-callback', 'Received Google redirect', {
        hasCode: Boolean(code),
        hasState: Boolean(state),
        error,
        errorDescription,
        origin: window.location.origin,
        pathname: window.location.pathname,
      })

      if (error || errorDescription) {
        logGoogleDriveError('connect-callback', errorDescription ?? error, {
          error,
          errorDescription,
          search: window.location.search,
        })
        toast.error(errorDescription ?? error ?? 'Google Drive authorization failed')
        await navigate({ to: '/settings', replace: true })
        return
      }

      if (!code || !state) {
        logGoogleDriveError('connect-callback', 'Missing code or state', {
          search: window.location.search,
        })
        toast.error('Missing Google Drive authorization response.')
        await navigate({ to: '/settings', replace: true })
        return
      }

      try {
        const result = await completeConnectFn({ data: { code, state } })

        logGoogleDriveDebug('connect-complete', 'Drive connection saved', {
          googleEmail: result.googleEmail,
        })

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        )

        toast.success(
          result.googleEmail
            ? `Google Drive connected (${result.googleEmail})`
            : 'Google Drive connected',
        )
      } catch (error) {
        logGoogleDriveError('connect-complete', error, {
          origin: window.location.origin,
          redirectUri: `${window.location.origin}/auth/drive-callback`,
        })

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to connect Google Drive'
        toast.error(message)
      }

      await navigate({ to: '/settings', replace: true })
    }

    void completeConnection()
  }, [completeConnectFn, navigate])

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">
        Connecting Google Drive...
      </p>
    </div>
  )
}
