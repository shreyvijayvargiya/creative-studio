import { useCallback, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { usePayPalSubscriptionPaymentSession } from '@paypal/react-paypal-js/sdk-v6'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import {
  activatePayPalSubscription,
  createPayPalSubscription,
} from '#/lib/server/create-paypal-subscription'
import { getPlanById } from '#/lib/stripe/plans'
import { cn } from '#/lib/utils'
import type { BillingInterval } from '#/types/subscription'

interface SubscribePlanPayPalButtonProps {
  planId: string
  interval: BillingInterval
  featured?: boolean
  disabled?: boolean
  onSuccess?: () => void
  onSessionActiveChange?: (active: boolean) => void
}

export function SubscribePlanPayPalButton({
  planId,
  interval,
  featured = false,
  disabled = false,
  onSuccess,
  onSessionActiveChange,
}: SubscribePlanPayPalButtonProps) {
  const createPayPalSubscriptionFn = useStableServerFn(createPayPalSubscription)
  const activatePayPalSubscriptionFn = useStableServerFn(activatePayPalSubscription)
  const pendingSubscriptionIdRef = useRef<string | null>(null)
  const planName = getPlanById(planId)?.name ?? 'plan'

  const createSubscription = useCallback(async () => {
    const { subscriptionId } = await createPayPalSubscriptionFn({
      data: { planId, interval },
    })
    pendingSubscriptionIdRef.current = subscriptionId
    return { subscriptionId }
  }, [createPayPalSubscriptionFn, interval, planId])

  const { handleClick, isPending, error } = usePayPalSubscriptionPaymentSession({
    presentationMode: 'popup',
    createSubscription,
    onApprove: async (data) => {
      onSessionActiveChange?.(false)

      const subscriptionId =
        pendingSubscriptionIdRef.current ??
        ('subscriptionId' in data && typeof data.subscriptionId === 'string'
          ? data.subscriptionId
          : 'subscriptionID' in data && typeof data.subscriptionID === 'string'
            ? data.subscriptionID
            : null)

      if (!subscriptionId) {
        toast.error('PayPal did not return a subscription id.')
        return
      }

      try {
        await activatePayPalSubscriptionFn({ data: { subscriptionId } })
        toast.success('Subscription activated with PayPal!')
        onSuccess?.()
      } catch (activateError) {
        const message =
          activateError instanceof Error ? activateError.message : 'Activation failed'
        toast.error(message)
      }
    },
    onCancel: () => {
      onSessionActiveChange?.(false)
      toast.message('PayPal checkout canceled.')
    },
    onError: (paypalError) => {
      onSessionActiveChange?.(false)
      const message =
        paypalError instanceof Error
          ? paypalError.message
          : 'PayPal checkout failed. Please try again.'
      toast.error(message)
    },
  })

  useEffect(() => {
    onSessionActiveChange?.(isPending)
  }, [isPending, onSessionActiveChange])

  const startCheckout = () => {
    onSessionActiveChange?.(true)
    void handleClick()
  }

  if (error) {
    return (
      <p
        className={cn(
          'mt-5 text-center text-xs',
          featured ? 'text-background/70' : 'text-muted-foreground',
        )}
      >
        PayPal unavailable right now.
      </p>
    )
  }

  return (
    <Button
      type="button"
      disabled={disabled || isPending}
      variant={featured ? 'pricingFeatured' : 'pricing'}
      size="pricing"
      className="mt-5"
      onClick={startCheckout}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Opening PayPal...
        </>
      ) : (
        `Upgrade to ${planName}`
      )}
    </Button>
  )
}
