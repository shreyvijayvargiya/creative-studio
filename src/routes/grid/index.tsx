import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  AtoTaxForm,
  isAtoTaxFormValid,
} from '#/components/ato/AtoTaxForm'
import { BudgetGrid } from '#/components/grid/BudgetGrid'
import { GridToolbar } from '#/components/grid/GridToolbar'
import { Badge } from '#/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { initiatePdfSigning } from '#/lib/server/initiate-pdf-signing'
import { getDocument } from '#/lib/server/list-documents'
import { saveBudgetDocument } from '#/lib/server/save-budget-document'
import {
  DEFAULT_ATO_TAXPAYER,
  cloneDefaultBudgetRows,
  createEmptyRow,
} from '#/types'
import type { AtoTaxpayerInfo, BudgetRow } from '#/types'

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
  const navigate = useNavigate()
  const initiatePdfSigningFn = useServerFn(initiatePdfSigning)
  const getDocumentFn = useServerFn(getDocument)
  const saveBudgetDocumentFn = useServerFn(saveBudgetDocument)

  const [gridData, setGridData] = useState<BudgetRow[]>(cloneDefaultBudgetRows)
  const [taxpayer, setTaxpayer] = useState<AtoTaxpayerInfo>(DEFAULT_ATO_TAXPAYER)
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

  const isFormValid = isAtoTaxFormValid(taxpayer)

  const handleAddRow = useCallback(() => {
    setGridData((current) => [...current, createEmptyRow()])
  }, [])

  const handleClearAll = useCallback(() => {
    setGridData(cloneDefaultBudgetRows())
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
    if (!isFormValid) return

    setIsGenerating(true)

    try {
      const session = await initiatePdfSigningFn({
        data: { rows: gridData, taxpayer },
      })

      await navigate({
        to: '/grid/sign/$submissionId',
        params: { submissionId: String(session.submissionId) },
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate PDF'
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }, [gridData, initiatePdfSigningFn, isFormValid, navigate, taxpayer])

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
              Enter budget data and ATO details, then generate and sign on a
              dedicated page
            </p>
          </div>
        </div>

        <GridToolbar
          rowCount={gridData.length}
          isFormValid={isFormValid}
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
          <CardTitle className="text-base">
            ATO Tax Return — Individual Information
          </CardTitle>
          <CardDescription>
            2025 Tax return for individuals (NAT 2541). These values are written
            into the generated PDF form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AtoTaxForm value={taxpayer} onChange={setTaxpayer} />
          {!isFormValid ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Fill TFN, name, and full postal address to enable PDF generation.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
