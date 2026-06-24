import { v4 as uuidv4 } from 'uuid'

export interface BudgetRow {
  id: string
  category: string
  amount: number
  taxRate: number
  notes: string
}

export type DocumentKind = 'pdf' | 'budget'

export interface DocumentRecord {
  id: string
  name: string
  kind: DocumentKind
  storage_path: string
  share_pin: string
  budget_data: BudgetRow[] | null
  created_at: string
  owner_id?: string
}

export interface DocumentListItem {
  id: string
  name: string
  kind: DocumentKind
  storagePath: string
  sharePin: string
  createdAt: string
  pinProtected: boolean
}

export const NET_INCOME_CATEGORY = 'Net Income'

function createBudgetRow(
  partial: Omit<BudgetRow, 'id'> & { id?: string },
): BudgetRow {
  return {
    id: partial.id ?? uuidv4(),
    category: partial.category,
    amount: partial.amount,
    taxRate: partial.taxRate,
    notes: partial.notes,
  }
}

export const DEFAULT_BUDGET_ROWS: BudgetRow[] = [
  createBudgetRow({
    id: 'annual-income',
    category: 'Annual Income',
    amount: 0,
    taxRate: 0,
    notes: '',
  }),
  createBudgetRow({
    id: 'tax-withheld',
    category: 'Tax Withheld',
    amount: 0,
    taxRate: 0,
    notes: '',
  }),
  createBudgetRow({
    id: 'gst-owed',
    category: 'GST Owed',
    amount: 0,
    taxRate: 10,
    notes: '',
  }),
  createBudgetRow({
    id: 'bas-amount',
    category: 'BAS Amount',
    amount: 0,
    taxRate: 0,
    notes: '',
  }),
  createBudgetRow({
    id: 'net-income',
    category: NET_INCOME_CATEGORY,
    amount: 0,
    taxRate: 0,
    notes: '',
  }),
]

export function createEmptyRow(): BudgetRow {
  return createBudgetRow({
    category: '',
    amount: 0,
    taxRate: 0,
    notes: '',
  })
}

export function calculateNetIncome(rows: BudgetRow[]): number {
  const getAmount = (category: string) =>
    rows.find((row) => row.category === category)?.amount ?? 0

  return (
    getAmount('Annual Income') -
    getAmount('Tax Withheld') -
    getAmount('GST Owed')
  )
}

export function withCalculatedNetIncome(rows: BudgetRow[]): BudgetRow[] {
  const netIncome = calculateNetIncome(rows)

  return rows.map((row) =>
    row.category === NET_INCOME_CATEGORY ? { ...row, amount: netIncome } : row,
  )
}

export function cloneDefaultBudgetRows(): BudgetRow[] {
  return DEFAULT_BUDGET_ROWS.map((row) => ({ ...row }))
}
