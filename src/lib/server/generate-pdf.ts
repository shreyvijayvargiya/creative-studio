import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

import { renderFinancialPdfToBuffer } from '#/lib/pdf/generate'
import { getSupabaseAdmin } from '#/lib/supabase/admin'
import { withCalculatedNetIncome } from '#/types'

const budgetRowSchema = z.object({
  id: z.string(),
  category: z.string(),
  amount: z.number(),
  taxRate: z.number(),
  notes: z.string(),
})

export const generatePdf = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        rows: z.array(budgetRowSchema).min(1),
        signature: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    // TODO Phase 2: add auth check here

    const rows = withCalculatedNetIncome(data.rows)
    const pdfBuffer = await renderFinancialPdfToBuffer(rows, data.signature)

    const filename = `${uuidv4()}.pdf`
    const storagePath = filename
    const pin = String(Math.floor(1000 + Math.random() * 9000))

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

    const { error: insertError } = await supabaseAdmin
      .from('documents')
      .insert({
        name: `Financial Summary — ${new Date().toLocaleDateString('en-AU')}`,
        kind: 'pdf',
        storage_path: storagePath,
        share_pin: pin,
      })

    if (insertError) {
      throw new Error(`Failed to save document record: ${insertError.message}`)
    }

    return { filename, pin }
  })
