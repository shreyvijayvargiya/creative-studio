import { Loader2, Save } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

interface GridToolbarProps {
  rowCount: number
  hasSignature: boolean
  isGenerating: boolean
  isSaving: boolean
  onGeneratePdf: () => void
  onSaveDocument: () => void
}

export function GridToolbar({
  rowCount,
  hasSignature,
  isGenerating,
  isSaving,
  onGeneratePdf,
  onSaveDocument,
}: GridToolbarProps) {
  const generateDisabled = !hasSignature || isGenerating || isSaving

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSaving || isGenerating}
          onClick={onSaveDocument}
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          Save to Documents
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                type="button"
                disabled={generateDisabled}
                onClick={onGeneratePdf}
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : null}
                Generate PDF
              </Button>
            </span>
          </TooltipTrigger>
          {!hasSignature ? (
            <TooltipContent>
              Apply a signature before generating the PDF
            </TooltipContent>
          ) : null}
        </Tooltip>

        <Badge variant="secondary">{rowCount} rows</Badge>
      </div>
    </TooltipProvider>
  )
}
