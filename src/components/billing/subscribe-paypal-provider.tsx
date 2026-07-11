import { PayPalProvider } from '@paypal/react-paypal-js/sdk-v6'
import { useMemo } from 'react'

import {
  getPublicPayPalClientId,
  getPublicPayPalEnvironment,
  isPayPalClientConfigured,
} from '#/lib/paypal/public-config'

interface SubscribePayPalProviderProps {
  children: React.ReactNode
  /** Keep SDK mounted even when modal UI toggles. */
  forceMount?: boolean
}

export function SubscribePayPalProvider({
  children,
  forceMount = false,
}: SubscribePayPalProviderProps) {
  const clientId = getPublicPayPalClientId()
  const environment = getPublicPayPalEnvironment()

  const providerProps = useMemo(
    () => ({
      clientId: clientId ?? '',
      environment,
      components: ['paypal-subscriptions'] as ['paypal-subscriptions'],
      pageType: 'checkout' as const,
    }),
    [clientId, environment],
  )

  if (!isPayPalClientConfigured() || !clientId) {
    if (forceMount) {
      return <>{children}</>
    }

    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        PayPal is not configured. Add VITE_PAYPAL_CLIENT_ID to your environment.
      </p>
    )
  }

  return <PayPalProvider {...providerProps}>{children}</PayPalProvider>
}
