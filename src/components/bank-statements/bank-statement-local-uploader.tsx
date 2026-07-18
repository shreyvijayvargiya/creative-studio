import { useRef } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'

interface BankStatementLocalUploaderProps {
  disabled?: boolean
  isExtracting?: boolean
  onFileSelected: (file: File) => void
}

/**
 * Local PDF pick → base64 extract path (no S3).
 * Used when AWS credentials are not configured yet.
 */
export function BankStatementLocalUploader({
  disabled,
  isExtracting,
  onFileSelected,
}: BankStatementLocalUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const busy = Boolean(disabled || isExtracting)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file) return
          if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.error('Please choose a PDF bank statement')
            return
          }
          onFileSelected(file)
        }}
      />
      <Button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {isExtracting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        {isExtracting ? 'Extracting…' : 'Upload bank statement PDF'}
      </Button>
      <span className="text-sm text-muted-foreground">
        Local extract (S3 not configured)
      </span>
    </div>
  )
}
