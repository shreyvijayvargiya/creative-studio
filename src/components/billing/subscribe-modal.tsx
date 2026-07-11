import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '#/components/auth/auth-provider'
import { useLoginModal } from '#/components/auth/login-modal-provider'
import { SubscribePlanPayPalButton } from '#/components/billing/subscribe-plan-paypal-button'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import { isPayPalClientConfigured } from '#/lib/paypal/public-config'
import {
  createBillingPortalSession,
  createCheckoutSession,
} from '#/lib/server/create-checkout-session'
import { getSubscription } from '#/lib/server/get-subscription'
import {
  formatAud,
  getDisplayPrice,
  isPaidPlanId,
  SUBSCRIPTION_PLANS,
} from '#/lib/stripe/plans'
import { cn } from '#/lib/utils'
import {
  YEARLY_DISCOUNT_PERCENT,
  type BillingInterval,
  type PaymentProvider,
  type UserSubscription,
} from '#/types/subscription'

interface SubscribeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PlanCheckIcon({ featured }: { featured: boolean }) {
  return (
    <span
      className={cn(
        'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full',
        featured ? 'bg-background/15 text-background' : 'bg-foreground/10 text-foreground',
      )}
    >
      <Check className="size-2.5" strokeWidth={3} />
    </span>
  )
}

