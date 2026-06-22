import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Skeleton } from '#/components/ui/skeleton'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  url: string
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="pdf-viewer-container pdf-viewer-no-select space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[600px] w-full max-w-3xl" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : null}

      <Document
        file={url}
        onLoadSuccess={({ numPages: totalPages }) => {
          setNumPages(totalPages)
          setIsLoading(false)
        }}
        onLoadError={(error) => {
          setLoadError(error.message)
          setIsLoading(false)
        }}
        loading={null}
        className={isLoading ? 'hidden' : 'flex flex-col items-center gap-6'}
      >
        {Array.from({ length: numPages }, (_, index) => (
          <div
            key={`page-${index + 1}`}
            onContextMenu={(event) => event.preventDefault()}
            className="overflow-hidden rounded-md border shadow-sm"
          >
            <Page pageNumber={index + 1} width={720} renderTextLayer={false} />
          </div>
        ))}
      </Document>
    </div>
  )
}
