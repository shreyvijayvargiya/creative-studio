import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { requireAuthUser } from '#/lib/server/require-auth-user'
import { getSupabaseAdmin } from '#/lib/supabase/admin'
import type { BudgetRow, DocumentKind, DocumentListItem } from '#/types'

const LIST_COLUMNS =
  'id, name, kind, storage_path, share_pin, created_at, drive_url'
const LIST_COLUMNS_FALLBACK =
  'id, name, kind, storage_path, share_pin, created_at'
const DETAIL_COLUMNS =
  'id, name, kind, storage_path, share_pin, budget_data, created_at, drive_url'
const DETAIL_COLUMNS_FALLBACK =
  'id, name, kind, storage_path, share_pin, budget_data, created_at'

function isMissingDriveColumnError(message: string): boolean {
  return message.includes('drive_file_id') || message.includes('drive_url')
}

function mapDocumentRow(row: {
  id: unknown
  name: unknown
  kind: unknown
  storage_path: unknown
  share_pin: unknown
  created_at: unknown
  drive_url?: unknown
}): DocumentListItem {
  const kind = row.kind as DocumentKind

  return {
    id: row.id as string,
    name: row.name as string,
    kind,
    storagePath: row.storage_path as string,
    sharePin: row.share_pin as string,
    createdAt: row.created_at as string,
    pinProtected: kind === 'pdf' && (row.share_pin as string) !== '----',
    driveUrl: (row.drive_url as string | null) ?? null,
  }
}

export const listDocuments = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await requireAuthUser()
    const supabaseAdmin = getSupabaseAdmin()

    let result = await supabaseAdmin
      .from('documents')
      .select(LIST_COLUMNS)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (result.error && isMissingDriveColumnError(result.error.message)) {
      result = await supabaseAdmin
        .from('documents')
        .select(LIST_COLUMNS_FALLBACK)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
    }

    if (result.error) {
      throw new Error(`Failed to load documents: ${result.error.message}`)
    }

    return result.data.map(mapDocumentRow)
  },
)

export const getDocument = createServerFn({ method: 'GET' })
  .validator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const user = await requireAuthUser()
    const supabaseAdmin = getSupabaseAdmin()

    let result = await supabaseAdmin
      .from('documents')
      .select(DETAIL_COLUMNS)
      .eq('id', data.id)
      .eq('owner_id', user.id)
      .single()

    if (result.error && isMissingDriveColumnError(result.error.message)) {
      result = await supabaseAdmin
        .from('documents')
        .select(DETAIL_COLUMNS_FALLBACK)
        .eq('id', data.id)
        .eq('owner_id', user.id)
        .single()
    }

    if (result.error) {
      throw new Error('Document not found')
    }

    const record = result.data

    return {
      id: record.id as string,
      name: record.name as string,
      kind: record.kind as DocumentKind,
      storagePath: record.storage_path as string,
      sharePin: record.share_pin as string,
      budgetData: (record.budget_data as BudgetRow[] | null) ?? null,
      createdAt: record.created_at as string,
      driveUrl: (record.drive_url as string | null) ?? null,
    }
  })
