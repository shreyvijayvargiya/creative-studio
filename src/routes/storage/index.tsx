import { createFileRoute, Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { ExternalLink, HardDrive } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { listDocuments } from '#/lib/server/list-documents'
import type { DocumentListItem } from '#/types'

export const Route = createFileRoute('/storage/')({
  component: StoragePage,
})

function StoragePage() {
  const listDocumentsFn = useServerFn(listDocuments)
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void listDocumentsFn()
      .then((docs) => {
        setDocuments(docs.filter((doc) => doc.kind === 'pdf'))
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Failed to load storage'
        toast.error(message)
      })
      .finally(() => setIsLoading(false))
  }, [listDocumentsFn])

  const driveDocuments = documents.filter((doc) => doc.driveUrl)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Storage</h1>
        <p className="text-sm text-muted-foreground">
          Signed PDFs linked to your connected Google Drive account
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HardDrive className="size-5" />
            Google Drive
          </CardTitle>
          <CardDescription>
            When Google Drive is connected in{' '}
            <Link to="/settings" className="text-primary underline">
              Settings
            </Link>
            , signed PDFs are also saved to a &ldquo;Finance CRM&rdquo; folder in
            your Drive. All PDFs remain in app storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : driveDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No signed PDFs in Google Drive yet. Connect Google Drive in{' '}
              <Link to="/settings" className="text-primary underline">
                Settings
              </Link>{' '}
              and sign a tax return from the{' '}
              <Link to="/grid" className="text-primary underline">
                Budget Planner
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {driveDocuments.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleString('en-AU')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Google Drive</Badge>
                    {doc.driveUrl ? (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={doc.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="size-4" />
                          Open
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
