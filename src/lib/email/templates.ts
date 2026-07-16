import { getEmailAppUrl } from '#/lib/email/config'

export function buildWelcomeEmailHtml(input: {
  name?: string | null
}): { subject: string; html: string; text: string } {
  const name = input.name?.trim() || 'there'
  const appUrl = getEmailAppUrl()
  const subject = 'Welcome to Finance CRM'

  const html = `
<!DOCTYPE html>
<html>
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
  <body style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;">
    <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">BuildSAAS</p>
      <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">Welcome, ${escapeHtml(name)}</h1>
      <p style="margin:0 0 16px;">Your Finance CRM account is ready. Start by exploring your dashboard, documents, and budgeting tools.</p>
      <p style="margin:0 0 24px;">
        <a href="${appUrl}/dashboard" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
          Open dashboard
        </a>
      </p>
      <p style="margin:0;font-size:14px;color:#6b7280;">If you did not create this account, you can ignore this email.</p>
    </div>
  </body>
</html>`.trim()

  const text = `Welcome, ${name}!\n\nYour Finance CRM account is ready.\nOpen your dashboard: ${appUrl}/dashboard\n`

  return { subject, html, text }
}

export function buildSubscriptionConfirmedEmailHtml(input: {
  name?: string | null
  planName: string
  billingInterval?: string | null
  amountLabel?: string | null
  periodEnd?: string | null
}): { subject: string; html: string; text: string } {
  const name = input.name?.trim() || 'there'
  const appUrl = getEmailAppUrl()
  const intervalLabel =
    input.billingInterval === 'year'
      ? 'yearly'
      : input.billingInterval === 'month'
        ? 'monthly'
        : null
  const subject = `Subscription confirmed — ${input.planName}`

  const details = [
    `<li><strong>Plan:</strong> ${escapeHtml(input.planName)}</li>`,
    intervalLabel ? `<li><strong>Billing:</strong> ${intervalLabel}</li>` : '',
    input.amountLabel
      ? `<li><strong>Amount:</strong> ${escapeHtml(input.amountLabel)}</li>`
      : '',
    input.periodEnd
      ? `<li><strong>Current period ends:</strong> ${escapeHtml(formatDate(input.periodEnd))}</li>`
      : '',
  ]
    .filter(Boolean)
    .join('')

  const html = `
<!DOCTYPE html>
<html>
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
  <body style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;">
    <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">BuildSAAS</p>
      <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">Subscription confirmed</h1>
      <p style="margin:0 0 16px;">Hi ${escapeHtml(name)}, thanks for subscribing. Your plan is active.</p>
      <ul style="margin:0 0 24px;padding-left:20px;">${details}</ul>
      <p style="margin:0 0 24px;">
        <a href="${appUrl}/settings" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
          Manage subscription
        </a>
      </p>
      <p style="margin:0;font-size:14px;color:#6b7280;">Questions? Reply to this email or visit Settings in the app.</p>
    </div>
  </body>
</html>`.trim()

  const text = [
    `Hi ${name},`,
    '',
    `Your ${input.planName} subscription is confirmed.`,
    intervalLabel ? `Billing: ${intervalLabel}` : null,
    input.amountLabel ? `Amount: ${input.amountLabel}` : null,
    input.periodEnd ? `Current period ends: ${formatDate(input.periodEnd)}` : null,
    '',
    `Manage subscription: ${appUrl}/settings`,
  ]
    .filter(Boolean)
    .join('\n')

  return { subject, html, text }
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
