const PAYEES_TABLE_HINT =
  'Run `npm run db:payees` (set SUPABASE_DB_URL in .env) or execute supabase/migrations/20250707_payees.sql in the Supabase SQL Editor.'

export function formatPayeesError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (
    message.includes('payees') &&
    (message.includes('schema cache') ||
      message.includes('does not exist') ||
      message.includes('Could not find the table'))
  ) {
    return `Payees table is not set up yet. ${PAYEES_TABLE_HINT}`
  }

  return message.startsWith('Failed to') ? message : `Failed to save payee: ${message}`
}
