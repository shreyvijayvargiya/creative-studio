import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { requireAuthUser } from '#/lib/server/require-auth-user'
import { getSupabaseAdmin } from '#/lib/supabase/admin'

export const deleteDocument = createServerFn({ method: 'POST' })
  .validator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const user = await requireAuthUser()
    const supabaseAdmin = getSupabaseAdmin()

    const { data: record, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('id, kind, storage_path, owner_id')
      .eq('id', data.id)
      .eq('owner_id', user.id)
      .single()

    if (fetchError || !record) {
      throw new Error('Document not found')
    }

    if (record.kind === 'pdf') {
      const { error: storageError } = await supabaseAdmin.storage
        .from('documents')
        .remove([record.storage_path as string])

      if (storageError) {
        throw new Error(`Failed to delete PDF file: ${storageError.message}`)
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', data.id)
      .eq('owner_id', user.id)

    if (deleteError) {
      throw new Error(`Failed to delete document: ${deleteError.message}`)
    }

    return { id: data.id }
  })
