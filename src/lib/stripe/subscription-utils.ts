import type Stripe from 'stripe'

import { isPaidPlanId } from '#/lib/stripe/plans'
import type { BillingInterval, SubscriptionPlanId } from '#/types/subscription'

export function resolvePlanFromStripeSubscription(
  subscription: Stripe.Subscription,
): { planId: SubscriptionPlanId; billingInterval: BillingInterval | null } {
  const metadataPlan = subscription.metadata?.planId
  const metadataInterval = subscription.metadata?.interval
  const price = subscription.items.data[0]?.price
  const stripeInterval = price?.recurring?.interval

  const billingInterval: BillingInterval | null =
    metadataInterval === 'year' || metadataInterval === 'month'
      ? metadataInterval
      : stripeInterval === 'year'
        ? 'year'
        : stripeInterval === 'month'
          ? 'month'
          : null

  if (metadataPlan && isPaidPlanId(metadataPlan)) {
    return { planId: metadataPlan, billingInterval }
  }

  const productPlanId = price?.metadata?.planId
  if (productPlanId && isPaidPlanId(productPlanId)) {
    return { planId: productPlanId, billingInterval }
  }

  return { planId: 'free', billingInterval }
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'unpaid' {
  switch (status) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
      return 'past_due'
    case 'canceled':
      return 'canceled'
    case 'unpaid':
      return 'unpaid'
    default:
      return 'incomplete'
  }
}

export function stripeTimestampToIso(value: number | null | undefined): string | null {
  if (!value) return null
  return new Date(value * 1000).toISOString()
}
