import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

import { DocumentPdfPreview } from '#/components/pdf/document-pdf-preview'
import { SharePdfPanel } from '#/components/pdf/share-pdf-panel'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { getDocument } from '#/lib/server/list-documents'

export const Route = createFileRoute('/documents/pdf/$id')({
  validateSearch: (search: Record<string, unknown>) => ({
    generated: search.generated === true || search.generated === 'true',
  }),
  component: DocumentPdfPage,
})

function DocumentPdfPage() {
  const { id } = Route.useParams()
  const { generated } = Route.useSearch()
  const getDocumentFn = useServerFn(getDocument)
  const [name, setName] = useState('')
  const [storagePath, setStoragePath] = useState('')
  const [sharePin, setSharePin] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [driveUrl, setDriveUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void getDocumentFn({ data: { id } })
      .then((doc) => {
        if (doc.kind !== 'pdf') {
          throw new Error('This document is not a generated PDF')
        }

        setName(doc.name)
        setStoragePath(doc.storagePath)
        setSharePin(doc.sharePin)
        setCreatedAt(doc.createdAt)
        setDriveUrl(doc.driveUrl ?? null)
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Failed to load document'
        toast.error(message)
      })
      .finally(() => setIsLoading(false))
  }, [getDocumentFn, id])

  useEffect(() => {
    if (generated && !isLoading && name) {
      toast.success('PDF generated — share link and PIN are ready')
    }
  }, [generated, isLoading, name])

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading document...
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/documents">Documents</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[240px] truncate">
              {name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button asChild variant="ghost" className="w-fit gap-2 px-0">
        <Link to="/documents">
          <ArrowLeft className="size-4" />
          Back to Documents
        </Link>
      </Button>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="size-5" />
            Document Ready
          </CardTitle>
          <CardDescription>
            {name}
            {createdAt
              ? ` · ${new Date(createdAt).toLocaleString('en-AU')}`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SharePdfPanel
            storagePath={storagePath}
            sharePin={sharePin}
            documentName={name}
          />

          {driveUrl ? (
            <Button asChild variant="outline" className="w-fit gap-2">
              <a href={driveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                Open in Google Drive
              </a>
            </Button>
          ) : null}

          <Separator />

          <DocumentPdfPreview documentId={id} title={name} />
        </CardContent>
      </Card>
    </div>
  )
}
