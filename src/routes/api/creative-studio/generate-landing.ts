import { createFileRoute } from '@tanstack/react-router'

import {
  generateLandingSchema,
  runLandingPageGeneration,
  runLandingThemeList,
} from '#/lib/server/creative-studio-landing'

export const Route = createFileRoute('/api/creative-studio/generate-landing')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const themes = await runLandingThemeList()
          return new Response(JSON.stringify({ themes }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Could not read landing themes'
          console.error('[api/creative-studio/generate-landing]', message)
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
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

        const parsed = generateLandingSchema.safeParse(body)
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
          const result = await runLandingPageGeneration(parsed.data)
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Landing page generation failed'
          console.error('[api/creative-studio/generate-landing]', message)
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
