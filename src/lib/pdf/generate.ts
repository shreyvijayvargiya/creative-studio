import { renderToBuffer } from '@react-pdf/renderer'

import { createFinancialPdfDocument } from '#/components/pdf/PDFDocument'
import type { BudgetRow } from '#/types'

export async function renderFinancialPdfToBuffer(
  rows: BudgetRow[],
  signature: string,
): Promise<Buffer> {
  const document = createFinancialPdfDocument({ rows, signature })
  return renderToBuffer(document)
}
