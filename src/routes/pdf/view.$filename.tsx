import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'

import { PDFViewer } from '#/components/pdf/PDFViewer'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { PageHeader } from '#/components/ui/page-header'
import { viewPdf } from '#/lib/server/view-pdf'

export const Route = createFileRoute('/pdf/view/$filename')({
  component: PdfViewPage,
})

function PdfViewPage() {
  const { filename } = Route.useParams()
  const viewPdfFn = useServerFn(viewPdf)

  const [pin, setPin] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { url } = await viewPdfFn({ data: { filename, pin } })
      setPdfUrl(url)
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Unable to view PDF'

      if (message.toLowerCase().includes('incorrect pin')) {
        setError('Incorrect PIN')
      } else {
        setError(message)
      }
      setPdfUrl('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6">
      <PageHeader
        title="Document Viewer"
        description="Enter the PIN shared with you to view this document."
      />

      {!pdfUrl ? (
        <form className="max-w-sm space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="pin">Document PIN</Label>
            <Input
              id="pin"
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]{4}"
              placeholder="0000"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting || pin.length !== 4}>
            View Document
          </Button>
        </form>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {pdfUrl ? <PDFViewer url={pdfUrl} /> : null}
    </main>
  )
}
