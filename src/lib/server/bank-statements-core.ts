import type {
  BankStatement,
  BankTransaction,
  BankTransactionDirection,
  SaveBankStatementInput,
} from '#/types/bank-statement'
import { getSupabaseAdmin } from '#/lib/supabase/admin'

interface StatementRow {
  id: string
  owner_id: string
  file_name: string
  status: string
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  currency: string | null
  period_start: string | null
  period_end: string | null
  opening_balance: number | string | null
  closing_balance: number | string | null
  storage_path: string | null
  created_at: string
  updated_at: string
}

interface TransactionRow {
  id: string
  statement_id: string
  owner_id: string
  txn_date: string
  description: string
  amount: number | string
  direction: string
  balance: number | string | null
  category: string | null
  reference: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function mapStatement(row: StatementRow): BankStatement {
  return {
    id: row.id,
    ownerId: row.owner_id,
    fileName: row.file_name,
    status: row.status === 'draft' ? 'draft' : 'saved',
    bankName: row.bank_name,
    accountName: row.account_name,
    accountNumber: row.account_number,
    currency: row.currency,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    openingBalance: toNumber(row.opening_balance),
    closingBalance: toNumber(row.closing_balance),
    storagePath: row.storage_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapTransaction(row: TransactionRow): BankTransaction {
  const direction = row.direction as BankTransactionDirection
  return {
    id: row.id,
    statementId: row.statement_id,
    date: row.txn_date,
    description: row.description,
    amount: toNumber(row.amount) ?? 0,
    direction:
      direction === 'debit' || direction === 'credit' ? direction : 'unknown',
    balance: toNumber(row.balance),
    category: row.category,
    reference: row.reference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listBankStatementsForUser(
  userId: string,
): Promise<BankStatement[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('bank_statements')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    if (isMissingTableError(error.message)) {
      return []
    }
    throw new Error(`Failed to list bank statements: ${error.message}`)
  }

  return (data as StatementRow[]).map(mapStatement)
}

export async function getBankStatementForUser(
  userId: string,
  statementId: string,
): Promise<BankStatement | null> {
  const supabase = getSupabaseAdmin()

  const { data: statement, error } = await supabase
    .from('bank_statements')
    .select('*')
    .eq('owner_id', userId)
    .eq('id', statementId)
    .maybeSingle()

  if (error) {
    if (isMissingTableError(error.message)) return null
    throw new Error(`Failed to load bank statement: ${error.message}`)
  }

  if (!statement) return null

  const { data: transactions, error: txnError } = await supabase
    .from('bank_transactions')
    .select('*')
    .eq('owner_id', userId)
    .eq('statement_id', statementId)
    .order('sort_order', { ascending: true })

  if (txnError) {
    throw new Error(`Failed to load transactions: ${txnError.message}`)
  }

  return {
    ...mapStatement(statement as StatementRow),
    transactions: ((transactions ?? []) as TransactionRow[]).map(mapTransaction),
  }
}

export async function saveBankStatementForUser(
  userId: string,
  input: SaveBankStatementInput,
): Promise<BankStatement> {
  const supabase = getSupabaseAdmin()

  const { data: statement, error } = await supabase
    .from('bank_statements')
    .insert({
      owner_id: userId,
      file_name: input.fileName,
      status: 'saved',
      bank_name: input.bankName,
      account_name: input.accountName,
      account_number: input.accountNumber,
      currency: input.currency,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      opening_balance: input.openingBalance,
      closing_balance: input.closingBalance,
      storage_path: input.storagePath ?? null,
    })
    .select('*')
    .single()

  if (error) {
    if (isMissingTableError(error.message)) {
      throw new Error(
        'Bank statements table is missing. Run supabase/migrations/20250716_bank_statements.sql',
      )
    }
    throw new Error(`Failed to save bank statement: ${error.message}`)
  }

  const statementId = (statement as StatementRow).id

  if (input.transactions.length > 0) {
    const rows = input.transactions.map((txn, index) => ({
      statement_id: statementId,
      owner_id: userId,
      txn_date: txn.date,
      description: txn.description,
      amount: txn.amount,
      direction: txn.direction,
      balance: txn.balance ?? null,
      category: txn.category ?? null,
      reference: txn.reference ?? null,
      sort_order: index,
    }))

    const { error: txnError } = await supabase.from('bank_transactions').insert(rows)
    if (txnError) {
      await supabase.from('bank_statements').delete().eq('id', statementId)
      throw new Error(`Failed to save transactions: ${txnError.message}`)
    }
  }

  const saved = await getBankStatementForUser(userId, statementId)
  if (!saved) {
    throw new Error('Saved statement could not be reloaded')
  }
  return saved
}

export async function deleteBankStatementForUser(
  userId: string,
  statementId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('bank_statements')
    .delete()
    .eq('owner_id', userId)
    .eq('id', statementId)

  if (error) {
    throw new Error(`Failed to delete bank statement: ${error.message}`)
  }
}

function isMissingTableError(message: string): boolean {
  return (
    message.includes('bank_statements') &&
    (message.includes('schema cache') || message.includes('does not exist'))
  )
}
