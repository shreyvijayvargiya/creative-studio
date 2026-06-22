import { Link, createFileRoute } from '@tanstack/react-router'
import { Eye, FileText } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export const Route = createFileRoute('/pdf/')({
  component: PdfHubPage,
})

function PdfHubPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">PDF Viewer</h1>
        <p className="text-sm text-muted-foreground">
          Access shared documents with a PIN-protected view link
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="size-5 text-muted-foreground" />
            View a shared document
          </CardTitle>
          <CardDescription>
            Open a document using the share link provided by the document owner.
            You will be prompted to enter the 4-digit PIN before viewing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Share links follow the format:{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              /pdf/view/filename.pdf
            </code>
          </p>
          <p>
            Generate new documents from the{' '}
            <Link to="/grid" className="font-medium text-foreground underline">
              Budget Planner
            </Link>{' '}
            or browse existing files in{' '}
            <Link
              to="/documents"
              className="font-medium text-foreground underline"
            >
              Documents
            </Link>
            .
          </p>
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/50 p-4 text-muted-foreground">
            <FileText className="size-5 shrink-0" />
            <span>
              No shared document URL loaded. Use a direct share link to open a
              PDF.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
