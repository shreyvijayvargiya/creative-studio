import { paypalRequest } from '#/lib/paypal/client'
import { resolveAppPlanFromPayPalPlanId } from '#/lib/paypal/billing-plans'
import { upsertSubscriptionForUser } from '#/lib/server/subscriptions-core'
import type { SubscriptionStatus } from '#/types/subscription'

interface PayPalSubscriptionResponse {
  id: string
  status: string
  plan_id: string
  custom_id?: string
  billing_info?: {
    next_billing_time?: string
    last_payment?: {
      time?: string
    }
  }
}

function mapPayPalStatus(status: string): SubscriptionStatus {
  switch (status) {
    case 'ACTIVE':
      return 'active'
    case 'APPROVAL_PENDING':
    case 'APPROVED':
      return 'incomplete'
    case 'SUSPENDED':
      return 'past_due'
    case 'CANCELLED':
    case 'EXPIRED':
      return 'canceled'
    default:
      return 'incomplete'
  }
}

export async function syncPayPalSubscription(
  subscriptionId: string,
  fallbackUserId?: string,
): Promise<void> {
  const subscription = await paypalRequest<PayPalSubscriptionResponse>(
    `/v1/billing/subscriptions/${subscriptionId}`,
  )

  const userId = subscription.custom_id ?? fallbackUserId
  if (!userId) {
    console.warn('[paypal] subscription sync skipped — missing userId', subscriptionId)
    return
  }

  const mappedPlan = resolveAppPlanFromPayPalPlanId(subscription.plan_id)
  if (!mappedPlan && subscription.status === 'ACTIVE') {
    console.warn('[paypal] subscription sync skipped — unknown plan', subscription.plan_id)
    return
  }

  const status = mapPayPalStatus(subscription.status)
  const isPaidActive = status === 'active' && mappedPlan !== null

  await upsertSubscriptionForUser({
    userId,
    planId: isPaidActive ? mappedPlan.planId : 'free',
    billingInterval: isPaidActive ? mappedPlan.interval : null,
    status,
    paymentProvider: 'paypal',
    paypalSubscriptionId: subscription.id,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    currentPeriodStart: subscription.billing_info?.last_payment?.time ?? null,
    currentPeriodEnd: subscription.billing_info?.next_billing_time ?? null,
    cancelAtPeriodEnd: subscription.status === 'CANCELLED',
  })
}
