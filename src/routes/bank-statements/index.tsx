import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Save,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

import { useAuth } from '#/components/auth/auth-provider'
import { useLoginModal } from '#/components/auth/login-modal-provider'
import { BankStatementLocalUploader } from '#/components/bank-statements/bank-statement-local-uploader'
import { BankStatementS3Uploader } from '#/components/bank-statements/bank-statement-s3-uploader'
import { BankTransactionsReviewTable } from '#/components/bank-statements/bank-transactions-review-table'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import { buildTransactionsCsv, downloadTextFile } from '#/lib/bank-statements/export-csv'
import {
  buildTransactionsWorkbook,
  downloadArrayBuffer,
} from '#/lib/bank-statements/export-excel'
import {
  extractBankStatement,
  extractBankStatementFromS3,
  listBankStatements,
  saveBankStatement,
} from '#/lib/server/bank-statements'
import { exportBankStatementPdf } from '#/lib/server/export-bank-statement-pdf'
import { getS3UploadStatus } from '#/lib/server/s3-status'
import type {
  BankStatementExtractResult,
  BankTransactionDraft,
} from '#/types/bank-statement'

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

export const Route = createFileRoute('/bank-statements/')({
  component: BankStatementsPage,
})

function BankStatementsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { openLoginModal } = useLoginModal()
  const queryClient = useQueryClient()

  const extractFromS3Fn = useStableServerFn(extractBankStatementFromS3)
  const extractLocalFn = useStableServerFn(extractBankStatement)
  const saveFn = useStableServerFn(saveBankStatement)
  const listFn = useStableServerFn(listBankStatements)
  const exportPdfFn = useStableServerFn(exportBankStatementPdf)
  const s3StatusFn = useStableServerFn(getS3UploadStatus)

  const [fileName, setFileName] = useState('')
  const [storagePath, setStoragePath] = useState<string | null>(null)
  const [meta, setMeta] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    currency: 'AUD',
    periodStart: '',
    periodEnd: '',
    openingBalance: '' as string,
    closingBalance: '' as string,
  })
  const [rows, setRows] = useState<BankTransactionDraft[]>([])
  const [modelUsed, setModelUsed] = useState<string | null>(null)

  const s3StatusQuery = useQuery({
    queryKey: ['s3-upload-status'],
    queryFn: () => s3StatusFn(),
  })

  const statementsQuery = useQuery({
    queryKey: ['bank-statements'],
    queryFn: () => listFn(),
    enabled: isAuthenticated,
  })

  const extractMutation = useMutation({
    mutationFn: async (payload: { objectKey: string; fileName: string }) => {
      const extracted = await extractFromS3Fn({
        data: {
          fileName: payload.fileName,
          objectKey: payload.objectKey,
        },
      })
      return { extracted, ...payload }
    },
    onSuccess: ({ extracted, fileName: name, objectKey }) => {
      applyExtractResult(extracted, name, objectKey)
      toast.success(`Extracted ${extracted.transactions.length} transactions`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Extraction failed')
    },
  })

  const extractLocalMutation = useMutation({
    mutationFn: async (file: File) => {
      const pdfBase64 = await fileToBase64(file)
      const extracted = await extractLocalFn({
        data: {
          fileName: file.name,
          pdfBase64,
        },
      })
      return { extracted, fileName: file.name }
    },
    onSuccess: ({ extracted, fileName: name }) => {
      applyExtractResult(extracted, name, null)
      toast.success(`Extracted ${extracted.transactions.length} transactions`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Extraction failed')
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (rows.length === 0) {
        throw new Error('Add at least one transaction before saving')
      }

      return saveFn({
        data: {
          fileName: fileName || 'bank-statement.pdf',
          bankName: meta.bankName || null,
          accountName: meta.accountName || null,
          accountNumber: meta.accountNumber || null,
          currency: meta.currency || null,
          periodStart: meta.periodStart || null,
          periodEnd: meta.periodEnd || null,
          openingBalance:
            meta.openingBalance === '' ? null : Number(meta.openingBalance),
          closingBalance:
            meta.closingBalance === '' ? null : Number(meta.closingBalance),
          storagePath,
          transactions: rows.map((row) => ({
            date: row.date,
            description: row.description,
            amount: row.amount,
            direction: row.direction,
            balance: row.balance,
            category: row.category,
            reference: row.reference,
          })),
        },
      })
    },
    onSuccess: async () => {
      toast.success('Saved to accounting store')
      await queryClient.invalidateQueries({ queryKey: ['bank-statements'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Save failed')
    },
  })

  const exportPdfMutation = useMutation({
    mutationFn: async () => {
      if (rows.length === 0) throw new Error('Nothing to export')
      return exportPdfFn({
        data: {
          fileName: fileName || 'bank-statement',
          bankName: meta.bankName || null,
          accountName: meta.accountName || null,
          accountNumber: meta.accountNumber || null,
          currency: meta.currency || null,
          periodStart: meta.periodStart || null,
          periodEnd: meta.periodEnd || null,
          openingBalance:
            meta.openingBalance === '' ? null : Number(meta.openingBalance),
          closingBalance:
            meta.closingBalance === '' ? null : Number(meta.closingBalance),
          transactions: rows,
        },
      })
    },
    onSuccess: (result) => {
      const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0))
      downloadArrayBuffer(result.fileName, bytes.buffer, 'application/pdf')
      toast.success('PDF downloaded')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'PDF export failed')
    },
  })

  const totals = useMemo(() => {
    let debit = 0
    let credit = 0
    for (const row of rows) {
      if (row.direction === 'credit') credit += row.amount
      else debit += row.amount
    }
    return { debit, credit, count: rows.length }
  }, [rows])

  function applyExtractResult(
    extracted: BankStatementExtractResult,
    name: string,
    path: string | null,
  ) {
    setFileName(name)
    setStoragePath(path)
    setModelUsed(extracted.model)
    setMeta({
      bankName: extracted.bankName ?? '',
      accountName: extracted.accountName ?? '',
      accountNumber: extracted.accountNumber ?? '',
      currency: extracted.currency ?? 'AUD',
      periodStart: extracted.periodStart ?? '',
      periodEnd: extracted.periodEnd ?? '',
      openingBalance:
        extracted.openingBalance === null || extracted.openingBalance === undefined
          ? ''
          : String(extracted.openingBalance),
      closingBalance:
        extracted.closingBalance === null || extracted.closingBalance === undefined
          ? ''
          : String(extracted.closingBalance),
    })
    setRows(extracted.transactions)
  }

  function handleS3Uploaded(payload: { objectKey: string; fileName: string }) {
    if (!isAuthenticated) {
      openLoginModal()
      return
    }
    setFileName(payload.fileName)
    setStoragePath(payload.objectKey)
    extractMutation.mutate(payload)
  }

  function handleLocalFileSelected(file: File) {
    if (!isAuthenticated) {
      openLoginModal()
      return
    }
    setFileName(file.name)
    setStoragePath(null)
    extractLocalMutation.mutate(file)
  }

  const s3Configured = s3StatusQuery.data?.configured === true
  const isExtracting =
    extractMutation.isPending || extractLocalMutation.isPending

  function addBlankRow() {
    setRows((previous) => [
      ...previous,
      {
        id: uuidv4(),
        date: new Date().toISOString().slice(0, 10),
        description: '',
        amount: 0,
        direction: 'debit',
        balance: null,
        category: null,
        reference: null,
      },
    ])
  }

  function exportCsv() {
    if (rows.length === 0) {
      toast.error('Nothing to export')
      return
    }
    const csv = buildTransactionsCsv(
      {
        fileName,
        bankName: meta.bankName || null,
        accountName: meta.accountName || null,
        accountNumber: meta.accountNumber || null,
        currency: meta.currency || null,
        periodStart: meta.periodStart || null,
        periodEnd: meta.periodEnd || null,
      },
      rows,
    )
    downloadTextFile(
      `${(fileName || 'bank-statement').replace(/\.pdf$/i, '')}.csv`,
      csv,
      'text/csv;charset=utf-8',
    )
  }

  function exportExcel() {
    if (rows.length === 0) {
      toast.error('Nothing to export')
      return
    }
    const workbook = buildTransactionsWorkbook(
      {
        fileName,
        bankName: meta.bankName || null,
        accountName: meta.accountName || null,
        accountNumber: meta.accountNumber || null,
        currency: meta.currency || null,
        periodStart: meta.periodStart || null,
        periodEnd: meta.periodEnd || null,
        openingBalance:
          meta.openingBalance === '' ? null : Number(meta.openingBalance),
        closingBalance:
          meta.closingBalance === '' ? null : Number(meta.closingBalance),
      },
      rows,
    )
    downloadArrayBuffer(
      `${(fileName || 'bank-statement').replace(/\.pdf$/i, '')}.xlsx`,
      workbook,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Bank statements
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload PDF → AI extracts transactions → review, save, and export
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link
            to="/dashboard"
            search={{ subscription: undefined, subscription_id: undefined }}
          >
            Back to dashboard
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">
              1. Upload PDF{s3Configured ? ' to S3' : ''}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {s3Configured
                ? 'Better Upload → AWS S3. Auth + DB stay on Supabase.'
                : 'Local extract mode (AWS S3 not configured yet).'}
            </p>
          </div>
          {modelUsed ? (
            <Badge variant="secondary" className="font-normal">
              Model: {modelUsed}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {s3StatusQuery.data && !s3Configured ? (
            <Alert variant="destructive">
              <AlertTitle>AWS S3 credentials missing</AlertTitle>
            </Alert>
          ) : null}
          {!isAuthenticated && !isAuthLoading ? (
            <div className="flex flex-col items-start gap-3">
              <Alert className="max-w-md border-dashed">
                <AlertDescription>
                  Sign in to upload bank statements and run AI extraction.
                </AlertDescription>
              </Alert>
              <Button onClick={openLoginModal}>Sign in</Button>
            </div>
          ) : s3Configured ? (
            <BankStatementS3Uploader
              disabled={!isAuthenticated || isExtracting}
              onUploaded={handleS3Uploaded}
            />
          ) : (
            <BankStatementLocalUploader
              disabled={!isAuthenticated}
              isExtracting={extractLocalMutation.isPending}
              onFileSelected={handleLocalFileSelected}
            />
          )}
          {isExtracting ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {s3Configured
                ? 'Extracting transactions from S3 PDF…'
                : 'Extracting transactions from PDF…'}
            </p>
          ) : null}
          {fileName ? (
            <p className="text-sm text-muted-foreground">
              {fileName}
              {storagePath ? (
                <span className="ml-2 font-mono text-xs">({storagePath})</span>
              ) : null}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">2. Statement details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="bankName">Bank</Label>
            <Input
              id="bankName"
              value={meta.bankName}
              onChange={(e) => setMeta((m) => ({ ...m, bankName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountName">Account name</Label>
            <Input
              id="accountName"
              value={meta.accountName}
              onChange={(e) => setMeta((m) => ({ ...m, accountName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountNumber">Account number</Label>
            <Input
              id="accountNumber"
              value={meta.accountNumber}
              onChange={(e) =>
                setMeta((m) => ({ ...m, accountNumber: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={meta.currency}
              onChange={(e) => setMeta((m) => ({ ...m, currency: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="periodStart">Period start</Label>
            <Input
              id="periodStart"
              type="date"
              value={meta.periodStart}
              onChange={(e) => setMeta((m) => ({ ...m, periodStart: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="periodEnd">Period end</Label>
            <Input
              id="periodEnd"
              type="date"
              value={meta.periodEnd}
              onChange={(e) => setMeta((m) => ({ ...m, periodEnd: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4" />
              3. Review transactions
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {totals.count} rows · Debits {totals.debit.toFixed(2)} · Credits{' '}
              {totals.credit.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addBlankRow}>
              <Plus className="size-4" />
              Add row
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || rows.length === 0 || !isAuthenticated}
            >
              {saveMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <BankTransactionsReviewTable rows={rows} onChange={setRows} />

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={rows.length === 0}
            >
              <Download className="size-4" />
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportExcel}
              disabled={rows.length === 0}
            >
              <FileSpreadsheet className="size-4" />
              Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => exportPdfMutation.mutate()}
              disabled={rows.length === 0 || exportPdfMutation.isPending}
            >
              {exportPdfMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileText className="size-4" />
              )}
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Saved statements</CardTitle>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <p className="text-sm text-muted-foreground">Sign in to see saved statements.</p>
          ) : statementsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (statementsQuery.data?.length ?? 0) === 0 ? (
            <Alert className="border-dashed">
              <AlertDescription>
                No saved statements yet. Extract and save one above.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>S3 key</TableHead>
                  <TableHead>Saved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statementsQuery.data?.map((statement) => (
                  <TableRow key={statement.id}>
                    <TableCell className="font-medium">{statement.fileName}</TableCell>
                    <TableCell>{statement.bankName ?? '—'}</TableCell>
                    <TableCell className="max-w-[220px] truncate font-mono text-xs text-muted-foreground">
                      {statement.storagePath ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(statement.createdAt).toLocaleDateString('en-AU')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
