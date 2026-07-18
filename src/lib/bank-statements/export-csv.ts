import type { BankStatementMeta, BankTransactionDraft } from '#/types/bank-statement'

function csvEscape(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

export function buildTransactionsCsv(
  meta: Partial<BankStatementMeta> & { fileName?: string },
  transactions: BankTransactionDraft[],
): string {
  const header = [
    'Date',
    'Description',
    'Amount',
    'Direction',
    'Balance',
    'Category',
    'Reference',
  ]

  const lines = [
    `# File,${csvEscape(meta.fileName ?? '')}`,
    `# Bank,${csvEscape(meta.bankName ?? '')}`,
    `# Account,${csvEscape(meta.accountName ?? '')}`,
    `# Account Number,${csvEscape(meta.accountNumber ?? '')}`,
    `# Currency,${csvEscape(meta.currency ?? '')}`,
    `# Period,${csvEscape(meta.periodStart ?? '')} to ${csvEscape(meta.periodEnd ?? '')}`,
    header.join(','),
    ...transactions.map((txn) =>
      [
        csvEscape(txn.date),
        csvEscape(txn.description),
        csvEscape(txn.amount),
        csvEscape(txn.direction),
        csvEscape(txn.balance),
        csvEscape(txn.category),
        csvEscape(txn.reference),
      ].join(','),
    ),
  ]

  return `\uFEFF${lines.join('\n')}`
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
