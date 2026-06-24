import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { SharePdfPanel } from '#/components/pdf/share-pdf-panel'

interface SharePdfDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storagePath: string
  sharePin: string
  documentName?: string
}

export function SharePdfDialog({
  open,
  onOpenChange,
  storagePath,
  sharePin,
  documentName,
}: SharePdfDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pr-8">
          <DialogTitle>Share PDF securely</DialogTitle>
          <DialogDescription>
            Send the link and PIN separately. The recipient can view the document
            but cannot access the file without both.
          </DialogDescription>
        </DialogHeader>

        <SharePdfPanel
          className="min-w-0"
          storagePath={storagePath}
          sharePin={sharePin}
          documentName={documentName}
        />
      </DialogContent>
    </Dialog>
  )
}
