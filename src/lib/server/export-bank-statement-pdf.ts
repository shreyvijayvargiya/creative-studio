import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { renderBankStatementPdfToBuffer } from '#/lib/bank-statements/export-pdf'
import { requireAuthUser } from '#/lib/server/require-auth-user'

const exportSchema = z.object({
  fileName: z.string().optional(),
  bankName: z.string().nullable().optional(),
  accountName: z.string().nullable().optional(),
  accountNumber: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  periodStart: z.string().nullable().optional(),
  periodEnd: z.string().nullable().optional(),
  openingBalance: z.number().nullable().optional(),
  closingBalance: z.number().nullable().optional(),
  transactions: z
    .array(
      z.object({
        id: z.string(),
        date: z.string(),
        description: z.string(),
        amount: z.number(),
        direction: z.enum(['debit', 'credit', 'unknown']),
        balance: z.number().nullable(),
        category: z.string().nullable(),
        reference: z.string().nullable(),
      }),
    )
    .min(1),
})

/** Server-side PDF export of the reviewed transactions table. */
export const exportBankStatementPdf = createServerFn({ method: 'POST' })
  .validator((data: unknown) => exportSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAuthUser()

    const pdfBuffer = await renderBankStatementPdfToBuffer({
      meta: {
        fileName: data.fileName,
        bankName: data.bankName ?? null,
        accountName: data.accountName ?? null,
        accountNumber: data.accountNumber ?? null,
        currency: data.currency ?? null,
        periodStart: data.periodStart ?? null,
        periodEnd: data.periodEnd ?? null,
        openingBalance: data.openingBalance ?? null,
        closingBalance: data.closingBalance ?? null,
      },
      transactions: data.transactions,
    })

    return {
      fileName: `${(data.fileName ?? 'bank-statement').replace(/\.pdf$/i, '')}-transactions.pdf`,
      pdfBase64: pdfBuffer.toString('base64'),
    }
  })
