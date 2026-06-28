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
  isFormValid: boolean
  isGenerating: boolean
  isSaving: boolean
  onGeneratePdf: () => void
  onSaveDocument: () => void
}

export function GridToolbar({
  rowCount,
  isFormValid,
  isGenerating,
  isSaving,
  onGeneratePdf,
  onSaveDocument,
}: GridToolbarProps) {
  const generateDisabled = !isFormValid || isGenerating || isSaving

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{rowCount} rows</Badge>

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
                Generate & Sign PDF
              </Button>
            </span>
          </TooltipTrigger>
          {!isFormValid ? (
            <TooltipContent>
              Complete the ATO taxpayer details before generating
            </TooltipContent>
          ) : null}
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
