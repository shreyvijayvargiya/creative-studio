import { syncPayPalSubscription } from '#/lib/paypal/subscription-sync'
import { getPayPalWebhookId } from '#/lib/paypal/config'
import { paypalRequest } from '#/lib/paypal/client'

interface PayPalWebhookEvent {
  id: string
  event_type: string
  resource: {
    id?: string
    custom_id?: string
  }
}

async function verifyPayPalWebhook(headers: Headers, body: string): Promise<boolean> {
  const webhookId = getPayPalWebhookId()
  if (!webhookId) {
    console.warn('[paypal webhook] PAYPAL_WEBHOOK_ID not set — skipping verification')
    return true
  }

  const transmissionId = headers.get('paypal-transmission-id')
  const transmissionTime = headers.get('paypal-transmission-time')
  const certUrl = headers.get('paypal-cert-url')
  const authAlgo = headers.get('paypal-auth-algo')
  const transmissionSig = headers.get('paypal-transmission-sig')

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false
  }

  try {
    const result = await paypalRequest<{ verification_status: string }>(
      '/v1/notifications/verify-webhook-signature',
      {
        method: 'POST',
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: JSON.parse(body),
        }),
      },
    )

    return result.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('[paypal webhook] verification failed', error)
    return false
  }
}

export async function handlePayPalWebhookEvent(
  headers: Headers,
  body: string,
): Promise<void> {
  const verified = await verifyPayPalWebhook(headers, body)
  if (!verified) {
    throw new Error('PayPal webhook signature verification failed')
  }

  const event = JSON.parse(body) as PayPalWebhookEvent
  const subscriptionId = event.resource?.id

  if (!subscriptionId) {
    return
  }

  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
    case 'BILLING.SUBSCRIPTION.UPDATED':
    case 'BILLING.SUBSCRIPTION.RE-ACTIVATED':
    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
    case 'BILLING.SUBSCRIPTION.EXPIRED':
      await syncPayPalSubscription(subscriptionId, event.resource.custom_id)
      return

    default:
      return
  }
}
