import type Stripe from 'stripe'

import { getStripeClient } from '#/lib/stripe/client'
import {
  mapStripeSubscriptionStatus,
  resolvePlanFromStripeSubscription,
  stripeTimestampToIso,
} from '#/lib/stripe/subscription-utils'
import {
  getSubscriptionByStripeSubscriptionId,
  upsertSubscriptionForUser,
} from '#/lib/server/subscriptions-core'

async function syncStripeSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: string,
): Promise<void> {
  const userId =
    subscription.metadata?.userId ??
    fallbackUserId ??
    (await getSubscriptionByStripeSubscriptionId(subscription.id))?.userId

  if (!userId) {
    console.warn('[stripe] subscription sync skipped — missing userId', subscription.id)
    return
  }

  const { planId, billingInterval } = resolvePlanFromStripeSubscription(subscription)
  const status = mapStripeSubscriptionStatus(subscription.status)
  const isPaidActive = status === 'active' || status === 'trialing'

  await upsertSubscriptionForUser({
    userId,
    planId: isPaidActive ? planId : 'free',
    billingInterval: isPaidActive ? billingInterval : null,
    status,
    paymentProvider: 'stripe',
    stripeCustomerId:
      typeof subscription.customer === 'string'
        ? subscription.customer
        : (subscription.customer?.id ?? null),
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price?.id ?? null,
    currentPeriodStart: stripeTimestampToIso(subscription.current_period_start),
    currentPeriodEnd: stripeTimestampToIso(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  })
}

export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  const stripe = getStripeClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription' || !session.subscription) {
        return
      }

      const subscription = await stripe.subscriptions.retrieve(
        String(session.subscription),
      )

      await syncStripeSubscription(subscription, session.metadata?.userId ?? session.client_reference_id ?? undefined)
      return
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await syncStripeSubscription(subscription)
      return
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId =
        subscription.metadata?.userId ??
        (await getSubscriptionByStripeSubscriptionId(subscription.id))?.userId

      if (!userId) return

      await upsertSubscriptionForUser({
        userId,
        planId: 'free',
        billingInterval: null,
        status: 'canceled',
        paymentProvider: 'stripe',
        stripeCustomerId:
          typeof subscription.customer === 'string'
            ? subscription.customer
            : (subscription.customer?.id ?? null),
        stripeSubscriptionId: null,
        stripePriceId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })
      return
    }

    default:
      return
  }
}
