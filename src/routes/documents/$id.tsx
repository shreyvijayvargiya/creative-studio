import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  getCoreRowModel,
  useReactTable
  
} from '@tanstack/react-table'
import type {ColumnDef} from '@tanstack/react-table';
import { ArrowLeft, Download, Loader2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { DataTable } from '#/components/ui/data-table'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { downloadDocumentPdf } from '#/lib/server/export-budget-pdf'
import { getDocument } from '#/lib/server/list-documents'
import { downloadBase64File } from '#/lib/utils'
import { NET_INCOME_CATEGORY  } from '#/types'
import type {BudgetRow} from '#/types';

export const Route = createFileRoute('/documents/$id')({
  component: DocumentDetailPage,
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

function DocumentDetailPage() {
  const { id } = Route.useParams()
  const getDocumentFn = useServerFn(getDocument)
  const downloadDocumentPdfFn = useServerFn(downloadDocumentPdf)
  const [name, setName] = useState('')
  const [rows, setRows] = useState<BudgetRow[]>([])
  const [createdAt, setCreatedAt] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    void getDocumentFn({ data: { id } })
      .then((doc) => {
        if (doc.kind !== 'budget' || !doc.budgetData) {
          throw new Error('This document is not a saved budget')
        }
        setName(doc.name)
        setRows(doc.budgetData)
        setCreatedAt(doc.createdAt)
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Failed to load document'
        toast.error(message)
      })
      .finally(() => setIsLoading(false))
  }, [getDocumentFn, id])

  const columns = useMemo<ColumnDef<BudgetRow>[]>(
    () => [
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <span
            className={
              row.original.category === NET_INCOME_CATEGORY
                ? 'font-semibold'
                : undefined
            }
          >
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Amount (AUD)</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatCurrency(row.original.amount)}
          </div>
        ),
      },
      {
        accessorKey: 'taxRate',
        header: () => <div className="text-right">Tax Rate %</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums">{row.original.taxRate}%</div>
        ),
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => row.original.notes || '—',
      },
    ],
    [],
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  const handleDownloadPdf = async () => {
    setIsDownloading(true)

    try {
      const { pdfBase64, filename } = await downloadDocumentPdfFn({
        data: { id },
      })
      downloadBase64File(pdfBase64, filename, 'application/pdf')
      toast.success('PDF downloaded')
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to download PDF'
      toast.error(message)
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading document...
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button asChild variant="ghost" className="w-fit gap-2 px-0">
        <Link to="/documents">
          <ArrowLeft className="size-4" />
          Back to Documents
        </Link>
      </Button>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription>
              Saved budget planner snapshot
              {createdAt
                ? ` · ${new Date(createdAt).toLocaleString('en-AU')}`
                : ''}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/grid" search={{ edit: id }}>
                <Pencil className="size-4" />
                Edit budget
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleDownloadPdf()}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Download PDF
            </Button>
            <Badge variant="secondary">Budget Draft</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable table={table} columnCount={columns.length} />
        </CardContent>
      </Card>
    </div>
  )
}
