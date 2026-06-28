import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { createPdfSigningSubmission } from '#/lib/docuseal/client'
import { renderAtoPdfToBuffer } from '#/lib/pdf/generate-ato'
import { requireAuthUser } from '#/lib/server/require-auth-user'
import { withCalculatedNetIncome } from '#/types'

const budgetRowSchema = z.object({
  id: z.string(),
  category: z.string(),
  amount: z.number(),
  taxRate: z.number(),
  notes: z.string(),
})

const atoTaxpayerSchema = z.object({
  tfn: z.string().min(8),
  isAustralianResident: z.boolean(),
  title: z.string(),
  surname: z.string().min(1),
  firstName: z.string().min(1),
  nameChanged: z.boolean(),
  postalAddress: z.string().min(1),
  suburb: z.string().min(1),
  state: z.string().min(1),
  postcode: z.string().length(4),
  homeAddressDifferent: z.boolean(),
  homeAddress: z.string(),
})

export const initiatePdfSigning = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z
      .object({
        rows: z.array(budgetRowSchema).min(1),
        taxpayer: atoTaxpayerSchema,
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireAuthUser()

    const rows = withCalculatedNetIncome(data.rows)
    const pdfBuffer = await renderAtoPdfToBuffer(rows, data.taxpayer)

    const submitterName =
      [data.taxpayer.title, data.taxpayer.firstName, data.taxpayer.surname]
        .filter(Boolean)
        .join(' ')
        .trim() || 'Taxpayer'

    const submission = await createPdfSigningSubmission(
      pdfBuffer,
      user.email ?? 'signer@example.com',
      submitterName,
    )

    return {
      submissionId: submission.submissionId,
      embedSrc: submission.embedSrc,
    }
  })
