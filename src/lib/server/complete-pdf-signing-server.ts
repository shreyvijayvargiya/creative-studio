import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

import { fetchSignedPdfBuffer } from '#/lib/docuseal/client'
import {
  getDefaultDriveRedirectOrigin,
  uploadPdfToUserGoogleDriveSafe,
} from '#/lib/google-drive/user-upload'
import { requireAuthUser } from '#/lib/server/require-auth-user'
import { getSupabaseAdmin } from '#/lib/supabase/admin'

export async function completePdfSigningOnServer(submissionId: number): Promise<{
  id: string
  filename: string
  pin: string
  driveUrl: string | null
}> {
  const user = await requireAuthUser()

  const pdfBuffer = await fetchSignedPdfBuffer(submissionId)

  const filename = `${uuidv4()}.pdf`
  const storagePath = filename
  const pin = String(Math.floor(1000 + Math.random() * 9000))
  const documentName = `ATO Tax Return 2025 — ${new Date().toLocaleDateString('en-AU')}`

  const driveResult = await uploadPdfToUserGoogleDriveSafe(
    user.id,
    pdfBuffer,
    `ATO-Tax-Return-2025-${new Date().toISOString().slice(0, 10)}.pdf`,
    getDefaultDriveRedirectOrigin(),
  )

  const supabaseAdmin = getSupabaseAdmin()

  const { error: uploadError } = await supabaseAdmin.storage
    .from('documents')
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Failed to upload PDF: ${uploadError.message}`)
  }

  const baseRecord = {
    name: documentName,
    kind: 'pdf' as const,
    storage_path: storagePath,
    share_pin: pin,
    owner_id: user.id,
  }

  const driveRecord =
    driveResult != null
      ? {
          ...baseRecord,
          drive_file_id: driveResult.fileId,
          drive_url: driveResult.webViewLink,
        }
      : baseRecord

  let record: { id: string } | null = null
  let insertError: { message: string } | null = null

  const firstAttempt = await supabaseAdmin
    .from('documents')
    .insert(driveRecord)
    .select('id')
    .single()

  if (firstAttempt.error) {
    const missingDriveColumns =
      driveResult != null &&
      firstAttempt.error.message.includes('drive_file_id')

    if (missingDriveColumns) {
      const fallbackAttempt = await supabaseAdmin
        .from('documents')
        .insert(baseRecord)
        .select('id')
        .single()

      record = fallbackAttempt.data as { id: string } | null
      insertError = fallbackAttempt.error
    } else {
      insertError = firstAttempt.error
    }
  } else {
    record = firstAttempt.data as { id: string }
  }

  if (insertError || !record) {
    throw new Error(
      `Failed to save document record: ${insertError?.message ?? 'Unknown error'}`,
    )
  }

  return {
    id: record.id,
    filename,
    pin,
    driveUrl: driveResult?.webViewLink ?? null,
  }
}

export const completePdfSigningInputSchema = z.object({
  submissionId: z.number().int().positive(),
})
