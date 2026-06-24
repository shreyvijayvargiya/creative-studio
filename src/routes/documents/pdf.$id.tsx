import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { DocumentPdfPreview } from '#/components/pdf/document-pdf-preview'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/documents/pdf/$id')({
  component: DocumentPdfPreviewPage,
})

function DocumentPdfPreviewPage() {
  const { id } = Route.useParams()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button asChild variant="ghost" className="w-fit gap-2 px-0">
        <Link to="/documents">
          <ArrowLeft className="size-4" />
          Back to Documents
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">PDF Viewer</h1>
        <p className="text-sm text-muted-foreground">
          In-browser preview powered by PDF.js — view only, no download
        </p>
      </div>

      <DocumentPdfPreview documentId={id} />
    </div>
  )
}
