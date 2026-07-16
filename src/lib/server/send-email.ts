import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  sendTransactionalEmail,
  sendWelcomeEmailIfNewUser,
} from '#/lib/email/send-transactional'
import { requireAuthUser } from '#/lib/server/require-auth-user'
import type { BillingInterval, SubscriptionPlanId } from '#/types/subscription'

const sendEmailSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('welcome'),
    to: z.string().email().optional(),
    name: z.string().nullable().optional(),
  }),
  z.object({
    kind: z.literal('subscription_confirmed'),
    to: z.string().email(),
    name: z.string().nullable().optional(),
    planId: z.string().optional(),
    planName: z.string().optional(),
    billingInterval: z.enum(['month', 'year']).nullable().optional(),
    periodEnd: z.string().nullable().optional(),
  }),
  z.object({
    kind: z.literal('custom'),
    to: z.string().email(),
    subject: z.string().min(1),
    html: z.string().min(1),
    text: z.string().optional(),
  }),
])

const notifyWelcomeSchema = z.object({
  createdAt: z.string().optional(),
})

/** Authenticated server API for Autosend SMTP transactional emails. */
export const sendEmail = createServerFn({ method: 'POST' })
  .validator((data: unknown) => sendEmailSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await requireAuthUser()

    if (data.kind === 'welcome') {
      return sendTransactionalEmail({
        kind: 'welcome',
        to: data.to ?? user.email ?? '',
        name: data.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name,
      })
    }

    if (data.kind === 'subscription_confirmed') {
      return sendTransactionalEmail({
        kind: 'subscription_confirmed',
        to: data.to,
        name: data.name,
        planId: data.planId as SubscriptionPlanId | undefined,
        planName: data.planName,
        billingInterval: data.billingInterval as BillingInterval | null | undefined,
        periodEnd: data.periodEnd,
      })
    }

    return sendTransactionalEmail({
      kind: 'custom',
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    })
  })

/** Call after login/signup — only sends when the auth user was created recently. */
export const notifyWelcomeEmail = createServerFn({ method: 'POST' })
  .validator((data: unknown) => notifyWelcomeSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const user = await requireAuthUser()

    await sendWelcomeEmailIfNewUser({
      userId: user.id,
      email: user.email,
      name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        (user.user_metadata?.username as string | undefined) ??
        null,
      createdAt: data.createdAt ?? user.created_at,
    })

    return { ok: true as const }
  })
