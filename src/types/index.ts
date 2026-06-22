export interface BudgetRow {
  category: string
  amount: number
  taxRate: number
  notes: string
}

export interface DocumentRecord {
  id: string
  storage_path: string
  share_pin: string
  created_at: string
  // TODO Phase 2: attach owner_id to document record
  owner_id?: string
}

export const NET_INCOME_CATEGORY = 'Net Income'

export const DEFAULT_BUDGET_ROWS: BudgetRow[] = [
  { category: 'Annual Income', amount: 0, taxRate: 0, notes: '' },
  { category: 'Tax Withheld', amount: 0, taxRate: 0, notes: '' },
  { category: 'GST Owed', amount: 0, taxRate: 10, notes: '' },
  { category: 'BAS Amount', amount: 0, taxRate: 0, notes: '' },
  { category: NET_INCOME_CATEGORY, amount: 0, taxRate: 0, notes: '' },
]

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
