import { Copy, Link2, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { buildPdfShareUrl } from '#/lib/pdf/share'
import { cn } from '#/lib/utils'

interface SharePdfPanelProps {
  storagePath: string
  sharePin: string
  documentName?: string
  className?: string
}

export function SharePdfPanel({
  storagePath,
  sharePin,
  documentName,
  className,
}: SharePdfPanelProps) {
  const shareUrl = buildPdfShareUrl(storagePath)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied')
  }

  const handleCopyPin = async () => {
    await navigator.clipboard.writeText(sharePin)
    toast.success('PIN copied')
  }

  const handleCopyBoth = async () => {
    const message = [
      documentName ? `Document: ${documentName}` : 'Shared PDF document',
      `Link: ${shareUrl}`,
      `PIN: ${sharePin}`,
    ].join('\n')

    await navigator.clipboard.writeText(message)
    toast.success('Share details copied')
  }

  return (
    <div className={cn('min-w-0 w-full', className)}>
      <Alert className="overflow-hidden">
        <ShieldCheck className="size-4" />
        <AlertDescription className="break-words text-muted-foreground">
          Recipients need the <strong>share link</strong> and{' '}
          <strong>4-digit PIN</strong> to view. Access uses a short-lived signed
          URL from Supabase Storage — view only, no public bucket access.
        </AlertDescription>
      </Alert>

      <div className="mt-4 min-w-0 space-y-4">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Share link
          </p>
          <div className="flex min-w-0 items-start gap-2 overflow-hidden rounded-md border border-border bg-muted/40 px-3 py-2">
            <Link2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <code className="min-w-0 flex-1 break-all text-xs leading-relaxed text-foreground">
              {shareUrl}
            </code>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Secret PIN:</span>
          <Badge
            variant="outline"
            className="gap-1 font-mono text-lg tracking-widest"
          >
            <Lock className="size-3.5" />
            {sharePin}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => void handleCopyLink()}>
            <Link2 className="size-4" />
            Copy link
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void handleCopyPin()}
          >
            <Copy className="size-4" />
            Copy PIN
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => void handleCopyBoth()}
          >
            Copy all
          </Button>
        </div>
      </div>
    </div>
  )
}
