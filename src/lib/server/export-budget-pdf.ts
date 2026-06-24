import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { renderFinancialPdfToBuffer } from '#/lib/pdf/generate'
import { requireAuthUser } from '#/lib/server/require-auth-user'
import { getSupabaseAdmin } from '#/lib/supabase/admin'
import { withCalculatedNetIncome } from '#/types'
import type { BudgetRow } from '#/types'

function toPdfFilename(name: string): string {
  const safeName =
    name
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'document'
  return `${safeName}.pdf`
}

export const downloadDocumentPdf = createServerFn({ method: 'GET' })
  .validator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const user = await requireAuthUser()
    const supabaseAdmin = getSupabaseAdmin()

    const { data: record, error } = await supabaseAdmin
      .from('documents')
      .select('name, kind, storage_path, budget_data')
      .eq('id', data.id)
      .eq('owner_id', user.id)
      .single()

    if (error) {
      throw new Error('Document not found')
    }

    const name = record.name as string
    const kind = record.kind as string
    const filename = toPdfFilename(name)

    if (kind === 'pdf') {
      const { data: fileData, error: downloadError } =
        await supabaseAdmin.storage
          .from('documents')
          .download(record.storage_path as string)

      if (downloadError) {
        throw new Error(`Failed to download PDF: ${downloadError.message}`)
      }

      const arrayBuffer = await fileData.arrayBuffer()
      return {
        pdfBase64: Buffer.from(arrayBuffer).toString('base64'),
        filename,
      }
    }

    if (kind === 'budget') {
      const budgetData = record.budget_data as BudgetRow[] | null
      if (!budgetData?.length) {
        throw new Error('Budget data is empty')
      }

      const rows = withCalculatedNetIncome(budgetData)
      const pdfBuffer = await renderFinancialPdfToBuffer(rows)

      return {
        pdfBase64: pdfBuffer.toString('base64'),
        filename,
      }
    }

    throw new Error('Unsupported document type')
  })
