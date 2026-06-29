import { describe, expect, it } from 'vitest'

import {
  calculateNetIncome,
  cloneDefaultBudgetRows,
  getBudgetAmount,
  NET_INCOME_CATEGORY,
  withCalculatedNetIncome,
  type BudgetRow,
} from '#/types'

function row(category: string, amount: number): BudgetRow {
  return { id: category, category, amount, taxRate: 0, notes: '' }
}

describe('budget calculations', () => {
  it('calculates net income from income, tax, and GST', () => {
    const rows = [
      row('Annual Income', 100_000),
      row('Tax Withheld', 20_000),
      row('GST Owed', 5_000),
      row(NET_INCOME_CATEGORY, 0),
    ]

    expect(calculateNetIncome(rows)).toBe(75_000)
    expect(
      withCalculatedNetIncome(rows).find((r) => r.category === NET_INCOME_CATEGORY)
        ?.amount,
    ).toBe(75_000)
  })

  it('treats missing categories as zero', () => {
    expect(calculateNetIncome([row('Annual Income', 50_000)])).toBe(50_000)
    expect(getBudgetAmount([], 'Annual Income')).toBe(0)
  })

  it('clones default rows without sharing references', () => {
    const first = cloneDefaultBudgetRows()
    const second = cloneDefaultBudgetRows()

    expect(first).not.toBe(second)
    expect(first[0]).not.toBe(second[0])
    expect(first).toHaveLength(5)
  })
})
