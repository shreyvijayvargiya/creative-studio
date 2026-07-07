import { describe, expect, it } from 'vitest'

import {
  calculateGstExclusive,
  calculateGstInclusive,
  estimateAustralianIncomeTax,
} from '#/lib/ai/tax-calculator'

describe('tax calculator', () => {
  it('calculates GST on exclusive amount', () => {
    const result = calculateGstExclusive(1000)
    expect(result.gstAmount).toBe(100)
    expect(result.amountIncGst).toBe(1100)
  })

  it('extracts GST from inclusive amount', () => {
    const result = calculateGstInclusive(1100)
    expect(result.gstAmount).toBe(100)
    expect(result.amountExGst).toBe(1000)
  })

  it('estimates income tax on mid bracket income', () => {
    const result = estimateAustralianIncomeTax(85_000)
    expect(result.estimatedTax).toBeGreaterThan(0)
    expect(result.type).toBe('income_tax_estimate')
  })
})
