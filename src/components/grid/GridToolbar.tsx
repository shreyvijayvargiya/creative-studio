import { Loader2 } from 'lucide-react'

import { BudgetGrid } from '#/components/grid/BudgetGrid'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { DEFAULT_BUDGET_ROWS  } from '#/types'
import type {BudgetRow} from '#/types';

interface GridToolbarProps {
  rowCount: number
  hasSignature: boolean
  isGenerating: boolean
  onAddRow: () => void
  onClearAll: () => void
  onGeneratePdf: () => void
}

export function GridToolbar({
  rowCount,
  hasSignature,
  isGenerating,
  onAddRow,
  onClearAll,
  onGeneratePdf,
}: GridToolbarProps) {
  const generateDisabled = !hasSignature || isGenerating

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={onAddRow}>
          Add Row
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive">
              Clear All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset budget data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will restore the default budget rows and remove any custom
                entries.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onClearAll}>
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

export function createEmptyRow(): BudgetRow {
  return { category: '', amount: 0, taxRate: 0, notes: '' }
}

export { DEFAULT_BUDGET_ROWS }
