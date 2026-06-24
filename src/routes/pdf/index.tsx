import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Eye, FileText, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { parseShareFilename } from '#/lib/pdf/share'

export const Route = createFileRoute('/pdf/')({
  component: PdfHubPage,
})

function PdfHubPage() {
  const navigate = useNavigate()
  const [shareInput, setShareInput] = useState('')

  const handleOpenShareLink = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const filename = parseShareFilename(shareInput)

    if (!filename) {
      toast.error('Enter a valid share link or document filename')
      return
    }

    void navigate({
      to: '/pdf/view/$filename',
      params: { filename },
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">PDF Viewer</h1>
        <p className="text-sm text-muted-foreground">
          In-browser PDF.js viewer for generated documents — view only, no
          download
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="size-5 text-muted-foreground" />
            Open a shared document
          </CardTitle>
          <CardDescription>
            Paste the share link you received, or enter the document filename.
            You will be asked for the 4-digit secret PIN before viewing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleOpenShareLink}>
            <div className="space-y-2">
              <Label htmlFor="share-link">Share link or filename</Label>
              <Input
                id="share-link"
                placeholder="https://…/pdf/view/abc.pdf or abc.pdf"
                value={shareInput}
                onChange={(event) => setShareInput(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="gap-2">
              Continue to PIN screen
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <Alert>
            <ShieldCheck className="size-4" />
            <AlertDescription>
              PDFs are stored in a private Supabase bucket. Viewing requires a
              valid PIN; the app issues a temporary signed URL that expires after
              a few minutes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Viewer features</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>PDF.js canvas rendering inside the app (not a browser download)</li>
            <li>Page navigation and zoom controls</li>
            <li>Text selection, right-click, and save shortcuts disabled</li>
            <li>Generated PDFs open from Documents without leaving the app</li>
            <li>External shares still require the PIN at the secure view link</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">How sharing works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            1. Generate a PDF from the{' '}
            <Link to="/grid" className="font-medium text-foreground underline">
              Budget Planner
            </Link>
            .
          </p>
          <p>2. Copy the share link and 4-digit PIN from the document screen.</p>
          <p>3. Send both to the recipient (ideally via separate channels).</p>
          <p>
            4. They open{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              /pdf/view/filename.pdf
            </code>{' '}
            and enter the PIN to view.
          </p>
          <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/50 p-4">
            <FileText className="size-5 shrink-0" />
            <span>
              Manage generated PDFs and copy share details from{' '}
              <Link
                to="/documents"
                className="font-medium text-foreground underline"
              >
                Documents
              </Link>
              .
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
