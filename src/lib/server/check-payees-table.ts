import { createServerFn } from '@tanstack/react-start'

import { requireAuthUser } from '#/lib/server/require-auth-user'
import { getSupabaseAdmin } from '#/lib/supabase/admin'

export const checkPayeesTable = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAuthUser()

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('payees').select('id').limit(1)

    if (!error) {
      return { ready: true as const }
    }

    const message = error.message ?? 'Unknown error'
    const missingTable =
      message.includes('schema cache') ||
      message.includes('does not exist') ||
      message.includes('Could not find the table')

    return {
      ready: false as const,
      missingTable,
      message: missingTable
        ? 'The payees table has not been created in Supabase yet.'
        : message,
    }
  },
)
