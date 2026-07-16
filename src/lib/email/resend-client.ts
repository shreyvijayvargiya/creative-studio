import { Resend } from 'resend'

/**
 * Resend client kept for existing / future Resend-based flows.
 * Prefer Autosend SMTP (`autosend-smtp.ts`) for new transactional emails.
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function sendViaResend(input: {
  to: string | string[]
  subject: string
  html: string
  from?: string
}): Promise<{ id?: string }> {
  const resend = getResendClient()
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const from = input.from ?? process.env.RESEND_FROM_EMAIL?.trim()
  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is not configured')
  }

  const result = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  })

  if (result.error) {
    throw new Error(result.error.message)
  }

  return { id: result.data?.id }
}
