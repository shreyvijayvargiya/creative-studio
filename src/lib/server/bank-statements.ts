import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { extractTextFromPdfBuffer } from '#/lib/bank-statements/extract-pdf-text'
import { extractTransactionsWithAi } from '#/lib/bank-statements/extract-transactions-ai'
import { downloadS3ObjectBuffer } from '#/lib/s3/download'
import {
  deleteBankStatementForUser,
  getBankStatementForUser,
  listBankStatementsForUser,
  saveBankStatementForUser,
} from '#/lib/server/bank-statements-core'
import { requireAuthUser } from '#/lib/server/require-auth-user'

const MAX_PDF_BYTES = 8 * 1024 * 1024

const extractFromBase64Schema = z.object({
  fileName: z.string().min(1).max(255),
  /** Base64-encoded PDF bytes (legacy / fallback) */
  pdfBase64: z.string().min(1),
})

const extractFromS3Schema = z.object({
  fileName: z.string().min(1).max(255),
  /** S3 object key from Better Upload */
  objectKey: z.string().min(1),
})

const transactionSchema = z.object({
  date: z.string().min(1),
  description: z.string(),
  amount: z.number(),
  direction: z.enum(['debit', 'credit', 'unknown']),
  balance: z.number().nullable().optional(),
  category: z.string().nullable().optional(),
  reference: z.string().nullable().optional(),
})

const saveSchema = z.object({
  fileName: z.string().min(1),
  bankName: z.string().nullable().optional(),
  accountName: z.string().nullable().optional(),
  accountNumber: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  periodStart: z.string().nullable().optional(),
  periodEnd: z.string().nullable().optional(),
  openingBalance: z.number().nullable().optional(),
  closingBalance: z.number().nullable().optional(),
  /** S3 object key (preferred) */
  storagePath: z.string().nullable().optional(),
  transactions: z.array(transactionSchema).min(1),
})

function decodePdfBase64(pdfBase64: string): Buffer {
  const cleaned = pdfBase64.replace(/^data:application\/pdf;base64,/i, '')
  const buffer = Buffer.from(cleaned, 'base64')
  if (buffer.byteLength === 0) {
    throw new Error('PDF file is empty')
  }
  if (buffer.byteLength > MAX_PDF_BYTES) {
    throw new Error('PDF is too large (max 8MB)')
  }
  return buffer
}

async function runExtraction(pdfBuffer: Buffer) {
  const text = await extractTextFromPdfBuffer(pdfBuffer)
  const extracted = await extractTransactionsWithAi(text)

  if (extracted.transactions.length === 0) {
    throw new Error(
      'No transactions were found in this PDF. Try another statement or edit rows manually after a blank extract.',
    )
  }

  return extracted
}

/** Preferred: download PDF from S3 key → AI extract. */
export const extractBankStatementFromS3 = createServerFn({ method: 'POST' })
  .validator((data: unknown) => extractFromS3Schema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireAuthUser()

    if (!data.objectKey.startsWith(`bank-statements/${user.id}/`)) {
      throw new Error('Invalid bank statement object key')
    }

    const pdfBuffer = await downloadS3ObjectBuffer(data.objectKey)
    if (pdfBuffer.byteLength > MAX_PDF_BYTES) {
      throw new Error('PDF is too large (max 8MB)')
    }

    return runExtraction(pdfBuffer)
  })

/** Legacy fallback: PDF bytes → extracted transactions. */
export const extractBankStatement = createServerFn({ method: 'POST' })
  .validator((data: unknown) => extractFromBase64Schema.parse(data))
  .handler(async ({ data }) => {
    await requireAuthUser()
    const pdfBuffer = decodePdfBase64(data.pdfBase64)
    return runExtraction(pdfBuffer)
  })

export const saveBankStatement = createServerFn({ method: 'POST' })
  .validator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireAuthUser()

    return saveBankStatementForUser(user.id, {
      fileName: data.fileName,
      bankName: data.bankName ?? null,
      accountName: data.accountName ?? null,
      accountNumber: data.accountNumber ?? null,
      currency: data.currency ?? null,
      periodStart: data.periodStart ?? null,
      periodEnd: data.periodEnd ?? null,
      openingBalance: data.openingBalance ?? null,
      closingBalance: data.closingBalance ?? null,
      storagePath: data.storagePath ?? null,
      transactions: data.transactions,
    })
  })

export const listBankStatements = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await requireAuthUser()
    return listBankStatementsForUser(user.id)
  },
)

export const getBankStatement = createServerFn({ method: 'GET' })
  .validator((data: unknown) =>
    z.object({ statementId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireAuthUser()
    const statement = await getBankStatementForUser(user.id, data.statementId)
    if (!statement) {
      throw new Error('Bank statement not found')
    }
    return statement
  })

export const deleteBankStatement = createServerFn({ method: 'POST' })
  .validator((data: unknown) =>
    z.object({ statementId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const user = await requireAuthUser()
    await deleteBankStatementForUser(user.id, data.statementId)
    return { ok: true as const }
  })
