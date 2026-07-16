import { sendViaAutosendSmtp } from '#/lib/email/autosend-smtp'
import { isAutosendSmtpConfigured } from '#/lib/email/config'
import {
  buildSubscriptionConfirmedEmailHtml,
  buildWelcomeEmailHtml,
} from '#/lib/email/templates'
import { getSupabaseAdmin } from '#/lib/supabase/admin'
import { formatAud, getPlanById, getYearlyTotal } from '#/lib/stripe/plans'
import type { BillingInterval, SubscriptionPlanId } from '#/types/subscription'

export type SendEmailKind = 'welcome' | 'subscription_confirmed' | 'custom'

export interface SendEmailRequest {
  kind: SendEmailKind
  to: string
  name?: string | null
  subject?: string
  html?: string
  text?: string
  planId?: SubscriptionPlanId
  planName?: string
  billingInterval?: BillingInterval | null
  periodEnd?: string | null
}

export async function sendTransactionalEmail(
  input: SendEmailRequest,
): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
  if (!isAutosendSmtpConfigured()) {
    return { ok: false, error: 'AUTOSEND_SMTP_KEY is not configured' }
  }

  if (!input.to?.trim()) {
    return { ok: false, error: 'Recipient email is required' }
  }

  try {
    const payload = resolveEmailPayload(input)
    const result = await sendViaAutosendSmtp({
      to: input.to.trim(),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    })

    return { ok: true, messageId: result.messageId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email'
    console.error('[email] send failed', message)
    return { ok: false, error: message }
  }
}

function resolveEmailPayload(input: SendEmailRequest): {
  subject: string
  html: string
  text?: string
} {
  if (input.kind === 'custom') {
    if (!input.subject || !input.html) {
      throw new Error('Custom emails require subject and html')
    }
    return {
      subject: input.subject,
      html: input.html,
      text: input.text,
    }
  }

  if (input.kind === 'welcome') {
    return buildWelcomeEmailHtml({ name: input.name })
  }

  const plan = input.planId ? getPlanById(input.planId) : undefined
  const planName = input.planName ?? plan?.name ?? 'your plan'
  const amountLabel =
    plan && plan.monthlyPriceAud > 0
      ? input.billingInterval === 'year'
        ? `${formatAud(getYearlyTotal(plan.monthlyPriceAud))} / year`
        : `${formatAud(plan.monthlyPriceAud)} / month`
      : null

  return buildSubscriptionConfirmedEmailHtml({
    name: input.name,
    planName,
    billingInterval: input.billingInterval,
    amountLabel,
    periodEnd: input.periodEnd,
  })
}

export async function sendWelcomeEmailForUser(userId: string): Promise<void> {
  const profile = await getProfileEmail(userId)
  if (!profile?.email) {
    console.warn('[email] welcome skipped — no email for user', userId)
    return
  }

  const result = await sendTransactionalEmail({
    kind: 'welcome',
    to: profile.email,
    name: profile.fullName ?? profile.username,
  })

  if (!result.ok) {
    console.warn('[email] welcome failed', result.error)
  }
}

export async function sendWelcomeEmailIfNewUser(input: {
  userId: string
  email?: string | null
  name?: string | null
  createdAt?: string | null
}): Promise<void> {
  if (!isRecentlyCreated(input.createdAt)) {
    return
  }

  const to = input.email?.trim() || (await getProfileEmail(input.userId))?.email
  if (!to) {
    console.warn('[email] welcome skipped — no email for user', input.userId)
    return
  }

  const result = await sendTransactionalEmail({
    kind: 'welcome',
    to,
    name: input.name,
  })

  if (!result.ok) {
    console.warn('[email] welcome failed', result.error)
  }
}

export async function sendSubscriptionConfirmedEmailForUser(input: {
  userId: string
  planId: SubscriptionPlanId
  billingInterval?: BillingInterval | null
  periodEnd?: string | null
}): Promise<void> {
  const profile = await getProfileEmail(input.userId)
  if (!profile?.email) {
    console.warn('[email] subscription email skipped — no email', input.userId)
    return
  }

  const result = await sendTransactionalEmail({
    kind: 'subscription_confirmed',
    to: profile.email,
    name: profile.fullName ?? profile.username,
    planId: input.planId,
    billingInterval: input.billingInterval,
    periodEnd: input.periodEnd,
  })

  if (!result.ok) {
    console.warn('[email] subscription email failed', result.error)
  }
}

async function getProfileEmail(
  userId: string,
): Promise<{ email: string; fullName: string | null; username: string | null } | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('profiles')
    .select('email, full_name, username')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data?.email) {
    return null
  }

  return {
    email: data.email as string,
    fullName: (data.full_name as string | null) ?? null,
    username: (data.username as string | null) ?? null,
  }
}

function isRecentlyCreated(createdAt?: string | null): boolean {
  if (!createdAt) return false
  const createdMs = new Date(createdAt).getTime()
  if (Number.isNaN(createdMs)) return false
  return Date.now() - createdMs < 15 * 60 * 1000
}
