import { createServerFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'
import { z } from 'zod'

import {
  PDF_SIGNED_URL_TTL_SECONDS,
  getSignedUrlExpiryDate,
} from '#/lib/pdf/share'
import { getSupabaseAdmin } from '#/lib/supabase/admin'

export const previewDocumentPdf = createServerFn({ method: 'GET' })
  .validator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    // TODO Phase 2: restrict preview to document owner via auth session

    const supabaseAdmin = getSupabaseAdmin()

    const { data: record, error } = await supabaseAdmin
      .from('documents')
      .select('storage_path, kind, name')
      .eq('id', data.id)
      .single()

    if (error) {
      setResponseStatus(404)
      throw new Error('Document not found')
    }

    if (record.kind !== 'pdf') {
      setResponseStatus(400)
      throw new Error('Only generated PDF documents can be previewed here')
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabaseAdmin.storage
        .from('documents')
        .createSignedUrl(
          record.storage_path as string,
          PDF_SIGNED_URL_TTL_SECONDS,
        )

    if (signedUrlError) {
      throw new Error(`Failed to create signed URL: ${signedUrlError.message}`)
    }

    if (!signedUrlData.signedUrl) {
      throw new Error('Failed to create signed URL')
    }

    return {
      url: signedUrlData.signedUrl,
      expiresAt: getSignedUrlExpiryDate(PDF_SIGNED_URL_TTL_SECONDS).toISOString(),
      name: record.name as string,
    }
  })
