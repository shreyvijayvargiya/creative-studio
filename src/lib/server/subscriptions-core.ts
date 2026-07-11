import type {
  BillingInterval,
  SubscriptionPlanId,
  SubscriptionStatus,
  UserSubscription,
} from '#/types/subscription'
import { getSupabaseAdmin } from '#/lib/supabase/admin'

interface SubscriptionRow {
  user_id: string
  plan_id: string
  billing_interval: string | null
  status: string
  payment_provider: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  paypal_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export function mapSubscriptionRow(row: SubscriptionRow): UserSubscription {
  return {
    userId: row.user_id,
    planId: row.plan_id as SubscriptionPlanId,
    billingInterval: (row.billing_interval as BillingInterval | null) ?? null,
    status: row.status as SubscriptionStatus,
    paymentProvider: row.payment_provider as 'stripe' | 'paypal',
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripePriceId: row.stripe_price_id,
    paypalSubscriptionId: row.paypal_subscription_id,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function getDefaultSubscription(userId: string): UserSubscription {
  const now = new Date().toISOString()
  return {
    userId,
    planId: 'free',
    billingInterval: null,
    status: 'active',
    paymentProvider: 'stripe',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    paypalSubscriptionId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  }
}

export async function getSubscriptionForUser(
  userId: string,
): Promise<UserSubscription> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (
      error.message.includes('user_subscriptions') &&
      (error.message.includes('schema cache') ||
        error.message.includes('does not exist'))
    ) {
      return getDefaultSubscription(userId)
    }
    throw new Error(`Failed to load subscription: ${error.message}`)
  }

  return data ? mapSubscriptionRow(data as SubscriptionRow) : getDefaultSubscription(userId)
}

export interface UpsertSubscriptionInput {
  userId: string
  planId: SubscriptionPlanId
  billingInterval?: BillingInterval | null
  status: SubscriptionStatus
  paymentProvider?: 'stripe' | 'paypal'
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  stripePriceId?: string | null
  paypalSubscriptionId?: string | null
  currentPeriodStart?: string | null
  currentPeriodEnd?: string | null
  cancelAtPeriodEnd?: boolean
}

export async function upsertSubscriptionForUser(
  input: UpsertSubscriptionInput,
): Promise<UserSubscription> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert(
      {
        user_id: input.userId,
        plan_id: input.planId,
        billing_interval: input.billingInterval ?? null,
        status: input.status,
        payment_provider: input.paymentProvider ?? 'stripe',
        stripe_customer_id: input.stripeCustomerId ?? null,
        stripe_subscription_id: input.stripeSubscriptionId ?? null,
        stripe_price_id: input.stripePriceId ?? null,
        paypal_subscription_id: input.paypalSubscriptionId ?? null,
        current_period_start: input.currentPeriodStart ?? null,
        current_period_end: input.currentPeriodEnd ?? null,
        cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single()

  if (error) {
    throw new Error(`Failed to save subscription: ${error.message}`)
  }

  return mapSubscriptionRow(data as SubscriptionRow)
}

export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string,
): Promise<UserSubscription | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to find subscription: ${error.message}`)
  }

  return data ? mapSubscriptionRow(data as SubscriptionRow) : null
}

export async function getSubscriptionByPayPalSubscriptionId(
  paypalSubscriptionId: string,
): Promise<UserSubscription | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('paypal_subscription_id', paypalSubscriptionId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to find subscription: ${error.message}`)
  }

  return data ? mapSubscriptionRow(data as SubscriptionRow) : null
}
