import type Stripe from 'stripe'

import { getYearlyTotal } from '#/lib/stripe/plans'
import type { BillingInterval, SubscriptionPlanDefinition } from '#/types/subscription'

/**
 * Stripe Checkout currency only — UI pricing copy stays AUD/display as-is.
 * INR avoids India individual-account export blocks while testing.
 */
const STRIPE_CURRENCY = 'inr'

function toStripeMinorUnits(amount: number): number {
  return Math.round(amount * 100)
}

/** Build a Checkout line item from hardcoded plan prices — no Stripe Dashboard price IDs. */
export function buildCheckoutLineItem(
  plan: SubscriptionPlanDefinition,
  interval: BillingInterval,
): Stripe.Checkout.SessionCreateParams.LineItem {
  if (plan.monthlyPriceAud <= 0) {
    throw new Error(`Plan "${plan.name}" is not a paid plan.`)
  }

  if (interval === 'month') {
    return {
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: {
          name: `Finance CRM ${plan.name}`,
          description: plan.description,
          metadata: {
            planId: plan.id,
          },
        },
        unit_amount: toStripeMinorUnits(plan.monthlyPriceAud),
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }
  }

  const yearlyAud = getYearlyTotal(plan.monthlyPriceAud)

  return {
    price_data: {
      currency: STRIPE_CURRENCY,
      product_data: {
        name: `Finance CRM ${plan.name} (Yearly)`,
        description: `${plan.description} — billed yearly.`,
        metadata: {
          planId: plan.id,
        },
      },
      unit_amount: toStripeMinorUnits(yearlyAud),
      recurring: { interval: 'year' },
    },
    quantity: 1,
  }
}
