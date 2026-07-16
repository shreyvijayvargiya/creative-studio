import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { sendTransactionalEmail } from '#/lib/email/send-transactional'

const bodySchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('welcome'),
    to: z.string().email(),
    name: z.string().nullable().optional(),
  }),
  z.object({
    kind: z.literal('subscription_confirmed'),
    to: z.string().email(),
    name: z.string().nullable().optional(),
    planId: z.string().optional(),
    planName: z.string().optional(),
    billingInterval: z.enum(['month', 'year']).nullable().optional(),
    periodEnd: z.string().nullable().optional(),
  }),
  z.object({
    kind: z.literal('custom'),
    to: z.string().email(),
    subject: z.string().min(1),
    html: z.string().min(1),
    text: z.string().optional(),
  }),
])

/**
 * Server-side Autosend SMTP email API.
 * Prefer calling `#/lib/email/send-transactional` from webhooks;
 * this route is available for HTTP clients / tooling.
 */
export const Route = createFileRoute('/api/email/send')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.EMAIL_API_SECRET?.trim()
        if (secret) {
          const header = request.headers.get('x-email-api-secret')
          if (header !== secret) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            })
          }
        }

        let json: unknown
        try {
          json = await request.json()
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const parsed = bodySchema.safeParse(json)
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ error: 'Invalid payload', details: parsed.error.flatten() }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        const result = await sendTransactionalEmail(parsed.data)

        return new Response(JSON.stringify(result), {
          status: result.ok ? 200 : 500,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
