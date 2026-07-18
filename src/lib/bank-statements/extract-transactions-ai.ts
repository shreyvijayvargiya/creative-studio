import { v4 as uuidv4 } from 'uuid'

import type {
  BankStatementExtractResult,
  BankTransactionDirection,
  BankTransactionDraft,
} from '#/types/bank-statement'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

/** Free OpenRouter model for bank statement extraction (override via env). */
export function getBankExtractModel(): string {
  return (
    process.env.OPENROUTER_BANK_MODEL?.trim() ||
    process.env.OPENROUTER_MODEL?.trim() ||
    'openrouter/free'
  )
}

function getOpenRouterApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not configured. Add it to .env and restart the server.',
    )
  }
  return apiKey
}

const EXTRACTION_SYSTEM_PROMPT = `You are a bank statement parser for accounting software.
Extract structured transaction data from bank statement text.
Return ONLY valid JSON matching this schema (no markdown fences):
{
  "bankName": string|null,
  "accountName": string|null,
  "accountNumber": string|null,
  "currency": string|null,
  "periodStart": "YYYY-MM-DD"|null,
  "periodEnd": "YYYY-MM-DD"|null,
  "openingBalance": number|null,
  "closingBalance": number|null,
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": string,
      "amount": number,
      "direction": "debit"|"credit"|"unknown",
      "balance": number|null,
      "category": string|null,
      "reference": string|null
    }
  ]
}
Rules:
- amount is always a positive number
- direction: money out = debit, money in = credit
- Prefer ISO dates YYYY-MM-DD
- Skip headers, footers, and summary-only lines that are not real transactions
- If unsure about a field, use null
- Include every identifiable transaction row`

interface RawExtraction {
  bankName?: string | null
  accountName?: string | null
  accountNumber?: string | null
  currency?: string | null
  periodStart?: string | null
  periodEnd?: string | null
  openingBalance?: number | null
  closingBalance?: number | null
  transactions?: Array<{
    date?: string
    description?: string
    amount?: number | string
    direction?: string
    balance?: number | string | null
    category?: string | null
    reference?: string | null
  }>
}

export async function extractTransactionsWithAi(
  statementText: string,
): Promise<BankStatementExtractResult> {
  const model = getBankExtractModel()
  const apiKey = getOpenRouterApiKey()
  const siteUrl = process.env.APP_URL?.trim() ?? 'http://localhost:3000'

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl,
      'X-Title': 'Finance CRM Bank Extract',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Extract bank statement transactions as JSON.\n\nSTATEMENT TEXT:\n${statementText}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter extract failed (${response.status}): ${errorText}`)
  }

  const payload = (await response.json()) as {
    model?: string
    choices?: Array<{ message?: { content?: string | null } }>
  }

  const content = payload.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('OpenRouter returned an empty extraction response')
  }

  const parsed = parseExtractionJson(content)
  const transactions = normalizeTransactions(parsed.transactions ?? [])

  return {
    bankName: cleanString(parsed.bankName),
    accountName: cleanString(parsed.accountName),
    accountNumber: cleanString(parsed.accountNumber),
    currency: cleanString(parsed.currency) ?? 'AUD',
    periodStart: cleanDate(parsed.periodStart),
    periodEnd: cleanDate(parsed.periodEnd),
    openingBalance: cleanNumber(parsed.openingBalance),
    closingBalance: cleanNumber(parsed.closingBalance),
    transactions,
    rawTextPreview: statementText.slice(0, 1200),
    model: payload.model ?? model,
  }
}

function parseExtractionJson(content: string): RawExtraction {
  const trimmed = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(trimmed) as RawExtraction
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error('AI response was not valid JSON')
    }
    return JSON.parse(match[0]) as RawExtraction
  }
}

function normalizeTransactions(
  rows: NonNullable<RawExtraction['transactions']>,
): BankTransactionDraft[] {
  return rows
    .map((row) => {
      const amount = Math.abs(cleanNumber(row.amount) ?? 0)
      const description = cleanString(row.description) ?? ''
      const date = cleanDate(row.date) ?? ''

      if (!date && !description && amount === 0) {
        return null
      }

      return {
        id: uuidv4(),
        date: date || new Date().toISOString().slice(0, 10),
        description: description || 'Untitled transaction',
        amount,
        direction: normalizeDirection(row.direction, row.amount),
        balance: cleanNumber(row.balance),
        category: cleanString(row.category),
        reference: cleanString(row.reference),
      } satisfies BankTransactionDraft
    })
    .filter((row): row is BankTransactionDraft => row !== null)
}

function normalizeDirection(
  value: string | undefined,
  rawAmount: number | string | undefined,
): BankTransactionDirection {
  const normalized = (value ?? '').toLowerCase().trim()
  if (normalized === 'debit' || normalized === 'withdrawal' || normalized === 'out') {
    return 'debit'
  }
  if (normalized === 'credit' || normalized === 'deposit' || normalized === 'in') {
    return 'credit'
  }

  const numeric = typeof rawAmount === 'string' ? Number(rawAmount) : rawAmount
  if (typeof numeric === 'number' && !Number.isNaN(numeric)) {
    if (numeric < 0) return 'debit'
    if (numeric > 0) return 'credit'
  }

  return 'unknown'
}

function cleanString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function cleanNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function cleanDate(value: unknown): string | null {
  const text = cleanString(value)
  if (!text) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}
