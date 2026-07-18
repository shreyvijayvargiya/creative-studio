import { Trash2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import type {
  BankTransactionDirection,
  BankTransactionDraft,
} from '#/types/bank-statement'

interface BankTransactionsReviewTableProps {
  rows: BankTransactionDraft[]
  onChange: (rows: BankTransactionDraft[]) => void
}

export function BankTransactionsReviewTable({
  rows,
  onChange,
}: BankTransactionsReviewTableProps) {
  const updateRow = (
    id: string,
    patch: Partial<BankTransactionDraft>,
  ) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const removeRow = (id: string) => {
    onChange(rows.filter((row) => row.id !== id))
  }

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No transactions yet. Upload a statement or add a row.
      </p>
    )
  }

  return (
    <div className="min-w-0 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[130px]">Date</TableHead>
            <TableHead className="min-w-[220px]">Description</TableHead>
            <TableHead className="min-w-[110px]">Amount</TableHead>
            <TableHead className="min-w-[120px]">Direction</TableHead>
            <TableHead className="min-w-[110px]">Balance</TableHead>
            <TableHead className="min-w-[140px]">Category</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Input
                  type="date"
                  value={row.date}
                  onChange={(event) =>
                    updateRow(row.id, { date: event.target.value })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.description}
                  onChange={(event) =>
                    updateRow(row.id, { description: event.target.value })
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={Number.isFinite(row.amount) ? row.amount : 0}
                  onChange={(event) =>
                    updateRow(row.id, {
                      amount: Number(event.target.value) || 0,
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm shadow-sm"
                  value={row.direction}
                  onChange={(event) =>
                    updateRow(row.id, {
                      direction: event.target.value as BankTransactionDirection,
                    })
                  }
                >
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                  <option value="unknown">Unknown</option>
                </select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.01"
                  value={row.balance ?? ''}
                  onChange={(event) => {
                    const raw = event.target.value
                    updateRow(row.id, {
                      balance: raw === '' ? null : Number(raw),
                    })
                  }}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.category ?? ''}
                  onChange={(event) =>
                    updateRow(row.id, {
                      category: event.target.value || null,
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove row"
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
