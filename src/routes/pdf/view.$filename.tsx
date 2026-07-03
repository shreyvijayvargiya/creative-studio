import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { KeyRound, ShieldCheck } from 'lucide-react'

import { SecurePdfViewer } from '#/components/pdf/secure-pdf-viewer'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { PageHeader } from '#/components/ui/page-header'
import { formatPin } from '#/lib/pdf/share'

export const Route = createFileRoute('/pdf/view/$filename')({
  component: PdfViewPage,
})

function PdfViewPage() {
  const { filename } = Route.useParams()

  const [pin, setPin] = useState('')
  const [verifiedPin, setVerifiedPin] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (pin.length !== 4) {
      setError('Enter the 4-digit PIN shared with you')
      return
    }

    setVerifiedPin(formatPin(pin))
  }

  const handleAccessRevoked = () => {
    setVerifiedPin(null)
    setPin('')
    setError('Access expired or PIN was rejected. Enter the PIN again.')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secure Document Viewer"
        description="PIN-protected view only. Files are served from private Supabase Storage via short-lived signed URLs."
      />

      {!verifiedPin ? (
        <div className="mx-auto max-w-md space-y-6">
          <Alert>
            <ShieldCheck className="size-4" />
            <AlertDescription>
              This PDF is not publicly accessible. You need the secret PIN that
              was shared along with this link.
            </AlertDescription>
          </Alert>

          <form className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="pin">Document PIN</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pin"
                  inputMode="numeric"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  placeholder="0000"
                  className="pl-9 font-mono tracking-widest"
                  value={pin}
                  onChange={(event) =>
                    setPin(event.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  required
                />
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={pin.length !== 4}>
              Unlock view-only access
            </Button>
          </form>
        </div>
      ) : (
        <SecurePdfViewer
          filename={filename}
          pin={verifiedPin}
          onAccessRevoked={handleAccessRevoked}
        />
      )}
    </div>
  )
}
