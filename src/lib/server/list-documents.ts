import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getSupabaseAdmin } from '#/lib/supabase/admin'
import type { BudgetRow, DocumentKind, DocumentListItem } from '#/types'

export const listDocuments = createServerFn({ method: 'GET' }).handler(
  async () => {
    // TODO Phase 2: add auth check here

    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('id, name, kind, storage_path, share_pin, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to load documents: ${error.message}`)
    }

    return data.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      kind: row.kind as DocumentKind,
      storagePath: row.storage_path as string,
      sharePin: row.share_pin as string,
      createdAt: row.created_at as string,
      pinProtected:
        (row.kind as DocumentKind) === 'pdf' &&
        (row.share_pin as string) !== '----',
    })) satisfies DocumentListItem[]
  },
)

export const getDocument = createServerFn({ method: 'GET' })
  .validator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    // TODO Phase 2: add auth check here

    const supabaseAdmin = getSupabaseAdmin()

    const { data: record, error } = await supabaseAdmin
      .from('documents')
      .select(
        'id, name, kind, storage_path, share_pin, budget_data, created_at',
      )
      .eq('id', data.id)
      .single()

    if (error) {
      throw new Error('Document not found')
    }

    return {
      id: record.id as string,
      name: record.name as string,
      kind: record.kind as DocumentKind,
      storagePath: record.storage_path as string,
      sharePin: record.share_pin as string,
      budgetData: (record.budget_data as BudgetRow[] | null) ?? null,
      createdAt: record.created_at as string,
    }
  })
