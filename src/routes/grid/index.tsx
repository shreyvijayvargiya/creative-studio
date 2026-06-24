import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { CheckCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { BudgetGrid } from '#/components/grid/BudgetGrid'
import { GridToolbar } from '#/components/grid/GridToolbar'
import { PdfBrowserViewer } from '#/components/pdf/pdf-browser-viewer'
import { SharePdfPanel } from '#/components/pdf/share-pdf-panel'
import { SignaturePad } from '#/components/signature/SignaturePad'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { generatePdf } from '#/lib/server/generate-pdf'
import { getDocument } from '#/lib/server/list-documents'
import { saveBudgetDocument } from '#/lib/server/save-budget-document'
import { viewPdf } from '#/lib/server/view-pdf'
import { cloneDefaultBudgetRows, createEmptyRow  } from '#/types'
import type {BudgetRow} from '#/types';

export const Route = createFileRoute('/grid/')({
  validateSearch: (search) =>
    z.object({ edit: z.string().optional() }).parse(search),
  component: GridPage,
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

function GridPage() {
  const { edit: editDocumentId } = Route.useSearch()
  const generatePdfFn = useServerFn(generatePdf)
  const viewPdfFn = useServerFn(viewPdf)
  const getDocumentFn = useServerFn(getDocument)
  const saveBudgetDocumentFn = useServerFn(saveBudgetDocument)

  const [gridData, setGridData] = useState<BudgetRow[]>(cloneDefaultBudgetRows)
  const [signature, setSignature] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [pin, setPin] = useState('')
  const [filename, setFilename] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingBudget, setIsLoadingBudget] = useState(Boolean(editDocumentId))

  useEffect(() => {
    if (!editDocumentId) {
      return
    }

    setIsLoadingBudget(true)

    void getDocumentFn({ data: { id: editDocumentId } })
      .then((doc) => {
        if (doc.kind !== 'budget' || !doc.budgetData) {
          throw new Error('This document is not a saved budget')
        }

        setGridData(doc.budgetData)
        setSignature('')
        setPdfUrl('')
        setPin('')
        setFilename('')
        toast.success(`Loaded "${doc.name}" for editing`)
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Failed to load budget'
        toast.error(message)
      })
      .finally(() => setIsLoadingBudget(false))
  }, [editDocumentId, getDocumentFn])

  const amountTotal = useMemo(
    () => gridData.reduce((sum, row) => sum + row.amount, 0),
    [gridData],
  )

  const handleAddRow = useCallback(() => {
    setGridData((current) => [...current, createEmptyRow()])
  }, [])

  const handleClearAll = useCallback(() => {
    setGridData(cloneDefaultBudgetRows())
    setPdfUrl('')
    setPin('')
    setFilename('')
  }, [])

  const handleSaveDocument = useCallback(async () => {
    setIsSaving(true)

    try {
      const { name } = await saveBudgetDocumentFn({ data: { rows: gridData } })
      toast.success(`"${name}" saved to Documents`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save document'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }, [gridData, saveBudgetDocumentFn])

  const handleGeneratePdf = useCallback(async () => {
    if (!signature) return

    setIsGenerating(true)

    try {
      const { filename: generatedFilename, pin: generatedPin } =
        await generatePdfFn({
          data: { rows: gridData, signature },
        })

      const { url } = await viewPdfFn({
        data: { filename: generatedFilename, pin: generatedPin },
      })

      setFilename(generatedFilename)
      setPdfUrl(url)
      setPin(generatedPin)
      toast.success('PDF generated — share link and PIN are ready')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate PDF'
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }, [generatePdfFn, gridData, signature, viewPdfFn])

  if (isLoadingBudget) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading budget for editing...
      </p>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Budget Planner</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Budget Planner
            </h1>
            <p className="text-sm text-muted-foreground">
              Create financial summaries and generate signed PDF documents
            </p>
          </div>
        </div>

        <GridToolbar
          rowCount={gridData.length}
          hasSignature={signature.length > 0}
          isGenerating={isGenerating}
          isSaving={isSaving}
          onGeneratePdf={handleGeneratePdf}
          onSaveDocument={handleSaveDocument}
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Financial Data</CardTitle>
            <CardDescription>Click any cell to edit</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit text-sm font-medium">
            Total: {formatCurrency(amountTotal)}
          </Badge>
        </CardHeader>
        <CardContent>
          <BudgetGrid
            data={gridData}
            onDataChange={setGridData}
            onAddRow={handleAddRow}
            onClearAll={handleClearAll}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Authorised Signature</CardTitle>
          <CardDescription>
            Your signature will appear on every page of the generated PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              Once applied, your signature is embedded permanently into the PDF
            </AlertDescription>
          </Alert>
          <SignaturePad onSave={setSignature} />
        </CardContent>
      </Card>

      {pdfUrl && pin && filename ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-emerald-700 dark:text-emerald-400">
              <CheckCircle className="size-5" />
              Document Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SharePdfPanel
              storagePath={filename}
              sharePin={pin}
              documentName="Financial Summary"
            />

            <Separator />

            <PdfBrowserViewer url={pdfUrl} title="Financial Summary" />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
