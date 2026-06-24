import { useCallback, useEffect, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Eye, Loader2, ShieldCheck } from 'lucide-react'

import { PdfBrowserViewer } from '#/components/pdf/pdf-browser-viewer'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import {
  PDF_SIGNED_URL_REFRESH_BUFFER_SECONDS,
  PDF_SIGNED_URL_TTL_SECONDS,
} from '#/lib/pdf/share'
import { viewPdf } from '#/lib/server/view-pdf'

interface SecurePdfViewerProps {
  filename: string
  pin: string
  onAccessRevoked?: () => void
}

function formatCountdown(expiresAt: Date): string {
  const seconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60

  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

export function SecurePdfViewer({
  filename,
  pin,
  onAccessRevoked,
}: SecurePdfViewerProps) {
  const viewPdfFn = useServerFn(viewPdf)
  const [pdfUrl, setPdfUrl] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSignedUrl = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setError(null)

      try {
        const result = await viewPdfFn({ data: { filename, pin } })
        setPdfUrl(result.url)
        setExpiresAt(new Date(result.expiresAt))
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load secure view'

        setError(message)
        setPdfUrl('')
        setExpiresAt(null)

        if (message.toLowerCase().includes('incorrect pin')) {
          onAccessRevoked?.()
        }
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [filename, onAccessRevoked, pin, viewPdfFn],
  )

  useEffect(() => {
    void loadSignedUrl()
  }, [loadSignedUrl])

  useEffect(() => {
    if (!expiresAt) {
      return
    }

    const refreshInMs = Math.max(
      expiresAt.getTime() -
        Date.now() -
        PDF_SIGNED_URL_REFRESH_BUFFER_SECONDS * 1000,
      0,
    )

    const refreshTimer = window.setTimeout(() => {
      void loadSignedUrl(true)
    }, refreshInMs)

    return () => window.clearTimeout(refreshTimer)
  }, [expiresAt, loadSignedUrl])

  useEffect(() => {
    if (!expiresAt) {
      return
    }

    const updateCountdown = () => {
      setCountdown(formatCountdown(expiresAt))
    }

    updateCountdown()
    const interval = window.setInterval(updateCountdown, 1000)

    return () => window.clearInterval(interval)
  }, [expiresAt])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Verifying PIN and opening secure view...
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Alert className="flex-1 border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          <ShieldCheck className="size-4" />
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <Eye className="size-3.5" />
            View only — served via Supabase signed URL
            {isRefreshing ? (
              <span className="inline-flex items-center gap-1 text-xs">
                <Loader2 className="size-3 animate-spin" />
                Refreshing access...
              </span>
            ) : null}
          </AlertDescription>
        </Alert>

        {expiresAt ? (
          <Badge variant="outline" className="font-mono text-xs">
            Link expires in {countdown}
          </Badge>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Signed URLs renew automatically every {PDF_SIGNED_URL_TTL_SECONDS / 60}{' '}
        minutes while this page stays open. Right-click and download are
        disabled in the viewer.
      </p>

      {pdfUrl ? (
        <PdfBrowserViewer
          url={pdfUrl}
          title="Shared document"
          onAccessError={() => void loadSignedUrl(true)}
        />
      ) : null}
    </div>
  )
}
