import { paypalRequest } from '#/lib/paypal/client'
import { getPlanById, getYearlyTotal } from '#/lib/stripe/plans'
import type { BillingInterval } from '#/types/subscription'

const PAYPAL_CURRENCY = 'AUD'

const planIdCache = new Map<string, string>()
const paypalPlanToAppPlan = new Map<string, { planId: string; interval: BillingInterval }>()
const planCreationPromises = new Map<string, Promise<string>>()

function cacheKey(planId: string, interval: BillingInterval): string {
  return `${planId}:${interval}`
}

export function resolveAppPlanFromPayPalPlanId(
  paypalPlanId: string,
): { planId: string; interval: BillingInterval } | null {
  return paypalPlanToAppPlan.get(paypalPlanId) ?? null
}

function formatPayPalAmount(amountAud: number): string {
  return amountAud.toFixed(2)
}

function rememberPayPalPlan(
  appPlanId: string,
  interval: BillingInterval,
  paypalPlanId: string,
): string {
  planIdCache.set(cacheKey(appPlanId, interval), paypalPlanId)
  paypalPlanToAppPlan.set(paypalPlanId, { planId: appPlanId, interval })
  return paypalPlanId
}

async function ensurePayPalProduct(planName: string, description: string): Promise<string> {
  const product = await paypalRequest<{ id: string }>('/v1/catalogs/products', {
    method: 'POST',
    body: JSON.stringify({
      name: `Finance CRM ${planName}`,
      description,
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  })

  return product.id
}

async function activatePayPalPlanIfNeeded(paypalPlanId: string): Promise<void> {
  const plan = await paypalRequest<{ status: string }>(
    `/v1/billing/plans/${paypalPlanId}`,
    { method: 'GET' },
  )

  if (plan.status === 'ACTIVE') {
    return
  }

  if (plan.status !== 'CREATED' && plan.status !== 'INACTIVE') {
    throw new Error(`PayPal plan ${paypalPlanId} is in unexpected status: ${plan.status}`)
  }

  try {
    await paypalRequest(`/v1/billing/plans/${paypalPlanId}/activate`, {
      method: 'POST',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('PLAN_STATUS_INVALID') || message.includes('already active')) {
      return
    }
    throw error
  }
}

async function createPayPalBillingPlan(
  planId: string,
  interval: BillingInterval,
): Promise<string> {
  const plan = getPlanById(planId)
  if (!plan || plan.monthlyPriceAud <= 0) {
    throw new Error(`Invalid paid plan: ${planId}`)
  }

  const productId = await ensurePayPalProduct(plan.name, plan.description)
  const isYearly = interval === 'year'
  const amountAud = isYearly ? getYearlyTotal(plan.monthlyPriceAud) : plan.monthlyPriceAud

  const billingPlan = await paypalRequest<{ id: string; status?: string }>('/v1/billing/plans', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId,
      name: `Finance CRM ${plan.name} ${isYearly ? 'Yearly' : 'Monthly'}`,
      description: plan.description,
      billing_cycles: [
        {
          frequency: {
            interval_unit: isYearly ? 'YEAR' : 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: formatPayPalAmount(amountAud),
              currency_code: PAYPAL_CURRENCY,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  })

  if (billingPlan.status !== 'ACTIVE') {
    await activatePayPalPlanIfNeeded(billingPlan.id)
  }

  return rememberPayPalPlan(planId, interval, billingPlan.id)
}

export async function ensurePayPalBillingPlan(
  planId: string,
  interval: BillingInterval,
): Promise<string> {
  const key = cacheKey(planId, interval)
  const cached = planIdCache.get(key)
  if (cached) {
    return cached
  }

  const inflight = planCreationPromises.get(key)
  if (inflight) {
    return inflight
  }

  const promise = createPayPalBillingPlan(planId, interval).finally(() => {
    planCreationPromises.delete(key)
  })

  planCreationPromises.set(key, promise)
  return promise
}
