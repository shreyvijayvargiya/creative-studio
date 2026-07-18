import { createFileRoute } from '@tanstack/react-router'

import {
  generateSchema,
  runCreativeGeneration,
} from '#/lib/server/creative-studio'
import { requireAuthUser } from '#/lib/server/require-auth-user'

/**
 * HTTP endpoint for Creative Studio asset generation.
 * Accepts JSON (base64 image + options). Requires an authenticated session.
 */
export const Route = createFileRoute('/api/creative-studio/generate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          await requireAuthUser()
        } catch {
          return new Response(JSON.stringify({ error: 'You must be signed in' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const parsed = generateSchema.safeParse(body)
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
          const result = await runCreativeGeneration(parsed.data)
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Generation failed'
          console.error('[api/creative-studio/generate]', message)
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
