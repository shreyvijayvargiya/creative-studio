import { useCallback, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'

import { BudgetGrid } from '#/components/grid/BudgetGrid'
import {
  GridToolbar,
  createEmptyRow,
  DEFAULT_BUDGET_ROWS,
} from '#/components/grid/GridToolbar'
import { PDFViewer } from '#/components/pdf/PDFViewer'
import { SignaturePad } from '#/components/signature/SignaturePad'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { LabeledSeparator, Separator } from '#/components/ui/separator'
import { PageHeader } from '#/components/ui/page-header'
import { generatePdf } from '#/lib/server/generate-pdf'
import { viewPdf } from '#/lib/server/view-pdf'
import type { BudgetRow } from '#/types'

export const Route = createFileRoute('/grid/')({
  component: GridPage,
})

function GridPage() {
  const generatePdfFn = useServerFn(generatePdf)
  const viewPdfFn = useServerFn(viewPdf)

  const [gridData, setGridData] = useState<BudgetRow[]>(DEFAULT_BUDGET_ROWS)
  const [signature, setSignature] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [pin, setPin] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAddRow = useCallback(() => {
    setGridData((current) => [...current, createEmptyRow()])
  }, [])

  const handleClearAll = useCallback(() => {
    setGridData(DEFAULT_BUDGET_ROWS)
    setPdfUrl('')
    setPin('')
  }, [])

  const handleGeneratePdf = useCallback(async () => {
    if (!signature) return

    setIsGenerating(true)

    try {
      const { filename, pin: generatedPin } = await generatePdfFn({
        data: { rows: gridData, signature },
      })

      const { url } = await viewPdfFn({
        data: { filename, pin: generatedPin },
      })

      setPdfUrl(url)
      setPin(generatedPin)
      toast.success('PDF generated successfully')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate PDF'
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }, [generatePdfFn, gridData, signature, viewPdfFn])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <PageHeader
        title="Budget Planner"
        description="Phase 1 — Document Module"
      />

      <Separator />

      <GridToolbar
        rowCount={gridData.length}
        hasSignature={signature.length > 0}
        isGenerating={isGenerating}
        onAddRow={handleAddRow}
        onClearAll={handleClearAll}
        onGeneratePdf={handleGeneratePdf}
      />

      <BudgetGrid data={gridData} onDataChange={setGridData} />

      <LabeledSeparator label="Signature" />

      <SignaturePad onSave={setSignature} />

      <LabeledSeparator label="Generated Document" />

      {pdfUrl && pin ? (
        <Alert>
          <AlertDescription>
            Your document PIN: <strong>{pin}</strong> — share this to give view
            access
          </AlertDescription>
        </Alert>
      ) : null}

      {pdfUrl ? <PDFViewer url={pdfUrl} /> : null}
    </main>
  )
}
