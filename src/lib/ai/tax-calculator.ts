export type TaxCalculationType = 'gst' | 'gst_inclusive' | 'income_tax_estimate'

export interface TaxCalculationResult {
  type: TaxCalculationType
  inputAmount: number
  currency: 'AUD'
  gstAmount?: number
  amountExGst?: number
  amountIncGst?: number
  estimatedTax?: number
  effectiveRate?: number
  taxRateUsed?: number
  disclaimer: string
}

const GST_RATE = 0.1

function formatAud(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function calculateGstExclusive(amount: number): TaxCalculationResult {
  const gstAmount = formatAud(amount * GST_RATE)
  return {
    type: 'gst',
    inputAmount: amount,
    currency: 'AUD',
    gstAmount,
    amountExGst: amount,
    amountIncGst: formatAud(amount + gstAmount),
    taxRateUsed: GST_RATE * 100,
    disclaimer:
      'GST calculated at 10% on the ex-GST amount. Not tax advice — verify with your accountant.',
  }
}

export function calculateGstInclusive(amountIncGst: number): TaxCalculationResult {
  const amountExGst = formatAud(amountIncGst / (1 + GST_RATE))
  const gstAmount = formatAud(amountIncGst - amountExGst)
  return {
    type: 'gst_inclusive',
    inputAmount: amountIncGst,
    currency: 'AUD',
    gstAmount,
    amountExGst,
    amountIncGst,
    taxRateUsed: GST_RATE * 100,
    disclaimer:
      'GST extracted from GST-inclusive amount at 10%. Not tax advice — verify with your accountant.',
  }
}

export function estimateAustralianIncomeTax(taxableIncome: number): TaxCalculationResult {
  const income = Math.max(0, taxableIncome)
  let estimatedTax = 0

  if (income <= 18_200) {
    estimatedTax = 0
  } else if (income <= 45_000) {
    estimatedTax = (income - 18_200) * 0.16
  } else if (income <= 135_000) {
    estimatedTax = 4_288 + (income - 45_000) * 0.3
  } else if (income <= 190_000) {
    estimatedTax = 31_288 + (income - 135_000) * 0.37
  } else {
    estimatedTax = 51_638 + (income - 190_000) * 0.45
  }

  estimatedTax = formatAud(Math.max(0, estimatedTax))
  const effectiveRate = income > 0 ? formatAud((estimatedTax / income) * 100) : 0

  return {
    type: 'income_tax_estimate',
    inputAmount: income,
    currency: 'AUD',
    estimatedTax,
    effectiveRate,
    disclaimer:
      'Illustrative Australian resident income tax estimate using simplified 2024–25 brackets. Excludes Medicare levy, offsets, and deductions. Not tax advice.',
  }
}

export function calculateTax(
  amount: number,
  type: TaxCalculationType,
): TaxCalculationResult {
  if (type === 'gst_inclusive') {
    return calculateGstInclusive(amount)
  }

  if (type === 'income_tax_estimate') {
    return estimateAustralianIncomeTax(amount)
  }

  return calculateGstExclusive(amount)
}

export function calculateTaxWithRate(
  amount: number,
  ratePercent: number,
): TaxCalculationResult {
  const rate = ratePercent / 100
  const estimatedTax = formatAud(amount * rate)

  return {
    type: 'income_tax_estimate',
    inputAmount: amount,
    currency: 'AUD',
    estimatedTax,
    effectiveRate: ratePercent,
    taxRateUsed: ratePercent,
    disclaimer: `Tax estimated at ${ratePercent}% on the amount provided. Not tax advice.`,
  }
}
