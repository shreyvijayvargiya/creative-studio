import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

import { getSupabaseAdmin } from '#/lib/supabase/admin'
import { withCalculatedNetIncome } from '#/types'

const budgetRowSchema = z.object({
  id: z.string(),
  category: z.string(),
  amount: z.number(),
  taxRate: z.number(),
  notes: z.string(),
})

const saveBudgetDocumentSchema = z.object({
  rows: z.array(budgetRowSchema).min(1),
  name: z.string().min(1).optional(),
})

export const saveBudgetDocument = createServerFn({ method: 'POST' })
  .validator((data: unknown) => saveBudgetDocumentSchema.parse(data))
  .handler(async ({ data }) => {
    // TODO Phase 2: add auth check here

    const rows = withCalculatedNetIncome(data.rows)
    const supabaseAdmin = getSupabaseAdmin()
    const name =
      data.name ??
      `Budget Planner — ${new Date().toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`

    const { data: record, error } = await supabaseAdmin
      .from('documents')
      .insert({
        name,
        kind: 'budget',
        storage_path: `budget/${uuidv4()}.json`,
        share_pin: '----',
        budget_data: rows,
      })
      .select('id, name')
      .single()

    if (error) {
      throw new Error(`Failed to save budget document: ${error.message}`)
    }

    return { id: record.id as string, name: record.name as string }
  })
