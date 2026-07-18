import { renderToBuffer } from '@react-pdf/renderer'

import { createBankStatementPdfDocument } from '#/lib/bank-statements/export-pdf-document'
import type { BankStatementMeta, BankTransactionDraft } from '#/types/bank-statement'

export async function renderBankStatementPdfToBuffer(input: {
  meta: Partial<BankStatementMeta> & { fileName?: string }
  transactions: BankTransactionDraft[]
}): Promise<Buffer> {
  const document = createBankStatementPdfDocument(input)
  // @react-pdf types are stricter than the runtime Document element
  return renderToBuffer(document as never)
}
