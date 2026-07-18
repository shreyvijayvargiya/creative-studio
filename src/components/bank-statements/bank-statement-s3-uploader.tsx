import { useUploadFile } from '@better-upload/client'
import { toast } from 'sonner'

import { UploadButton } from '#/components/ui/upload-button'

interface BankStatementS3UploaderProps {
  disabled?: boolean
  onUploaded: (payload: { objectKey: string; fileName: string }) => void
}

/**
 * Better Upload → AWS S3 for bank statement PDFs.
 * Does not touch the AI chatbot; only accounting file storage.
 */
export function BankStatementS3Uploader({
  disabled,
  onUploaded,
}: BankStatementS3UploaderProps) {
  const { control, isPending } = useUploadFile({
    route: 'bank-statements',
    api: '/api/upload',
    onUploadComplete: ({ file, metadata }) => {
      const objectKey =
        (metadata?.objectKey as string | undefined) ?? file.objectInfo.key
      const fileName =
        (metadata?.fileName as string | undefined) ?? file.name

      if (!objectKey) {
        toast.error('Upload succeeded but S3 key was missing')
        return
      }

      onUploaded({ objectKey, fileName })
    },
    onError: (error) => {
      const message = error.message || 'S3 upload failed'
      if (
        message.includes('Failed to obtain pre-signed URLs') ||
        message.includes('pre-signed')
      ) {
        toast.error(
          'S3 upload failed — check AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET in .env, then restart the server.',
        )
        return
      }
      toast.error(message)
    },
  })

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
        <UploadButton
          control={control}
          accept="application/pdf,.pdf"
          label="Upload bank statement PDF"
        />
      </div>
      {isPending ? (
        <span className="text-sm text-muted-foreground">Uploading to S3…</span>
      ) : (
        <span className="text-sm text-muted-foreground">
          Files go to AWS S3; metadata stays in Supabase
        </span>
      )}
    </div>
  )
}
