import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { paypalRequest } from '#/lib/paypal/client'
import { ensurePayPalBillingPlan } from '#/lib/paypal/billing-plans'
import { syncPayPalSubscription } from '#/lib/paypal/subscription-sync'
import { isPayPalConfigured } from '#/lib/paypal/config'
import { getPlanById, isPaidPlanId } from '#/lib/stripe/plans'
import { requireAuthUser } from '#/lib/server/require-auth-user'
import { getSubscriptionForUser } from '#/lib/server/subscriptions-core'

const paypalCheckoutSchema = z.object({
  planId: z.string().refine(isPaidPlanId, 'Invalid subscription plan'),
  interval: z.enum(['month', 'year']),
})

export const createPayPalSubscription = createServerFn({ method: 'POST' })
  .validator((data: unknown) => paypalCheckoutSchema.parse(data))
  .handler(async ({ data }) => {
    if (!isPayPalConfigured()) {
      throw new Error('PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.')
    }

    const plan = getPlanById(data.planId)
    if (!plan) {
      throw new Error('Unknown subscription plan.')
    }

    const user = await requireAuthUser()
    const existing = await getSubscriptionForUser(user.id)

    if (
      existing.planId === data.planId &&
      existing.status === 'active' &&
      existing.paymentProvider === 'paypal'
    ) {
      throw new Error(`You are already on the ${plan.name} plan.`)
    }

    const paypalPlanId = await ensurePayPalBillingPlan(data.planId, data.interval)

    const subscription = await paypalRequest<{ id: string }>('/v1/billing/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: paypalPlanId,
        custom_id: user.id,
        application_context: {
          brand_name: 'Finance CRM',
          locale: 'en-AU',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
        },
      }),
    })

    return { subscriptionId: subscription.id }
  })

const activateSchema = z.object({
  subscriptionId: z.string().min(1),
})

export const activatePayPalSubscription = createServerFn({ method: 'POST' })
  .validator((data: unknown) => activateSchema.parse(data))
  .handler(async ({ data }) => {
    if (!isPayPalConfigured()) {
      throw new Error('PayPal is not configured.')
    }

    const user = await requireAuthUser()
    await syncPayPalSubscription(data.subscriptionId, user.id)

    return { ok: true as const }
  })
