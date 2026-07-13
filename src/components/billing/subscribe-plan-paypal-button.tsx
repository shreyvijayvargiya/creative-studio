import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { useStableServerFn } from '#/hooks/use-stable-server-fn'
import { createPayPalSubscription } from '#/lib/server/create-paypal-subscription'
import { getPlanById } from '#/lib/stripe/plans'
import type { BillingInterval } from '#/types/subscription'

interface SubscribePlanPayPalButtonProps {
  planId: string
  interval: BillingInterval
  featured?: boolean
  disabled?: boolean
  onSuccess?: () => void
  onSessionActiveChange?: (active: boolean) => void
}

/**
 * Uses PayPal's REST approve URL (full-page redirect) instead of the JS SDK
 * subscription "cart ID" flow, which fails often with PaymentFlowError /
 * invalid_client mismatches during local + live testing.
 */
export function SubscribePlanPayPalButton({
  planId,
  interval,
  featured = false,
  disabled = false,
  onSessionActiveChange,
}: SubscribePlanPayPalButtonProps) {
  const createPayPalSubscriptionFn = useStableServerFn(createPayPalSubscription)
  const [isStarting, setIsStarting] = useState(false)
  const startedRef = useRef(false)
  const planName = getPlanById(planId)?.name ?? 'plan'

  const startCheckout = async () => {
    if (startedRef.current) {
      return
    }

    startedRef.current = true
    setIsStarting(true)
    onSessionActiveChange?.(true)

    try {
      const { approveUrl } = await createPayPalSubscriptionFn({
        data: { planId, interval },
      })
      window.location.assign(approveUrl)
    } catch (error) {
      startedRef.current = false
      setIsStarting(false)
      onSessionActiveChange?.(false)
      const message =
        error instanceof Error
          ? error.message
          : 'PayPal checkout failed. Please try again.'
      toast.error(message)
    }
  }

  return (
    <Button
      type="button"
      disabled={disabled || isStarting}
      variant={featured ? 'pricingFeatured' : 'pricing'}
      size="pricing"
      className="mt-5"
      onClick={() => void startCheckout()}
    >
      {isStarting ? (
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
