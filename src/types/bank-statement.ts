export type BankTransactionDirection = 'debit' | 'credit' | 'unknown'

export interface BankTransactionDraft {
  /** Client-side row id before save */
  id: string
  date: string
  description: string
  amount: number
  direction: BankTransactionDirection
  balance: number | null
  category: string | null
  reference: string | null
}

export interface BankTransaction extends BankTransactionDraft {
  statementId: string
  createdAt: string
  updatedAt: string
}

export interface BankStatementMeta {
  bankName: string | null
  accountName: string | null
  accountNumber: string | null
  currency: string | null
  periodStart: string | null
  periodEnd: string | null
  openingBalance: number | null
  closingBalance: number | null
}

export interface BankStatementExtractResult extends BankStatementMeta {
  transactions: BankTransactionDraft[]
  rawTextPreview: string
  model: string
}

export interface BankStatement {
  id: string
  ownerId: string
  fileName: string
  status: 'draft' | 'saved'
  bankName: string | null
  accountName: string | null
  accountNumber: string | null
  currency: string | null
  periodStart: string | null
  periodEnd: string | null
  openingBalance: number | null
  closingBalance: number | null
  storagePath: string | null
  createdAt: string
  updatedAt: string
  transactions?: BankTransaction[]
}

export interface SaveBankStatementInput extends BankStatementMeta {
  fileName: string
  storagePath?: string | null
  transactions: Array<{
    date: string
    description: string
    amount: number
    direction: BankTransactionDirection
    balance?: number | null
    category?: string | null
    reference?: string | null
  }>
}
