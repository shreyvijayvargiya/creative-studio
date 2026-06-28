import { renderToBuffer } from '@react-pdf/renderer'

import { createAtoPdfDocument } from '#/components/pdf/ATOPdfDocument'
import { injectDocusealSignatureTag } from '#/lib/pdf/inject-docuseal-tag'
import type { AtoTaxpayerInfo, BudgetRow } from '#/types'
import { withCalculatedNetIncome } from '#/types'

export async function renderAtoPdfToBuffer(
  rows: BudgetRow[],
  taxpayer: AtoTaxpayerInfo,
): Promise<Buffer> {
  const document = createAtoPdfDocument({
    rows: withCalculatedNetIncome(rows),
    taxpayer,
  })
  const buffer = await renderToBuffer(document)
  return injectDocusealSignatureTag(buffer)
}
