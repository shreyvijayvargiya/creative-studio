import { useCallback, useEffect, useMemo, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import {
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const MIN_ZOOM = 0.5
const MAX_ZOOM = 2
const ZOOM_STEP = 0.1
const BASE_PAGE_WIDTH = 720

interface PdfBrowserViewerProps {
  url: string
  title?: string
  onAccessError?: () => void
  className?: string
}

export function PdfBrowserViewer({
  url,
  title = 'Document',
  onAccessError,
  className,
}: PdfBrowserViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const pageWidth = useMemo(() => Math.round(BASE_PAGE_WIDTH * zoom), [zoom])

  useEffect(() => {
    setPageNumber(1)
    setNumPages(0)
    setLoadError(null)
    setIsLoading(true)
  }, [url])

  useEffect(() => {
    const blockSaveShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', blockSaveShortcut)
    return () => window.removeEventListener('keydown', blockSaveShortcut)
  }, [])

  const goToPreviousPage = useCallback(() => {
    setPageNumber((current) => Math.max(current - 1, 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setPageNumber((current) => Math.min(current + 1, numPages || current))
  }, [numPages])

  const handlePageInput = (value: string) => {
    const parsed = Number.parseInt(value, 10)

    if (Number.isNaN(parsed)) {
      return
    }

    setPageNumber(Math.min(Math.max(parsed, 1), numPages || 1))
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div
      className={cn(
        'pdf-browser-viewer overflow-hidden rounded-lg border border-border bg-card shadow-sm',
        isFullscreen && 'fixed inset-4 z-50 flex flex-col',
        className,
      )}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <EyeOff className="size-3" />
            View only
          </Badge>
          <span className="truncate text-sm font-medium text-foreground">
            {title}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={pageNumber <= 1 || isLoading}
            onClick={goToPreviousPage}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Previous page</span>
          </Button>

          <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
            <Input
              className="h-8 w-14 px-2 text-center font-mono"
              value={pageNumber}
              onChange={(event) => handlePageInput(event.target.value)}
              disabled={isLoading || numPages === 0}
              aria-label="Current page"
            />
            <span>/ {numPages || '—'}</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={pageNumber >= numPages || isLoading || numPages === 0}
            onClick={goToNextPage}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Next page</span>
          </Button>

          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP))}
          >
            <ZoomOut className="size-4" />
            <span className="sr-only">Zoom out</span>
          </Button>

          <span className="w-12 text-center text-xs font-medium text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP))}
          >
            <ZoomIn className="size-4" />
            <span className="sr-only">Zoom in</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setIsFullscreen((current) => !current)}
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
            <span className="sr-only">Toggle fullscreen</span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'pdf-viewer-container pdf-viewer-no-select overflow-auto bg-muted/20 p-4',
          isFullscreen ? 'flex-1' : 'max-h-[80vh]',
        )}
      >
        {isLoading ? (
          <div className="mx-auto max-w-3xl space-y-3">
            <Skeleton className="h-[720px] w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : null}

        <Document
          file={url}
          onLoadSuccess={({ numPages: totalPages }) => {
            setNumPages(totalPages)
            setPageNumber(1)
            setIsLoading(false)
          }}
          onLoadError={(error) => {
            setLoadError(error.message)
            setIsLoading(false)
            onAccessError?.()
          }}
          loading={null}
          className={cn(
            'flex justify-center',
            isLoading ? 'hidden' : undefined,
          )}
        >
          <div className="overflow-hidden rounded-md border border-border bg-white shadow-sm dark:bg-zinc-900">
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>
        </Document>
      </div>

      <div className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        Rendered in-browser with PDF.js. Download, print, and text selection are
        disabled.
      </div>
    </div>
  )
}
