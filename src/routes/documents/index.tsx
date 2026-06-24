import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import type {ColumnDef, SortingState} from '@tanstack/react-table';
import {
  ArrowUpDown,
  Copy,
  Eye,
  FileText,
  Link2,
  MoreHorizontal,
  Share2,
  TableProperties,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '#/components/auth/auth-provider'
import { useLoginModal } from '#/components/auth/login-modal-provider'
import { DataTable } from '#/components/ui/data-table'
import { SharePdfDialog } from '#/components/pdf/share-pdf-dialog'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Checkbox } from '#/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Input } from '#/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '#/components/ui/pagination'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { listDocuments } from '#/lib/server/list-documents'
import type { DocumentListItem } from '#/types'

export const Route = createFileRoute('/documents/')({
  component: DocumentsPage,
})

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DocumentsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { openLoginModal } = useLoginModal()
  const listDocumentsFn = useServerFn(listDocuments)
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [shareDocument, setShareDocument] = useState<DocumentListItem | null>(
    null,
  )

  useEffect(() => {
    if (!isAuthenticated) {
      setDocuments([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    void listDocumentsFn()
      .then(setDocuments)
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Failed to load documents'
        toast.error(message)
      })
      .finally(() => setIsLoading(false))
  }, [isAuthenticated, listDocumentsFn])

  const columns = useMemo<ColumnDef<DocumentListItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="size-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.kind === 'budget' ? (
              <TableProperties className="size-4 text-muted-foreground" />
            ) : (
              <FileText className="size-4 text-muted-foreground" />
            )}
            <span
              className="block max-w-[220px] truncate"
              title={row.original.name}
            >
              {row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <ArrowUpDown className="size-3.5" />
          </Button>
        ),
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: 'size',
        header: 'Type',
        cell: ({ row }) =>
          row.original.kind === 'budget' ? (
            <Badge variant="secondary">Budget</Badge>
          ) : (
            <Badge variant="outline">PDF</Badge>
          ),
      },
      {
        accessorKey: 'pinProtected',
        header: 'PIN Protected',
        cell: ({ row }) =>
          row.original.pinProtected ? (
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300">
              PIN
            </Badge>
          ) : (
            <Badge variant="secondary">Draft</Badge>
          ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const doc = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    to={
                      doc.kind === 'budget'
                        ? '/documents/$id'
                        : '/documents/pdf/$id'
                    }
                    params={{ id: doc.id }}
                  >
                    <Eye className="size-4" />
                    View in browser
                  </Link>
                </DropdownMenuItem>
                {doc.kind === 'pdf' ? (
                  <>
                    <DropdownMenuItem onClick={() => setShareDocument(doc)}>
                      <Share2 className="size-4" />
                      Share securely
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        const url = `${window.location.origin}/pdf/view/${doc.storagePath}`
                        await navigator.clipboard.writeText(url)
                        toast.success('Link copied')
                      }}
                    >
                      <Link2 className="size-4" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        await navigator.clipboard.writeText(doc.sharePin)
                        toast.success('PIN copied')
                      }}
                    >
                      <Copy className="size-4" />
                      Copy PIN
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable({
    data: documents,
    columns,
    state: { sorting, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  })

  const pageCount = table.getPageCount() || 1
  const currentPage = table.getState().pagination.pageIndex + 1
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Documents
          </h1>
          <p className="text-sm text-muted-foreground">
            Saved budgets and generated PDFs
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled>Upload Document</Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Phase 2</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 space-y-0 p-4 sm:p-6">
          <CardTitle className="text-base">Generated Documents</CardTitle>
          <Input
            placeholder="Filter by name..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full sm:max-w-xs"
          />
        </CardHeader>
        <CardContent className="min-w-0 p-4 pt-0 sm:p-6 sm:pt-0">
          {isAuthLoading || isLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Loading documents...
            </p>
          ) : !isAuthenticated ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Alert className="max-w-md border-dashed">
                <AlertDescription>
                  Sign in to view documents saved under your account.
                </AlertDescription>
              </Alert>
              <Button onClick={openLoginModal}>Sign in</Button>
            </div>
          ) : (
            <DataTable
              table={table}
              columnCount={columns.length}
              emptyState={
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <FileText className="size-12 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No documents generated yet
                  </p>
                  <Button asChild>
                    <Link to="/grid">Create your first document</Link>
                  </Button>
                </div>
              }
              footer={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedCount} of {documents.length} row(s) selected.
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-3 text-sm text-muted-foreground">
                          Page {currentPage} of {pageCount}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              }
            />
          )}
        </CardContent>
      </Card>

      {shareDocument ? (
        <SharePdfDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setShareDocument(null)
            }
          }}
          storagePath={shareDocument.storagePath}
          sharePin={shareDocument.sharePin}
          documentName={shareDocument.name}
        />
      ) : null}
    </div>
  )
}
