import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getStripeClient } from '#/lib/stripe/client'
import { buildCheckoutLineItem } from '#/lib/stripe/checkout-price'
import { getAppUrl, isStripeConfigured } from '#/lib/stripe/config'
import { getPlanById, isPaidPlanId } from '#/lib/stripe/plans'
import { requireAuthUser } from '#/lib/server/require-auth-user'
import { getSubscriptionForUser } from '#/lib/server/subscriptions-core'

const checkoutSchema = z.object({
  planId: z.string().refine(isPaidPlanId, 'Invalid subscription plan'),
  interval: z.enum(['month', 'year']),
})

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .validator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.')
    }

    const plan = getPlanById(data.planId)
    if (!plan) {
      throw new Error('Unknown subscription plan.')
    }

    const user = await requireAuthUser()
    const existing = await getSubscriptionForUser(user.id)

    if (existing.planId === data.planId && existing.status === 'active') {
      throw new Error(`You are already on the ${plan.name} plan.`)
    }

    const stripe = getStripeClient()
    const appUrl = getAppUrl()
    const lineItem = buildCheckoutLineItem(plan, data.interval)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: existing.stripeCustomerId ?? undefined,
      customer_email: existing.stripeCustomerId ? undefined : (user.email ?? undefined),
      client_reference_id: user.id,
      line_items: [lineItem],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: data.planId,
          interval: data.interval,
        },
      },
      metadata: {
        userId: user.id,
        planId: data.planId,
        interval: data.interval,
      },
      success_url: `${appUrl}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard?subscription=canceled`,
    })

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL.')
    }

    return { url: session.url }
  })

export const createBillingPortalSession = createServerFn({ method: 'POST' }).handler(
  async () => {
    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured.')
    }

    const user = await requireAuthUser()
    const existing = await getSubscriptionForUser(user.id)

    if (!existing.stripeCustomerId) {
      throw new Error('No Stripe billing profile found. Subscribe to a paid plan first.')
    }

    const stripe = getStripeClient()
    const appUrl = getAppUrl()

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: existing.stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    })

    return { url: portalSession.url }
  },
)
