import {
  calculateTax,
  calculateTaxWithRate,
  type TaxCalculationType,
} from '#/lib/ai/tax-calculator'
import { documentAction, payeeAction } from '#/lib/ai/tool-trace-actions'
import {
  createPayeeForUser,
  deletePayeeForUser,
  findPayeeForUser,
  listPayeesForUser,
  updatePayeeForUser,
} from '#/lib/server/payees-core'
import { getSupabaseAdmin } from '#/lib/supabase/admin'
import { mapDocumentRow } from '#/lib/server/list-documents-utils'
import type { AiAssistantToolTrace } from '#/types/ai'

export const AI_TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'calculate_tax',
      description:
        'Calculate GST or income tax estimates for an amount in AUD. Use gst for tax on ex-GST amount, gst_inclusive to extract GST from total, income_tax_estimate for Australian resident bracket estimate, or provide tax_rate_percent for a flat rate.',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Dollar amount in AUD' },
          calculation_type: {
            type: 'string',
            enum: ['gst', 'gst_inclusive', 'income_tax_estimate'],
          },
          tax_rate_percent: {
            type: 'number',
            description: 'Optional flat rate % instead of brackets',
          },
        },
        required: ['amount'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_payees',
      description: 'List all payees (clients/vendors) for the signed-in user.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_payee',
      description: 'Create a new payee.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          abn: { type: 'string' },
          phone: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_payee',
      description: 'Update an existing payee by name or id.',
      parameters: {
        type: 'object',
        properties: {
          payee_name: { type: 'string', description: 'Name to search (case-insensitive)' },
          payee_id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          abn: { type: 'string' },
          phone: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'delete_payee',
      description: 'Delete a payee by name or id. Only when user explicitly asks.',
      parameters: {
        type: 'object',
        properties: {
          payee_name: { type: 'string' },
          payee_id: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_documents',
      description: 'List recent documents in the user workspace (budgets and PDFs).',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max items, default 10' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_workspace_summary',
      description: 'Get counts of documents and payees for the user.',
      parameters: { type: 'object', properties: {} },
    },
  },
]

async function listDocumentsForUser(userId: string, limit = 10) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('documents')
    .select('id, name, kind, storage_path, share_pin, created_at, drive_url')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to list documents: ${error.message}`)
  }

  return (data ?? []).map(mapDocumentRow)
}

export async function executeAiTool(
  userId: string,
  toolName: string,
  args: Record<string, unknown>,
): Promise<{ result: unknown; trace: AiAssistantToolTrace }> {
  try {
    switch (toolName) {
      case 'calculate_tax': {
        const amount = Number(args.amount)
        if (!Number.isFinite(amount)) {
          throw new Error('amount must be a number')
        }

        const rate = args.tax_rate_percent
        const result =
          rate !== undefined && rate !== null
            ? calculateTaxWithRate(amount, Number(rate))
            : calculateTax(
                amount,
                (args.calculation_type as TaxCalculationType | undefined) ?? 'gst',
              )

        return {
          result,
          trace: {
            toolName,
            summary: `Calculated ${result.type} on $${amount.toLocaleString('en-AU')}`,
            success: true,
          },
        }
      }

      case 'list_payees': {
        const payees = await listPayeesForUser(userId)
        return {
          result: { payees, count: payees.length },
          trace: {
            toolName,
            summary: `Listed ${payees.length} payee${payees.length === 1 ? '' : 's'}`,
            success: true,
            action: {
              label: 'View all payees',
              to: '/payees',
              kind: 'payees',
            },
          },
        }
      }

      case 'create_payee': {
        const name = String(args.name ?? '').trim()
        if (!name) throw new Error('name is required')

        const payee = await createPayeeForUser(userId, {
          name,
          email: args.email ? String(args.email) : null,
          abn: args.abn ? String(args.abn) : null,
          phone: args.phone ? String(args.phone) : null,
          notes: args.notes ? String(args.notes) : null,
        })

        return {
          result: { payee },
          trace: {
            toolName,
            summary: `Created payee "${payee.name}"`,
            success: true,
            action: payeeAction(payee),
          },
        }
      }

      case 'update_payee': {
        const payeeId = args.payee_id ? String(args.payee_id) : undefined
        const payeeName = args.payee_name ? String(args.payee_name) : undefined

        let resolvedId = payeeId
        if (!resolvedId && payeeName) {
          const found = await findPayeeForUser(userId, payeeName)
          if (!found) throw new Error(`No payee found matching "${payeeName}"`)
          resolvedId = found.id
        }

        if (!resolvedId) throw new Error('payee_id or payee_name is required')

        const payee = await updatePayeeForUser(userId, resolvedId, {
          name: args.name !== undefined ? String(args.name) : undefined,
          email: args.email !== undefined ? String(args.email) : undefined,
          abn: args.abn !== undefined ? String(args.abn) : undefined,
          phone: args.phone !== undefined ? String(args.phone) : undefined,
          notes: args.notes !== undefined ? String(args.notes) : undefined,
        })

        return {
          result: { payee },
          trace: {
            toolName,
            summary: `Updated payee "${payee.name}"`,
            success: true,
            action: payeeAction(payee),
          },
        }
      }

      case 'delete_payee': {
        const payeeId = args.payee_id ? String(args.payee_id) : undefined
        const payeeName = args.payee_name ? String(args.payee_name) : undefined

        let resolvedId = payeeId
        if (!resolvedId && payeeName) {
          const found = await findPayeeForUser(userId, payeeName)
          if (!found) throw new Error(`No payee found matching "${payeeName}"`)
          resolvedId = found.id
        }

        if (!resolvedId) throw new Error('payee_id or payee_name is required')

        const deleted = await deletePayeeForUser(userId, resolvedId)
        return {
          result: { deleted },
          trace: {
            toolName,
            summary: `Deleted payee "${deleted.name}"`,
            success: true,
          },
        }
      }

      case 'list_documents': {
        const limit = args.limit ? Number(args.limit) : 10
        const documents = await listDocumentsForUser(userId, limit)
        return {
          result: { documents, count: documents.length },
          trace: {
            toolName,
            summary: `Listed ${documents.length} document${documents.length === 1 ? '' : 's'}`,
            success: true,
            action: {
              label: 'View documents',
              to: '/documents',
              kind: 'documents',
            },
          },
        }
      }

      case 'get_workspace_summary': {
        const [payees, documents] = await Promise.all([
          listPayeesForUser(userId),
          listDocumentsForUser(userId, 100),
        ])

        const pdfCount = documents.filter((doc) => doc.kind === 'pdf').length
        const budgetCount = documents.filter((doc) => doc.kind === 'budget').length

        return {
          result: {
            documentCount: documents.length,
            pdfCount,
            budgetCount,
            payeeCount: payees.length,
          },
          trace: {
            toolName,
            summary: 'Loaded workspace summary',
            success: true,
            action: {
              label: 'View documents',
              to: '/documents',
              kind: 'documents',
            },
          },
        }
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tool execution failed'
    return {
      result: { error: message },
      trace: { toolName, summary: message, success: false },
    }
  }
}
