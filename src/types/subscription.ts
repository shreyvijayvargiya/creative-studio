export type SubscriptionPlanId = string
export type BillingInterval = 'month' | 'year'
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'unpaid'

export interface UserSubscription {
  userId: string
  planId: SubscriptionPlanId
  billingInterval: BillingInterval | null
  status: SubscriptionStatus
  paymentProvider: 'stripe' | 'paypal'
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

export interface SubscriptionPlanDefinition {
  id: SubscriptionPlanId
  name: string
  description: string
  monthlyPriceAud: number
  features: string[]
  highlighted?: boolean
}

export const YEARLY_DISCOUNT_PERCENT = 20
