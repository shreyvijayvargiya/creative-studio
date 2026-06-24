import { useCallback, useEffect, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Loader2 } from 'lucide-react'

import { PdfBrowserViewer } from '#/components/pdf/pdf-browser-viewer'
import { Alert, AlertDescription } from '#/components/ui/alert'
import {
  PDF_SIGNED_URL_REFRESH_BUFFER_SECONDS,
} from '#/lib/pdf/share'
import { previewDocumentPdf } from '#/lib/server/preview-document-pdf'

interface DocumentPdfPreviewProps {
  documentId: string
  title?: string
}

export function DocumentPdfPreview({
  documentId,
  title,
}: DocumentPdfPreviewProps) {
  const previewDocumentPdfFn = useServerFn(previewDocumentPdf)
  const [pdfUrl, setPdfUrl] = useState('')
  const [documentTitle, setDocumentTitle] = useState('Document')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSignedUrl = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) {
        setIsLoading(true)
      }

      setError(null)

      try {
        const result = await previewDocumentPdfFn({ data: { id: documentId } })
        setPdfUrl(result.url)
        setDocumentTitle(result.name)
        setExpiresAt(new Date(result.expiresAt))
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load PDF preview'

        setError(message)
        setPdfUrl('')
        setExpiresAt(null)
      } finally {
        setIsLoading(false)
      }
    },
    [documentId, previewDocumentPdfFn],
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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading PDF preview...
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

  if (!pdfUrl) {
    return null
  }

  return (
    <PdfBrowserViewer
      url={pdfUrl}
      title={title ?? documentTitle}
      onAccessError={() => void loadSignedUrl(true)}
    />
  )
}