function PlanCards({
  currentPlanId,
  interval,
  paymentProvider,
  checkoutPlanId,
  isLoadingSubscription,
  onStripeUpgrade,
  onPayPalSuccess,
  onPayPalSessionActiveChange,
}: {
  currentPlanId: string
  interval: BillingInterval
  paymentProvider: PaymentProvider
  checkoutPlanId: string | null
  isLoadingSubscription: boolean
  onStripeUpgrade: (planId: string) => void
  onPayPalSuccess: () => void
  onPayPalSessionActiveChange: (active: boolean) => void
}) {
  if (isLoadingSubscription) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading your plan...
      </div>
    )
  }

  const cards = (
    <div className="grid gap-4 md:grid-cols-3">
      {SUBSCRIPTION_PLANS.map((plan) => {
        const isCurrent = currentPlanId === plan.id
        const featured = Boolean(plan.highlighted)
        const { amount, suffix, compareAt } = getDisplayPrice(plan.monthlyPriceAud, interval)

        return (
          <article
            key={plan.id}
            className={cn(
              'relative flex flex-col rounded-3xl border p-5 sm:p-6',
              featured
                ? 'border-foreground/20 bg-violet-600 text-white dark:text-white shadow-lg'
                : 'border-border bg-card text-foreground shadow-sm',
              isCurrent && !featured && 'ring-2 ring-primary/30',
              isCurrent && featured && 'ring-2 ring-background/40',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                <p
                  className={cn(
                    'mt-1 text-sm leading-5',
                    featured ? 'text-background/70' : 'text-muted-foreground',
                  )}
                >
                  {plan.description}
                </p>
              </div>
              {isCurrent ? (
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    featured ? 'bg-background text-foreground' : 'bg-muted text-foreground',
                  )}
                >
                  Current
                </span>
              ) : featured ? (
                <span className="shrink-0 rounded-full bg-background px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                  Most popular
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-2">
              <span className="text-4xl font-bold tracking-tight">{formatAud(amount)}</span>
              {compareAt !== null ? (
                <span
                  className={cn(
                    'pb-1 text-lg line-through',
                    featured ? 'text-background/45' : 'text-muted-foreground/70',
                  )}
                >
                  {formatAud(compareAt)}
                </span>
              ) : null}
              <span
                className={cn(
                  'pb-1 text-sm',
                  featured ? 'text-background/60' : 'text-muted-foreground',
                )}
              >
                {suffix}
              </span>
            </div>

            {isCurrent ? (
              <Button
                disabled
                variant={featured ? 'pricingMutedFeatured' : 'pricingMuted'}
                size="pricing"
                className="mt-5"
              >
                Current plan
              </Button>
            ) : plan.id === 'free' ? (
              <Button disabled variant="pricing" size="pricing" className="mt-5">
                Free tier
              </Button>
            ) : paymentProvider === 'paypal' ? (
              <SubscribePlanPayPalButton
                planId={plan.id}
                interval={interval}
                featured={featured}
                disabled={checkoutPlanId !== null}
                onSuccess={onPayPalSuccess}
                onSessionActiveChange={onPayPalSessionActiveChange}
              />
            ) : (
              <Button
                disabled={checkoutPlanId !== null}
                variant={featured ? 'pricingFeatured' : 'pricing'}
                size="pricing"
                className="mt-5"
                onClick={() => onStripeUpgrade(plan.id)}
              >
                {checkoutPlanId === plan.id ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </Button>
            )}

            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2.5 text-sm leading-5">
                  <PlanCheckIcon featured={featured} />
                  <span className={featured ? 'text-background/85' : 'text-muted-foreground'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
  )

  return cards
}

export function SubscribeModal({ open, onOpenChange }: SubscribeModalProps) {
  const { isAuthenticated } = useAuth()
  const { openLoginModal } = useLoginModal()
  const getSubscriptionFn = useStableServerFn(getSubscription)
  const createCheckoutSessionFn = useStableServerFn(createCheckoutSession)
  const createBillingPortalSessionFn = useStableServerFn(createBillingPortalSession)

  const [interval, setInterval] = useState<BillingInterval>('month')
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('stripe')
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null)
  const [paypalSessionActive, setPaypalSessionActive] = useState(false)

  const handlePayPalSessionActiveChange = useCallback((active: boolean) => {
    setPaypalSessionActive(active)
  }, [])

  const loadSubscription = () => {
    if (!isAuthenticated) {
      return
    }

    setIsLoading(true)
    void getSubscriptionFn()
      .then(setSubscription)
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to load plan'
        toast.error(message)
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (!open || !isAuthenticated) {
      if (!open) {
        setSubscription(null)
      }
      return
    }

    loadSubscription()
  }, [open, isAuthenticated, getSubscriptionFn])

  const currentPlanId = subscription?.planId ?? 'free'

  const handleStripeUpgrade = async (planId: string) => {
    if (!isPaidPlanId(planId)) {
      return
    }
    if (!isAuthenticated) {
      onOpenChange(false)
      openLoginModal()
      return
    }

    setCheckoutPlanId(planId)

    try {
      const { url } = await createCheckoutSessionFn({
        data: { planId, interval },
      })
      window.location.assign(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed'
      toast.error(message)
      setCheckoutPlanId(null)
    }
  }

  const handleManageBilling = async () => {
    if (subscription?.paymentProvider === 'paypal') {
      window.open('https://www.paypal.com/myaccount/autopay/', '_blank', 'noopener,noreferrer')
      return
    }

    try {
      const { url } = await createBillingPortalSessionFn()
      window.location.assign(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Billing portal failed'
      toast.error(message)
    }
  }

  const handleModalOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && paypalSessionActive) {
      return
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleModalOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-5xl"
        onEscapeKeyDown={(event) => {
          if (paypalSessionActive) {
            event.preventDefault()
          }
        }}
        onPointerDownOutside={(event) => {
          if (paypalSessionActive) {
            event.preventDefault()
          }
        }}
        onInteractOutside={(event) => {
          if (paypalSessionActive) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="flex items-center justify-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Upgrade your workspace
          </DialogTitle>
          <DialogDescription>
            Choose a plan and pay with Stripe or PayPal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3">
          <div className="flex w-fit items-center gap-1 rounded-full border border-border bg-muted/40 p-1">
            <Button
              type="button"
              variant={paymentProvider === 'stripe' ? 'pricingTabActive' : 'pricingTab'}
              size="pricingTab"
              onClick={() => setPaymentProvider('stripe')}
            >
              Stripe
            </Button>
            <Button
              type="button"
              variant={paymentProvider === 'paypal' ? 'pricingTabActive' : 'pricingTab'}
              size="pricingTab"
              onClick={() => setPaymentProvider('paypal')}
              disabled={!isPayPalClientConfigured()}
            >
              PayPal
            </Button>
          </div>

          <div className="flex w-fit items-center gap-1 rounded-full border border-border bg-muted/40 p-1">
            <Button
              type="button"
              variant={interval === 'month' ? 'pricingTabActive' : 'pricingTab'}
              size="pricingTab"
              onClick={() => setInterval('month')}
            >
              Monthly
            </Button>
            <Button
              type="button"
              variant={interval === 'year' ? 'pricingTabActive' : 'pricingTab'}
              size="pricingTab"
              className="gap-2"
              onClick={() => setInterval('year')}
            >
              Yearly
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                -{YEARLY_DISCOUNT_PERCENT}%
              </span>
            </Button>
          </div>
        </div>

        <PlanCards
          currentPlanId={currentPlanId}
          interval={interval}
          paymentProvider={paymentProvider}
          checkoutPlanId={checkoutPlanId}
          isLoadingSubscription={isLoading}
          onStripeUpgrade={(planId) => void handleStripeUpgrade(planId)}
          onPayPalSuccess={loadSubscription}
          onPayPalSessionActiveChange={handlePayPalSessionActiveChange}
        />

        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Payment methods</p>
            <p>
              {paymentProvider === 'stripe'
                ? 'Stripe Checkout — cards, Apple Pay, Google Pay.'
                : 'PayPal subscriptions — pay with your PayPal balance or linked card.'}
            </p>
          </div>
          {subscription && subscription.planId !== 'free' ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => void handleManageBilling()}
            >
              Manage billing
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
