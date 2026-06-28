import { useCallback, useMemo, useState } from 'react'
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import {
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'

import { DataTable } from '#/components/ui/data-table'
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
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Input } from '#/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'
import { NET_INCOME_CATEGORY, withCalculatedNetIncome } from '#/types'
import type { BudgetRow } from '#/types'

interface BudgetGridProps {
  data: BudgetRow[]
  onDataChange: (rows: BudgetRow[]) => void
  onAddRow: () => void
  onClearAll: () => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

function SortableHeader({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="-ml-3 h-8 font-semibold"
      onClick={onClick}
    >
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  )
}

export function BudgetGrid({
  data,
  onDataChange,
  onAddRow,
  onClearAll,
}: BudgetGridProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const updateRow = useCallback(
    (
      rowId: string,
      field: keyof Omit<BudgetRow, 'id'>,
      value: string | number,
    ) => {
      onDataChange(
        withCalculatedNetIncome(
          data.map((row) => {
            if (row.id !== rowId || row.category === NET_INCOME_CATEGORY) {
              return row
            }
            return { ...row, [field]: value }
          }),
        ),
      )
    },
    [data, onDataChange],
  )

  const deleteRow = useCallback(
    (rowId: string) => {
      const row = data.find((item) => item.id === rowId)
      if (!row || row.category === NET_INCOME_CATEGORY) return
      onDataChange(
        withCalculatedNetIncome(data.filter((item) => item.id !== rowId)),
      )
    },
    [data, onDataChange],
  )

  const columns = useMemo<ColumnDef<BudgetRow>[]>(
    () => [
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <SortableHeader
            label="Category"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          />
        ),
        cell: ({ row }) => {
          const isNetIncome = row.original.category === NET_INCOME_CATEGORY
          return (
            <Input
              value={row.original.category}
              readOnly={isNetIncome}
              onChange={(event) =>
                updateRow(row.original.id, 'category', event.target.value)
              }
              className={cn(
                'h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1',
                isNetIncome && 'bg-muted/60 font-semibold',
              )}
            />
          )
        },
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <div className="flex justify-end">
            <SortableHeader
              label="Amount (AUD)"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            />
          </div>
        ),
        cell: ({ row }) => {
          const isNetIncome = row.original.category === NET_INCOME_CATEGORY
          return (
            <Input
              type="number"
              step="0.01"
              value={row.original.amount}
              readOnly={isNetIncome}
              onChange={(event) =>
                updateRow(
                  row.original.id,
                  'amount',
                  Number(event.target.value) || 0,
                )
              }
              className={cn(
                'h-8 border-transparent bg-transparent text-right shadow-none focus-visible:ring-1',
                isNetIncome && 'bg-muted/60 font-semibold tabular-nums',
              )}
            />
          )
        },
      },
      {
        accessorKey: 'taxRate',
        header: ({ column }) => (
          <div className="flex justify-end">
            <SortableHeader
              label="Tax Rate %"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            />
          </div>
        ),
        cell: ({ row }) => {
          const isNetIncome = row.original.category === NET_INCOME_CATEGORY
          return (
            <Input
              type="number"
              step="0.1"
              value={row.original.taxRate}
              readOnly={isNetIncome}
              onChange={(event) =>
                updateRow(
                  row.original.id,
                  'taxRate',
                  Number(event.target.value) || 0,
                )
              }
              className={cn(
                'h-8 border-transparent bg-transparent text-right shadow-none focus-visible:ring-1',
                isNetIncome && 'bg-muted/60 font-semibold tabular-nums',
              )}
            />
          )
        },
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => {
          const isNetIncome = row.original.category === NET_INCOME_CATEGORY
          return (
            <Input
              value={row.original.notes}
              readOnly={isNetIncome}
              onChange={(event) =>
                updateRow(row.original.id, 'notes', event.target.value)
              }
              className={cn(
                'h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1',
                isNetIncome && 'bg-muted/60',
              )}
            />
          )
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const isNetIncome = row.original.category === NET_INCOME_CATEGORY
          if (isNetIncome) return null

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                  >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open row actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteRow(row.original.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete row
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
        enableSorting: false,
      },
    ],
    [deleteRow, updateRow],
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <TooltipProvider>
      <div className="mb-4 flex items-center justify-end gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onAddRow}
            >
              <Plus className="size-4" />
              <span className="sr-only">Add row</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add row</TooltipContent>
        </Tooltip>

        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" size="icon">
                  <RotateCcw className="size-4" />
                  <span className="sr-only">Clear all</span>
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Clear all</TooltipContent>
          </Tooltip>
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
                Clear all
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <DataTable
        table={table}
        columnCount={columns.length}
        getRowClassName={(row) =>
          row.original.category === NET_INCOME_CATEGORY ? 'bg-muted/60' : undefined
        }
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedCount} of {data.length} row(s) selected.
            </p>
            <p className="text-sm text-muted-foreground">
              Net income:{' '}
              <span className="font-medium text-foreground">
                {formatCurrency(
                  data.find((row) => row.category === NET_INCOME_CATEGORY)
                    ?.amount ?? 0,
                )}
              </span>
            </p>
          </div>
        }
      />
    </TooltipProvider>
  )
}
