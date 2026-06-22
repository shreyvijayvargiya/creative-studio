import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { z } from 'zod'

import { getSupabaseAdmin } from '#/lib/supabase/admin'

const viewPdfInputSchema = z.object({
  filename: z.string().min(1),
  pin: z.string().min(4).max(4),
})

export const viewPdf = createServerFn({ method: 'GET' })
  .validator((data: unknown) => viewPdfInputSchema.parse(data))
  .handler(async ({ data }) => {
    // TODO Phase 2: add auth check here

    const supabaseAdmin = getSupabaseAdmin()

    const { data: record, error } = await supabaseAdmin
      .from('documents')
      .select('storage_path, share_pin')
      .eq('storage_path', data.filename)
      .single()

    if (error) {
      setResponseStatus(404)
      throw new Error('Document not found')
    }

    if (record.share_pin !== data.pin) {
      setResponseStatus(403)
      throw new Error('Incorrect PIN')
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabaseAdmin.storage
        .from('documents')
        .createSignedUrl(record.storage_path, 300)

    if (signedUrlError) {
      throw new Error(`Failed to create signed URL: ${signedUrlError.message}`)
    }

    if (!signedUrlData.signedUrl) {
      throw new Error('Failed to create signed URL')
    }

    return { url: signedUrlData.signedUrl }
  })
