import { YEARLY_DISCOUNT_PERCENT, type SubscriptionPlanDefinition } from '#/types/subscription'

/** Single source of truth for plan prices — edit here, no Stripe price IDs needed. */
export const SUBSCRIPTION_PLANS: SubscriptionPlanDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'For solo practitioners getting started with digital workflows.',
    monthlyPriceAud: 0,
    features: [
      'Budget planner & ATO PDF generation',
      'Document library',
      'E-sign via DocuSeal',
      '100MB storage',
    ],
  },
  {
    id: 'bf5d934b-da7c-4861-a427-6dcf2b211cff',
    name: 'Pro',
    description: 'For growing practices that need more volume and Drive sync.',
    monthlyPriceAud: 29,
    features: [
      'Everything in Free',
      'Google Drive backup',
      'Priority document storage',
      'Email support',
    ],
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For small firms coordinating multiple clients and users.',
    monthlyPriceAud: 79,
    features: [
      'Everything in Pro',
      'Multi-user workspace (coming soon)',
      'Shared document folders',
      'Dedicated onboarding',
    ],
  },
]

export function getPlanById(planId: string): SubscriptionPlanDefinition | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId)
}

export function getPaidPlans(): SubscriptionPlanDefinition[] {
  return SUBSCRIPTION_PLANS.filter((plan) => plan.monthlyPriceAud > 0)
}

export function isPaidPlanId(planId: string): boolean {
  return getPaidPlans().some((plan) => plan.id === planId)
}

export function formatAud(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getYearlyMonthlyEquivalent(monthlyPriceAud: number): number {
  const yearlyTotal = monthlyPriceAud * 12 * (1 - YEARLY_DISCOUNT_PERCENT / 100)
  return Math.round(yearlyTotal / 12)
}

export function getYearlyTotal(monthlyPriceAud: number): number {
  return Math.round(monthlyPriceAud * 12 * (1 - YEARLY_DISCOUNT_PERCENT / 100))
}

export function getDisplayPrice(
  monthlyPriceAud: number,
  interval: 'month' | 'year',
): { amount: number; suffix: string; compareAt: number | null } {
  if (monthlyPriceAud === 0) {
    return { amount: 0, suffix: 'forever', compareAt: null }
  }

  if (interval === 'year') {
    return {
      amount: getYearlyMonthlyEquivalent(monthlyPriceAud),
      suffix: '/mo billed yearly',
      compareAt: monthlyPriceAud,
    }
  }

  return { amount: monthlyPriceAud, suffix: '/month', compareAt: null }
}
