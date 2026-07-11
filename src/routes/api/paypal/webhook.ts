import { createFileRoute } from '@tanstack/react-router'

import { handlePayPalWebhookEvent } from '#/lib/server/paypal-webhook-handler'

export const Route = createFileRoute('/api/paypal/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text()

        try {
          await handlePayPalWebhookEvent(request.headers, body)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Handler failed'
          console.error('[paypal webhook handler]', message)
          return new Response(`Handler Error: ${message}`, { status: 500 })
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
