import { Link } from '@tanstack/react-router'
import { HardDrive, Loader2, Unplug } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import { disconnectGoogleDrive } from '#/lib/server/google-drive-disconnect'
import { getGoogleDriveConnectUrl } from '#/lib/server/google-drive-get-connect-url'
import { getGoogleDriveConnectionStatus } from '#/lib/server/google-drive-get-status'
import {
  logGoogleDriveDebug,
  logGoogleDriveError,
} from '#/lib/google-drive/log-google-drive-error'

interface DriveStatus {
  connected: boolean
  googleEmail: string | null
  connectedAt: string | null
  oauthConfigured: boolean
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function GoogleDriveConnectCard() {
  const getStatusFn = useStableServerFn(getGoogleDriveConnectionStatus)
  const getConnectUrlFn = useStableServerFn(getGoogleDriveConnectUrl)
  const disconnectFn = useStableServerFn(disconnectGoogleDrive)

  const [status, setStatus] = useState<DriveStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const hasLoadedStatusRef = useRef(false)

  const loadStatus = useCallback(async (force = false) => {
    if (!force && hasLoadedStatusRef.current) {
      return
    }

    hasLoadedStatusRef.current = true
    setIsLoading(true)

    try {
      const nextStatus = await getStatusFn()
      setStatus(nextStatus)
    } catch (error) {
      logGoogleDriveError('status', error)
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load Google Drive status'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [getStatusFn])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      const redirectOrigin = window.location.origin

      logGoogleDriveDebug('connect-start', 'Requesting Google OAuth URL', {
        redirectOrigin,
        redirectUri: `${redirectOrigin}/auth/drive-callback`,
      })

      const { url } = await getConnectUrlFn({
        data: { redirectOrigin },
      })

      window.location.assign(url)
    } catch (error) {
      logGoogleDriveError('connect-start', error, {
        redirectOrigin: window.location.origin,
        redirectUri: `${window.location.origin}/auth/drive-callback`,
      })
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to start Google Drive connection'
      toast.error(message)
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)

    try {
      await disconnectFn()
      toast.success('Google Drive disconnected')
      hasLoadedStatusRef.current = false
      await loadStatus(true)
    } catch (error) {
      logGoogleDriveError('disconnect', error)
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to disconnect Google Drive'
      toast.error(message)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="size-5" />
          Google Drive
        </CardTitle>
        <CardDescription>
          Connect your Google account to automatically save signed PDFs to a
          &ldquo;Finance CRM&rdquo; folder in your Drive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading Drive status...</p>
        ) : status?.oauthConfigured === false ? (
          <p className="text-sm text-muted-foreground">
            Google Drive OAuth is not configured on the server. Add{' '}
            <code className="text-xs">GOOGLE_CLIENT_ID</code> and{' '}
            <code className="text-xs">GOOGLE_CLIENT_SECRET</code> to your environment.
          </p>
        ) : status?.connected ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Connected</Badge>
              {status.googleEmail ? (
                <span className="text-sm text-muted-foreground">
                  {status.googleEmail}
                </span>
              ) : null}
            </div>
            {status.connectedAt ? (
              <p className="text-sm text-muted-foreground">
                Connected {formatDate(status.connectedAt)}
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">
              Signed PDFs will also be saved to your Google Drive. Copies remain
              in app storage either way.
            </p>
            <Button
              variant="outline"
              className="gap-2"
              disabled={isDisconnecting}
              onClick={() => void handleDisconnect()}
            >
              {isDisconnecting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Unplug className="size-4" />
              )}
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Drive is not connected. Signed PDFs are still saved in app storage.
              Connect Drive to get a copy in your personal Google Drive.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                className="gap-2"
                disabled={isConnecting}
                onClick={() => void handleConnect()}
              >
                {isConnecting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <HardDrive className="size-4" />
                )}
                Connect Google Drive
              </Button>
              <Button asChild variant="outline">
                <Link to="/storage">View storage</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
