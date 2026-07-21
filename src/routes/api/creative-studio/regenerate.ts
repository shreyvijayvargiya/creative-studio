import { createFileRoute } from '@tanstack/react-router'

import {
  regenerateSchema,
  runCreativeRegeneration,
} from '#/lib/server/creative-studio'
// DEMO: public regenerate endpoint — restore auth later
// import { requireAuthUser } from '#/lib/server/require-auth-user'

/**
 * HTTP endpoint for regenerating a single Creative Studio asset with an edit prompt.
 * DEMO: no auth required.
 */
export const Route = createFileRoute('/api/creative-studio/regenerate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const parsed = regenerateSchema.safeParse(body)
        if (!parsed.success) {
          return new Response(
            JSON.stringify({
              error: 'Validation failed',
              details: parsed.error.flatten(),
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        try {
          const result = await runCreativeRegeneration(parsed.data)
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Regeneration failed'
          console.error('[api/creative-studio/regenerate]', message)
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
