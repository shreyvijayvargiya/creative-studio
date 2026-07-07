import { createFileRoute } from '@tanstack/react-router'

import { getStripeWebhookSecret } from '#/lib/stripe/config'
import { getStripeClient } from '#/lib/stripe/client'
import { handleStripeWebhookEvent } from '#/lib/server/stripe-webhook-handler'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get('stripe-signature')

        if (!signature) {
          return new Response('Missing stripe-signature header', { status: 400 })
        }

        let event

        try {
          const body = await request.text()
          const stripe = getStripeClient()
          event = stripe.webhooks.constructEvent(
            body,
            signature,
            getStripeWebhookSecret(),
          )
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Invalid webhook'
          console.error('[stripe webhook]', message)
          return new Response(`Webhook Error: ${message}`, { status: 400 })
        }

        try {
          await handleStripeWebhookEvent(event)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Handler failed'
          console.error('[stripe webhook handler]', message)
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
