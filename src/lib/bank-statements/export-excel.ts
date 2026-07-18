import * as XLSX from 'xlsx'

import type { BankStatementMeta, BankTransactionDraft } from '#/types/bank-statement'

export function buildTransactionsWorkbook(
  meta: Partial<BankStatementMeta> & { fileName?: string },
  transactions: BankTransactionDraft[],
): ArrayBuffer {
  const workbook = XLSX.utils.book_new()

  const summaryRows = [
    ['File', meta.fileName ?? ''],
    ['Bank', meta.bankName ?? ''],
    ['Account', meta.accountName ?? ''],
    ['Account Number', meta.accountNumber ?? ''],
    ['Currency', meta.currency ?? ''],
    ['Period Start', meta.periodStart ?? ''],
    ['Period End', meta.periodEnd ?? ''],
    ['Opening Balance', meta.openingBalance ?? ''],
    ['Closing Balance', meta.closingBalance ?? ''],
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  const txnRows = [
    ['Date', 'Description', 'Amount', 'Direction', 'Balance', 'Category', 'Reference'],
    ...transactions.map((txn) => [
      txn.date,
      txn.description,
      txn.amount,
      txn.direction,
      txn.balance ?? '',
      txn.category ?? '',
      txn.reference ?? '',
    ]),
  ]
  const txnSheet = XLSX.utils.aoa_to_sheet(txnRows)
  XLSX.utils.book_append_sheet(workbook, txnSheet, 'Transactions')

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
}

export function downloadArrayBuffer(filename: string, buffer: ArrayBuffer, mimeType: string): void {
  const blob = new Blob([buffer], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
