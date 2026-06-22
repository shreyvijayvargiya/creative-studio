import { useCallback, useMemo } from 'react'
import {
  
  
  
  ReactGrid
} from '@silevis/reactgrid'
import type {CellChange, Column, Row} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  NET_INCOME_CATEGORY,
  
  withCalculatedNetIncome
} from '#/types'
import type {BudgetRow} from '#/types';

interface BudgetGridProps {
  data: BudgetRow[]
  onDataChange: (rows: BudgetRow[]) => void
}

const columns: Column[] = [
  { columnId: 'category', width: 200, resizable: true },
  { columnId: 'amount', width: 150, resizable: true },
  { columnId: 'taxRate', width: 120, resizable: true },
  { columnId: 'notes', width: 280, resizable: true },
]

function toGridRows(data: BudgetRow[]): Row[] {
  return data.map((row, index) => {
    const isNetIncome = row.category === NET_INCOME_CATEGORY

    return {
      rowId: `row-${index}`,
      cells: [
        {
          type: 'text' as const,
          text: row.category,
          nonEditable: isNetIncome,
        },
        {
          type: 'number' as const,
          value: row.amount,
          format: new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
          }),
          nonEditable: isNetIncome,
        },
        {
          type: 'number' as const,
          value: row.taxRate,
          format: new Intl.NumberFormat('en-AU', {
            maximumFractionDigits: 1,
          }),
          nonEditable: isNetIncome,
        },
        {
          type: 'text' as const,
          text: row.notes,
          nonEditable: isNetIncome,
        },
      ],
    }
  })
}

function applyCellChanges(
  changes: CellChange[],
  currentRows: BudgetRow[],
): BudgetRow[] {
  const updated = currentRows.map((row) => ({ ...row }))

  for (const change of changes) {
    const rowIndex = Number(String(change.rowId).replace('row-', ''))
    if (Number.isNaN(rowIndex) || !updated[rowIndex]) continue
    if (updated[rowIndex].category === NET_INCOME_CATEGORY) continue

    if (change.columnId === 'category' && change.newCell.type === 'text') {
      updated[rowIndex].category = change.newCell.text
    }

    if (change.columnId === 'amount' && change.newCell.type === 'number') {
      updated[rowIndex].amount = change.newCell.value
    }

    if (change.columnId === 'taxRate' && change.newCell.type === 'number') {
      updated[rowIndex].taxRate = change.newCell.value
    }

    if (change.columnId === 'notes' && change.newCell.type === 'text') {
      updated[rowIndex].notes = change.newCell.text
    }
  }

  return withCalculatedNetIncome(updated)
}

export function BudgetGrid({ data, onDataChange }: BudgetGridProps) {
  const rows = useMemo(() => toGridRows(data), [data])

  const handleCellsChanged = useCallback(
    (changes: CellChange[]) => {
      onDataChange(applyCellChanges(changes, data))
    },
    [data, onDataChange],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Planner</CardTitle>
        <CardDescription>Enter financial data below</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <ReactGrid
            rows={rows}
            columns={columns}
            onCellsChanged={handleCellsChanged}
            enableFillHandle
            enableRowSelection
          />
        </div>
      </CardContent>
    </Card>
  )
}
